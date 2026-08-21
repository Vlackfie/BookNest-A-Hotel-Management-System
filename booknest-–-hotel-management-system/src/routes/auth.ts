import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, queryOne, queryAll, executeRun } from '../db/database';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginIdentifier = req.body.email || req.body.username;
    const { password } = req.body;
    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDb();
    const user = queryOne(
      db,
      `SELECT u.*, r.role_name 
       FROM Users u 
       JOIN Roles r ON u.role_id = r.id 
       WHERE (u.email = ? OR u.username = ?) AND u.is_active = 1`,
      [loginIdentifier, loginIdentifier]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Update last login
    executeRun(db, `UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      full_name: user.full_name
    };

    const token = generateToken(payload);

    return res.json({
      message: 'Login successful',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
    const db = await getDb();
    const user = queryOne(
      db,
      `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.role_id, r.role_name, u.created_at, u.last_login 
       FROM Users u JOIN Roles r ON u.role_id = r.id WHERE u.id = ?`,
      [req.user.id]
    );
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/switch-role (Demo / Testing helper for fast context switching)
router.post('/switch-role', async (req: Request, res: Response) => {
  try {
    const { role_name } = req.body;
    const db = await getDb();
    const user = queryOne(
      db,
      `SELECT u.*, r.role_name 
       FROM Users u JOIN Roles r ON u.role_id = r.id 
       WHERE r.role_name = ? LIMIT 1`,
      [role_name]
    );

    if (!user) {
      return res.status(404).json({ error: `User with role '${role_name}' not found.` });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      full_name: user.full_name
    };

    const token = generateToken(payload);
    return res.json({
      message: `Switched to ${role_name} profile`,
      token,
      user: payload
    });
  } catch (err) {
    return res.status(500).json({ error: 'Role switch failed.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }

    const db = await getDb();
    const user = queryOne(db, `SELECT password_hash FROM Users WHERE id = ?`, [req.user!.id]);
    if (!user || !user.password_hash || !bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    executeRun(db, `UPDATE Users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newHash, req.user!.id]);

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

export default router;
