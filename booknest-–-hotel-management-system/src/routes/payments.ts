import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/payments - List Payments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, search } = req.query;
    const db = await getDb();

    let sql = `
      SELECT p.*, b.booking_code, g.first_name || ' ' || g.last_name as guest_name, u.full_name as created_by_name
      FROM Payments p
      JOIN Bookings b ON p.booking_id = b.id
      JOIN Guests g ON b.guest_id = g.id
      JOIN Users u ON p.created_by_user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (booking_id) {
      sql += ` AND p.booking_id = ?`;
      params.push(Number(booking_id));
    }
    if (search) {
      sql += ` AND (p.transaction_id LIKE ? OR b.booking_code LIKE ? OR g.first_name LIKE ? OR g.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY p.id DESC`;

    const payments = queryAll(db, sql, params);
    return res.json({ payments });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch payments.' });
  }
});

// POST /api/payments - Record Payment
router.post('/', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, amount, payment_method, notes } = req.body;
    if (!booking_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'Booking ID, amount, and payment method are required.' });
    }

    const db = await getDb();
    const booking = queryOne(db, `SELECT id FROM Bookings WHERE id = ?`, [Number(booking_id)]);
    if (!booking) return res.status(404).json({ error: 'Associated booking not found.' });

    const transactionId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const userId = req.user ? req.user.id : 1;

    const resRun = executeRun(
      db,
      `INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id, is_refund, notes, created_by_user_id)
       VALUES (?, ?, ?, 'Paid', ?, 0, ?, ?)`,
      [Number(booking_id), Number(amount), payment_method, transactionId, notes || '', userId]
    );

    const payment = queryOne(db, `SELECT * FROM Payments WHERE id = ?`, [resRun.lastInsertRowid]);
    return res.status(201).json({ message: 'Payment recorded successfully', payment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record payment.' });
  }
});

// POST /api/payments/refund - Process Refund (Requires Manager or Owner approval)
router.post('/refund', authenticateToken, authorizeRoles('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, amount, notes } = req.body;
    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'Booking ID and refund amount are required.' });
    }

    const db = await getDb();
    const transactionId = `RFD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const userId = req.user ? req.user.id : 1;

    executeRun(
      db,
      `INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id, is_refund, notes, created_by_user_id)
       VALUES (?, ?, 'Cash', 'Refunded', ?, 1, ?, ?)`,
      [Number(booking_id), Number(amount), transactionId, `APPROVED REFUND: ${notes || 'Manager approved'}`, userId]
    );

    return res.json({ message: 'Refund approved and recorded successfully.', transaction_id: transactionId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process refund.' });
  }
});

export default router;



