import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getDb, queryAll, queryOne, executeRun, saveDb } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/system/logs - Activity Logs
router.get('/logs', authenticateToken, authorizeRoles('Owner'), async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const logs = queryAll(
      db,
      `SELECT a.*, u.username, r.role_name
       FROM ActivityLogs a
       JOIN Users u ON a.user_id = u.id
       JOIN Roles r ON u.role_id = r.id
       ORDER BY a.id DESC LIMIT 100`
    );
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch activity logs.' });
  }
});

// GET /api/system/notifications - Unread Notifications
router.get('/notifications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const notifications = queryAll(
      db,
      `SELECT * FROM Notifications 
       WHERE (role_target IS NULL OR role_target = ?) 
       ORDER BY id DESC LIMIT 20`,
      [req.user ? req.user.role_name : 'Owner']
    );
    return res.json({ notifications });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PUT /api/system/notifications/:id/read - Mark Read
router.put('/notifications/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    executeRun(db, `UPDATE Notifications SET is_read = 1 WHERE id = ?`, [id]);
    return res.json({ message: 'Marked as read.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// GET /api/system/settings - System Settings
router.get('/settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const settings = queryAll(db, `SELECT * FROM SystemSettings ORDER BY category ASC`);
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch system settings.' });
  }
});

// PUT /api/system/settings - Update System Settings
router.put('/settings', authenticateToken, authorizeRoles('Owner'), async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body; // Array of { setting_key, setting_value }
    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: 'Settings array is required.' });
    }

    const db = await getDb();
    for (const item of settings) {
      executeRun(
        db,
        `UPDATE SystemSettings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?`,
        [item.setting_value, item.setting_key]
      );
    }

    return res.json({ message: 'System settings updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// GET /api/system/sql-script - Deliverable MySQL SQL Script
router.get('/sql-script', async (req: AuthRequest, res: Response) => {
  try {
    const sqlPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      return res.type('text/plain').send(sqlContent);
    }
    return res.status(404).send('-- MySQL Schema file not found.');
  } catch (err) {
    return res.status(500).send('-- Error loading SQL script.');
  }
});

export default router;



