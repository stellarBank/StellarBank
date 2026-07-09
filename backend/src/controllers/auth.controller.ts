import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger } from '../utils/logger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export class AuthController {
  private userService: UserService;
  private authService: AuthService;
  private notificationService: NotificationService;

  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService();
    this.notificationService = new NotificationService();
  }

  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Register new user account
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *               - countryCode
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 8
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               phone:
   *                 type: string
   *               countryCode:
   *                 type: string
   *                 pattern: '^[A-Z]{2}$'
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: User already exists
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { email, password, firstName, lastName, phone, countryCode } = req.body;

      // Check if user already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await this.userService.create({
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        countryCode,
        kycStatus: 'pending',
        kycLevel: 1,
        isActive: true,
        emailVerified: false,
        phoneVerified: false
      });

      // Generate email verification token
      const verificationToken = await this.authService.generateEmailVerificationToken(user.id);

      // Send verification email
      await this.notificationService.sendEmailVerification(email, verificationToken);

      // Send welcome SMS if phone provided
      if (phone) {
        await this.notificationService.sendWelcomeSMS(phone, firstName);
      }

      logger.info(`User registered successfully: ${email}`, { userId: user.id });

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          kycStatus: user.kycStatus,
          emailVerified: user.emailVerified
        }
      });

    } catch (error) {
      logger.error('Registration failed:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: 'An unexpected error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: User login
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *               twoFactorCode:
   *                 type: string
   *                 description: TOTP code if 2FA is enabled
   *     responses:
   *       200:
   *         description: Login successful
   *       400:
   *         description: Invalid credentials or 2FA required
   *       401:
   *         description: Authentication failed
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { email, password, twoFactorCode } = req.body;

      // Find user
      const user = await this.userService.findByEmail(email);
      if (!user) {
        res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid credentials'
        });
        return;
      }

      // Check if account is active
      if (!user.isActive) {
        res.status(401).json({
          error: 'Account disabled',
          message: 'Your account has been disabled. Please contact support.'
        });
        return;
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid credentials'
        });
        return;
      }

      // Check 2FA if enabled
      if (user.twoFaEnabled) {
        if (!twoFactorCode) {
          res.status(400).json({
            error: '2FA required',
            message: 'Two-factor authentication code is required'
          });
          return;
        }

        const twoFaValid = speakeasy.totp.verify({
          secret: user.twoFaSecret!,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2 // Allow 2 time steps of variance
        });

        if (!twoFaValid) {
          res.status(401).json({
            error: 'Invalid 2FA code',
            message: 'The two-factor authentication code is invalid'
          });
          return;
        }
      }

      // Generate tokens
      const tokens = await this.authService.generateTokens(user.id);

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Log successful login
      logger.info(`User logged in successfully: ${email}`, { 
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        message: 'Login successful',
        tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          kycStatus: user.kycStatus,
          kycLevel: user.kycLevel,
          twoFaEnabled: user.twoFaEnabled,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        }
      });

    } catch (error) {
      logger.error('Login failed:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'An unexpected error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          error: 'Refresh token required',
          message: 'Refresh token is required'
        });
        return;
      }

      // Verify and decode refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Find user
      const user = await this.userService.findById(decoded.userId);
      if (!user || !user.isActive) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'Refresh token is invalid or user account is disabled'
        });
        return;
      }

      // Generate new tokens
      const tokens = await this.authService.generateTokens(user.id);

      res.status(200).json({
        message: 'Token refreshed successfully',
        tokens
      });

    } catch (error) {
      logger.error('Token refresh failed:', error);
      res.status(401).json({
        error: 'Token refresh failed',
        message: 'Invalid or expired refresh token'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/2fa/enable:
   *   post:
   *     summary: Enable two-factor authentication
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 2FA setup instructions
   */
  async enable2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      
      const user = await this.userService.findById(userId);
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      if (user.twoFaEnabled) {
        res.status(400).json({
          error: '2FA already enabled',
          message: 'Two-factor authentication is already enabled for this account'
        });
        return;
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `StellarBank (${user.email})`,
        issuer: 'StellarBank'
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Store secret temporarily (not enabled until verified)
      await this.userService.updateTwoFaSecret(userId, secret.base32);

      res.status(200).json({
        message: '2FA setup initiated',
        secret: secret.base32,
        qrCode: qrCodeUrl,
        instructions: 'Scan the QR code with your authenticator app and verify with the generated code'
      });

    } catch (error) {
      logger.error('2FA enable failed:', error);
      res.status(500).json({
        error: '2FA setup failed',
        message: 'An unexpected error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/2fa/verify:
   *   post:
   *     summary: Verify and activate 2FA
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *             properties:
   *               code:
   *                 type: string
   *     responses:
   *       200:
   *         description: 2FA enabled successfully
   */
  async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { code } = req.body;

      const user = await this.userService.findById(userId);
      if (!user || !user.twoFaSecret) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'No pending 2FA setup found'
        });
        return;
      }

      // Verify code
      const verified = speakeasy.totp.verify({
        secret: user.twoFaSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (!verified) {
        res.status(400).json({
          error: 'Invalid code',
          message: 'The verification code is incorrect'
        });
        return;
      }

      // Enable 2FA
      await this.userService.enableTwoFa(userId);

      logger.info(`2FA enabled for user: ${user.email}`, { userId });

      res.status(200).json({
        message: '2FA enabled successfully',
        backupCodes: await this.authService.generateBackupCodes(userId)
      });

    } catch (error) {
      logger.error('2FA verification failed:', error);
      res.status(500).json({
        error: '2FA verification failed',
        message: 'An unexpected error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logged out successfully
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (token) {
        // Add token to blacklist
        await this.authService.blacklistToken(token);
      }

      logger.info(`User logged out: ${userId}`);

      res.status(200).json({
        message: 'Logged out successfully'
      });

    } catch (error) {
      logger.error('Logout failed:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'An unexpected error occurred'
      });
    }
  }
}