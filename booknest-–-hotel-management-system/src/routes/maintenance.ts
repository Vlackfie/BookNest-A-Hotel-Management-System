import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/maintenance - List Tickets
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority } = req.query;
    const db = await getDb();

    let sql = `
      SELECT m.*, m.repair_cost as cost, r.room_number, u.full_name as reported_by_name, e.full_name as assigned_employee_name, e.full_name as employee_name
      FROM Maintenance m
      JOIN Rooms r ON m.room_id = r.id
      JOIN Users u ON m.reported_by_user_id = u.id
      LEFT JOIN Employees e ON m.assigned_employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND m.status = ?`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND m.priority = ?`;
      params.push(priority);
    }

    sql += ` ORDER BY m.id DESC`;

    const tickets = queryAll(db, sql, params);
    return res.json({ tickets });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch maintenance tickets.' });
  }
});

// POST /api/maintenance - Report Maintenance Issue
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { room_id, issue_description, priority } = req.body;
    if (!room_id || !issue_description) {
      return res.status(400).json({ error: 'Room and issue description are required.' });
    }

    const db = await getDb();
    const userId = req.user ? req.user.id : 1;

    executeRun(
      db,
      `INSERT INTO Maintenance (room_id, reported_by_user_id, issue_description, priority, status)
       VALUES (?, ?, ?, ?, 'Open')`,
      [Number(room_id), userId, issue_description, priority || 'Medium']
    );

    // Update Room status to Maintenance
    executeRun(db, `UPDATE Rooms SET status = 'Maintenance' WHERE id = ?`, [Number(room_id)]);

    return res.status(201).json({ message: 'Maintenance issue reported successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to report maintenance issue.' });
  }
});

// PUT /api/maintenance/:id - Assign & Update Status
router.put('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Maintenance Staff'), async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const { assigned_employee_id, assigned_to, status, repair_cost, cost } = req.body;
    const empId = assigned_employee_id || assigned_to;
    const rCost = repair_cost !== undefined ? repair_cost : cost;

    const db = await getDb();
    const ticket = queryOne(db, `SELECT * FROM Maintenance WHERE id = ?`, [ticketId]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    // Business Rule #9: Maintenance requests must be assigned before completion.
    if (status === 'Completed' && !empId && !ticket.assigned_employee_id) {
      return res.status(400).json({ error: 'BUSINESS RULE VIOLATION: Maintenance ticket must be assigned to an employee before completing.' });
    }

    const resolvedAt = status === 'Completed' ? new Date().toISOString() : null;

    executeRun(
      db,
      `UPDATE Maintenance
       SET assigned_employee_id = COALESCE(?, assigned_employee_id),
           status = COALESCE(?, status),
           repair_cost = COALESCE(?, repair_cost),
           resolved_at = COALESCE(?, resolved_at)
       WHERE id = ?`,
      [empId || null, status, rCost !== undefined ? Number(rCost) : undefined, resolvedAt, ticketId]
    );

    // If completed, check if room can be released back to 'Available' or 'Cleaning'
    if (status === 'Completed') {
      executeRun(db, `UPDATE Rooms SET status = 'Cleaning', is_clean = 0 WHERE id = ? AND status = 'Maintenance'`, [ticket.room_id]);
    }

    return res.json({ message: 'Maintenance ticket updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update maintenance ticket.' });
  }
});

export default router;
