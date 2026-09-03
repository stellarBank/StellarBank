import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { config } from '../config/database';

describe('AuthService', () => {
  const authService = new AuthService();

  describe('generateTokens', () => {
    it('issues an access and refresh token that both encode the userId', async () => {
      const { accessToken, refreshToken, expiresIn } = await authService.generateTokens('user-123');

      const accessPayload = jwt.verify(accessToken, config.jwtSecret) as jwt.JwtPayload;
      const refreshPayload = jwt.verify(refreshToken, config.jwtRefreshSecret) as jwt.JwtPayload;

      expect(accessPayload.userId).toBe('user-123');
      expect(refreshPayload.userId).toBe('user-123');
      expect(expiresIn).toBe(config.jwtExpiresIn);
    });

    it('rejects the access token when verified with the refresh secret', async () => {
      const { accessToken } = await authService.generateTokens('user-123');

      expect(() => jwt.verify(accessToken, config.jwtRefreshSecret)).toThrow();
    });
  });

  describe('generateEmailVerificationToken', () => {
    it('encodes the userId and a single-purpose marker', async () => {
      const token = await authService.generateEmailVerificationToken('user-456');
      const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

      expect(payload.userId).toBe('user-456');
      expect(payload.purpose).toBe('email_verification');
    });
  });

  describe('generateBackupCodes', () => {
    it('generates 8 unique hex codes', async () => {
      const codes = await authService.generateBackupCodes('user-789');

      expect(codes).toHaveLength(8);
      expect(new Set(codes).size).toBe(8);
      codes.forEach((code) => expect(code).toMatch(/^[0-9a-f]{10}$/));
    });
  });

  describe('blacklistToken', () => {
    it('persists the token so it is not inserted twice without error', async () => {
      await expect(authService.blacklistToken('some.jwt.token')).resolves.not.toThrow();
      await expect(authService.blacklistToken('some.jwt.token')).resolves.not.toThrow();
    });
  });
});
