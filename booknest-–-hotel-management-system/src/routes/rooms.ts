import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/rooms - List all rooms with filter & search
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, type_id, floor, search } = req.query;
    const db = await getDb();

    let sql = `
      SELECT r.*, rt.name as room_type_name, rt.capacity, rt.amenities
      FROM Rooms r
      JOIN RoomTypes rt ON r.room_type_id = rt.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (type_id) {
      sql += ` AND r.room_type_id = ?`;
      params.push(Number(type_id));
    }
    if (floor) {
      sql += ` AND r.floor = ?`;
      params.push(Number(floor));
    }
    if (search) {
      sql += ` AND (r.room_number LIKE ? OR rt.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY r.floor ASC, r.room_number ASC`;

    const rooms = queryAll(db, sql, params);
    return res.json({ rooms });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch rooms.' });
  }
});

// GET /api/rooms/types - List Room Types
router.get('/types', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const roomTypes = queryAll(db, `SELECT * FROM RoomTypes ORDER BY base_price ASC`);
    return res.json({ roomTypes });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch room types.' });
  }
});

// POST /api/rooms - Add Room
router.post('/', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const { room_number, room_type_id, floor, price_per_night, notes } = req.body;
    if (!room_number || !room_type_id || !price_per_night) {
      return res.status(400).json({ error: 'Room number, type, and price per night are required.' });
    }

    const db = await getDb();
    // Check if room number exists
    const existing = queryOne(db, `SELECT id FROM Rooms WHERE room_number = ?`, [room_number]);
    if (existing) {
      return res.status(400).json({ error: `Room number ${room_number} already exists.` });
    }

    const resRun = executeRun(
      db,
      `INSERT INTO Rooms (room_number, room_type_id, floor, status, price_per_night, is_clean, notes) VALUES (?, ?, ?, 'Available', ?, 1, ?)`,
      [room_number, Number(room_type_id), Number(floor || 1), Number(price_per_night), notes || '']
    );

    const newRoom = queryOne(db, `SELECT r.*, rt.name as room_type_name FROM Rooms r JOIN RoomTypes rt ON r.room_type_id = rt.id WHERE r.id = ?`, [resRun.lastInsertRowid]);

    return res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (err: any) {
    console.error('Error creating room:', err);
    return res.status(500).json({ error: 'Failed to create room.' });
  }
});

// PUT /api/rooms/:id - Edit Room
router.put('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist', 'Housekeeping Staff', 'Maintenance Staff'), async (req: AuthRequest, res: Response) => {
  try {
    const roomId = Number(req.params.id);
    const { room_number, room_type_id, floor, status, price_per_night, is_clean, notes } = req.body;

    const db = await getDb();
    const existing = queryOne(db, `SELECT * FROM Rooms WHERE id = ?`, [roomId]);
    if (!existing) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    if (room_number && String(room_number).trim() !== String(existing.room_number).trim()) {
      const existingNum = queryOne(db, `SELECT id FROM Rooms WHERE room_number = ? AND id != ?`, [String(room_number).trim(), roomId]);
      if (existingNum) {
        return res.status(400).json({ error: `Room number ${room_number} already exists.` });
      }
    }

    const updatedRoomNumber = room_number !== undefined ? String(room_number).trim() : existing.room_number;
    const updatedRoomTypeId = room_type_id !== undefined ? Number(room_type_id) : existing.room_type_id;
    const updatedFloor = floor !== undefined ? Number(floor) : existing.floor;
    const updatedStatus = status !== undefined ? status : existing.status;
    const updatedPrice = price_per_night !== undefined ? Number(price_per_night) : existing.price_per_night;
    const updatedClean = is_clean !== undefined ? (is_clean ? 1 : 0) : (updatedStatus === 'Available' ? 1 : existing.is_clean);
    const updatedNotes = notes !== undefined ? notes : existing.notes;

    executeRun(
      db,
      `UPDATE Rooms 
       SET room_number = ?,
           room_type_id = ?,
           floor = ?,
           status = ?,
           price_per_night = ?,
           is_clean = ?,
           notes = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [updatedRoomNumber, updatedRoomTypeId, updatedFloor, updatedStatus, updatedPrice, updatedClean, updatedNotes, roomId]
    );

    const updated = queryOne(db, `SELECT r.*, rt.name as room_type_name FROM Rooms r JOIN RoomTypes rt ON r.room_type_id = rt.id WHERE r.id = ?`, [roomId]);
    return res.json({ message: 'Room updated successfully', room: updated });
  } catch (err: any) {
    console.error('Error updating room:', err);
    return res.status(500).json({ error: 'Failed to update room.' });
  }
});

// DELETE /api/rooms/:id - Delete Room
router.delete('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const roomId = Number(req.params.id);
    const db = await getDb();

    // Check if active bookings exist
    const activeBooking = queryOne(db, `SELECT id FROM Bookings WHERE room_id = ? AND status IN ('Confirmed', 'Checked-In')`, [roomId]);
    if (activeBooking) {
      return res.status(400).json({ error: 'Cannot delete room with active or upcoming reservations.' });
    }

    // Clean up past reference records
    executeRun(db, `DELETE FROM Housekeeping WHERE room_id = ?`, [roomId]);
    executeRun(db, `DELETE FROM Maintenance WHERE room_id = ?`, [roomId]);
    const pastBookings = queryAll(db, `SELECT id FROM Bookings WHERE room_id = ?`, [roomId]);
    for (const b of pastBookings) {
      executeRun(db, `DELETE FROM CheckIns WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Payments WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Bookings WHERE id = ?`, [b.id]);
    }

    executeRun(db, `DELETE FROM Rooms WHERE id = ?`, [roomId]);
    return res.json({ message: 'Room deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting room:', err);
    return res.status(500).json({ error: 'Failed to delete room.' });
  }
});

export default router;
