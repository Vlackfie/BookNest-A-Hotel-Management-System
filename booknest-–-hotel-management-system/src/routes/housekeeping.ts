import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/housekeeping - List Schedules
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, date } = req.query;
    const db = await getDb();

    let sql = `
      SELECT h.*, r.room_number, e.full_name as housekeeper_name, e.full_name as employee_name
      FROM Housekeeping h
      JOIN Rooms r ON h.room_id = r.id
      LEFT JOIN Employees e ON h.assigned_employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND h.status = ?`;
      params.push(status);
    }
    if (date) {
      sql += ` AND h.scheduled_date = ?`;
      params.push(date);
    }

    sql += ` ORDER BY h.id DESC`;

    const schedules = queryAll(db, sql, params);
    return res.json({ schedules });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch housekeeping schedules.' });
  }
});

// POST /api/housekeeping - Assign Cleaning Task
router.post('/', authenticateToken, authorizeRoles('Owner', 'Manager', 'Housekeeping Staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { room_id, assigned_employee_id, housekeeper_id, scheduled_date, notes } = req.body;
    const employeeId = assigned_employee_id || housekeeper_id;
    if (!room_id || !employeeId || !scheduled_date) {
      return res.status(400).json({ error: 'Room, assigned employee, and scheduled date are required.' });
    }

    const db = await getDb();
    const resRun = executeRun(
      db,
      `INSERT INTO Housekeeping (room_id, assigned_employee_id, scheduled_date, status, notes)
       VALUES (?, ?, ?, 'Pending', ?)`,
      [Number(room_id), Number(employeeId), scheduled_date, notes || '']
    );

    // Update Room status to 'Cleaning' and is_clean = 0
    executeRun(db, `UPDATE Rooms SET status = 'Cleaning', is_clean = 0 WHERE id = ?`, [Number(room_id)]);

    return res.status(201).json({ message: 'Housekeeping task assigned successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to assign housekeeping task.' });
  }
});

// PUT /api/housekeeping/:id/status - Update Cleaning Status
router.put('/:id/status', authenticateToken, authorizeRoles('Owner', 'Manager', 'Housekeeping Staff'), async (req: AuthRequest, res: Response) => {
  try {
    const taskId = Number(req.params.id);
    const { status, notes } = req.body;

    const db = await getDb();
    const task = queryOne(db, `SELECT room_id FROM Housekeeping WHERE id = ?`, [taskId]);
    if (!task) return res.status(404).json({ error: 'Housekeeping task not found.' });

    const completedAt = status === 'Completed' ? new Date().toISOString() : null;

    executeRun(
      db,
      `UPDATE Housekeeping SET status = ?, notes = COALESCE(?, notes), completed_at = ? WHERE id = ?`,
      [status, notes, completedAt, taskId]
    );

    // If completed, set Room is_clean = 1 and status = 'Available'
    if (status === 'Completed') {
      executeRun(db, `UPDATE Rooms SET is_clean = 1, status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [task.room_id]);
    }

    return res.json({ message: 'Cleaning status updated.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update cleaning status.' });
  }
});

export default router;



