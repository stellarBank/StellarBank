import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config, db } from '../config/database';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthService {
  async generateTokens(userId: string): Promise<TokenPair> {
    const accessToken = jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
    const refreshToken = jwt.sign({ userId }, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken, expiresIn: config.jwtExpiresIn };
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    // Short-lived, single-purpose token; not persisted since the MVP
    // notification service doesn't actually deliver email (see
    // NotificationService).
    return jwt.sign({ userId, purpose: 'email_verification' }, config.jwtSecret, {
      expiresIn: '24h',
    });
  }

  async blacklistToken(token: string): Promise<void> {
    db.prepare('INSERT OR IGNORE INTO token_blacklist (token) VALUES (?)').run(token);
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    void userId;
    return Array.from({ length: 8 }, () => crypto.randomBytes(5).toString('hex'));
  }
}
