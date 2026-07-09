import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config, db } from '../config/database';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing bearer token' });
    return;
  }

  const blacklisted = db.prepare('SELECT 1 FROM token_blacklist WHERE token = ?').get(token);
  if (blacklisted) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token has been revoked' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}
