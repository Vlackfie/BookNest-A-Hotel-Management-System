import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/services - Catalog
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const services = queryAll(db, `SELECT * FROM Services WHERE is_active = 1 ORDER BY category ASC, name ASC`);
    return res.json({ services });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// GET /api/services/requests - List Service Orders
router.get('/requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, status } = req.query;
    const db = await getDb();

    let sql = `
      SELECT sr.*, s.name as service_name, s.category, b.booking_code, r.room_number, g.first_name || ' ' || g.last_name as guest_name
      FROM ServiceRequests sr
      JOIN Services s ON sr.service_id = s.id
      JOIN Bookings b ON sr.booking_id = b.id
      JOIN Rooms r ON b.room_id = r.id
      JOIN Guests g ON b.guest_id = g.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (booking_id) {
      sql += ` AND sr.booking_id = ?`;
      params.push(Number(booking_id));
    }
    if (status) {
      sql += ` AND sr.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY sr.id DESC`;
    const requests = queryAll(db, sql, params);
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch service requests.' });
  }
});

// POST /api/services/requests - Create Service Request for Booking
router.post('/requests', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, service_id, quantity, notes } = req.body;
    if (!booking_id || !service_id) {
      return res.status(400).json({ error: 'Booking ID and service ID are required.' });
    }

    const db = await getDb();
    const service = queryOne(db, `SELECT * FROM Services WHERE id = ?`, [Number(service_id)]);
    if (!service) return res.status(404).json({ error: 'Selected service not found.' });

    const qty = Number(quantity || 1);
    const totalPrice = service.price * qty;

    const resRun = executeRun(
      db,
      `INSERT INTO ServiceRequests (booking_id, service_id, quantity, unit_price, total_price, status, notes)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [Number(booking_id), Number(service_id), qty, service.price, totalPrice, notes || '']
    );

    return res.status(201).json({ message: 'Service request submitted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create service request.' });
  }
});

// PUT /api/services/requests/:id - Update Request Status
router.put('/requests/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    const db = await getDb();
    const completedAt = status === 'Completed' ? new Date().toISOString() : null;

    executeRun(
      db,
      `UPDATE ServiceRequests SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?`,
      [status, completedAt, requestId]
    );

    return res.json({ message: 'Service request status updated.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update service request.' });
  }
});

export default router;
