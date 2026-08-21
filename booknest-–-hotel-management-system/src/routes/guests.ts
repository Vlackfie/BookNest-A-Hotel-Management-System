import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/guests - Search & List Guests
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    const db = await getDb();

    let sql = `SELECT * FROM Guests WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR nid_passport LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY id DESC`;
    const guests = queryAll(db, sql, params);
    return res.json({ guests });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch guests.' });
  }
});

// GET /api/guests/:id - Guest Profile & Booking History
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const guestId = Number(req.params.id);
    const db = await getDb();

    const guest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    if (!guest) return res.status(404).json({ error: 'Guest not found.' });

    const bookings = queryAll(
      db,
      `SELECT b.*, r.room_number, rt.name as room_type_name
       FROM Bookings b
       JOIN Rooms r ON b.room_id = r.id
       JOIN RoomTypes rt ON r.room_type_id = rt.id
       WHERE b.guest_id = ?
       ORDER BY b.id DESC`,
      [guestId]
    );

    return res.json({ guest, bookings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch guest details.' });
  }
});

// POST /api/guests - Register Guest
router.post('/', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const { first_name, last_name, email, phone, nid_passport, emergency_contact, address, vip_status } = req.body;
    if (!first_name || !last_name || !email || !phone || !nid_passport) {
      return res.status(400).json({ error: 'First name, last name, email, phone, and NID/Passport are required.' });
    }

    const db = await getDb();
    const existingPhone = queryOne(db, `SELECT id FROM Guests WHERE phone = ?`, [phone.trim()]);
    if (existingPhone) {
      return res.status(400).json({ error: `A guest with phone number "${phone}" is already registered.` });
    }
    const existing = queryOne(db, `SELECT id FROM Guests WHERE email = ? OR nid_passport = ?`, [email.trim(), nid_passport.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'A guest with this email or NID/Passport already exists.' });
    }

    const resRun = executeRun(
      db,
      `INSERT INTO Guests (first_name, last_name, email, phone, nid_passport, emergency_contact, address, vip_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, nid_passport, emergency_contact || '', address || '', vip_status ? 1 : 0]
    );

    const newGuest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [resRun.lastInsertRowid]);
    return res.status(201).json({ message: 'Guest registered successfully', guest: newGuest });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register guest.' });
  }
});

// PUT /api/guests/:id - Edit Guest
router.put('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const guestId = Number(req.params.id);
    const { first_name, last_name, email, phone, nid_passport, emergency_contact, address, vip_status } = req.body;

    const db = await getDb();
    const existingGuest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    if (!existingGuest) {
      return res.status(404).json({ error: 'Guest not found.' });
    }

    if (phone && phone.trim()) {
      const existingPhone = queryOne(db, `SELECT id FROM Guests WHERE phone = ? AND id != ?`, [phone.trim(), guestId]);
      if (existingPhone) {
        return res.status(400).json({ error: `Phone number "${phone}" is already registered to another guest.` });
      }
    }
    if (email && email.trim()) {
      const existingEmail = queryOne(db, `SELECT id FROM Guests WHERE email = ? AND id != ?`, [email.trim(), guestId]);
      if (existingEmail) {
        return res.status(400).json({ error: `Email address "${email}" is already registered to another guest.` });
      }
    }
    if (nid_passport && nid_passport.trim()) {
      const existingNid = queryOne(db, `SELECT id FROM Guests WHERE nid_passport = ? AND id != ?`, [nid_passport.trim(), guestId]);
      if (existingNid) {
        return res.status(400).json({ error: `NID/Passport "${nid_passport}" is already registered to another guest.` });
      }
    }

    const updatedFirstName = first_name !== undefined ? first_name.trim() : existingGuest.first_name;
    const updatedLastName = last_name !== undefined ? last_name.trim() : existingGuest.last_name;
    const updatedEmail = email !== undefined ? email.trim() : existingGuest.email;
    const updatedPhone = phone !== undefined ? phone.trim() : existingGuest.phone;
    const updatedNid = nid_passport !== undefined ? nid_passport.trim() : existingGuest.nid_passport;
    const updatedEmerg = emergency_contact !== undefined ? emergency_contact.trim() : existingGuest.emergency_contact;
    const updatedAddr = address !== undefined ? address.trim() : existingGuest.address;
    const updatedVip = vip_status !== undefined ? (vip_status ? 1 : 0) : existingGuest.vip_status;

    executeRun(
      db,
      `UPDATE Guests
       SET first_name = ?,
           last_name = ?,
           email = ?,
           phone = ?,
           nid_passport = ?,
           emergency_contact = ?,
           address = ?,
           vip_status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [updatedFirstName, updatedLastName, updatedEmail, updatedPhone, updatedNid, updatedEmerg, updatedAddr, updatedVip, guestId]
    );

    const updated = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    return res.json({ message: 'Guest updated successfully', guest: updated });
  } catch (err) {
    console.error('Error updating guest:', err);
    return res.status(500).json({ error: 'Failed to update guest profile.' });
  }
});

// DELETE /api/guests/:id
router.delete('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const guestId = Number(req.params.id);
    const db = await getDb();

    const guest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    if (!guest) return res.status(404).json({ error: 'Guest not found.' });

    // Check if active bookings exist
    const activeBooking = queryOne(db, `SELECT id FROM Bookings WHERE guest_id = ? AND status IN ('Confirmed', 'Checked-In')`, [guestId]);
    if (activeBooking) {
      return res.status(400).json({ error: 'Cannot delete guest with active or upcoming reservations. Please check out or cancel the reservation first.' });
    }

    // Clean up dependent bookings, check-ins & payments for clean cascade
    const bookings = queryAll(db, `SELECT id FROM Bookings WHERE guest_id = ?`, [guestId]);
    for (const b of bookings) {
      executeRun(db, `DELETE FROM CheckIns WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Payments WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Bookings WHERE id = ?`, [b.id]);
    }

    executeRun(db, `DELETE FROM Guests WHERE id = ?`, [guestId]);
    return res.json({ message: 'Guest deleted successfully.' });
  } catch (err) {
    console.error('Error deleting guest:', err);
    return res.status(500).json({ error: 'Failed to delete guest.' });
  }
});

export default router;



