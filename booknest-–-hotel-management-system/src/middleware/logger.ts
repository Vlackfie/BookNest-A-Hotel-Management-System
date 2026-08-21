import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { getDb, executeRun } from '../db/database';

export function logActivity(action: string, module: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Capture user details if authenticated
    const userId = req.user ? req.user.id : 1;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        try {
          const db = await getDb();
          const details = `${req.method} ${req.originalUrl} - Status ${res.statusCode}`;
          executeRun(db, 
            `INSERT INTO ActivityLogs (user_id, action, module, details, ip_address) VALUES (?, ?, ?, ?, ?);`,
            [userId, action, module, details, String(ip)]
          );
        } catch (err) {
          console.error("Failed to insert activity log:", err);
        }
      }
    });

    next();
  };
}



