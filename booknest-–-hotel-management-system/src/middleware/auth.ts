import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RoleName } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'booknest_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role_id: number;
    role_name: RoleName;
    full_name: string;
  };
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

export function authorizeRoles(...allowedRoles: RoleName[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (allowedRoles.includes(req.user.role_name) || req.user.role_name === 'Owner') {
      return next();
    }

    return res.status(403).json({
      error: `Access forbidden. Role '${req.user.role_name}' does not have permission for this module.`
    });
  };
}
