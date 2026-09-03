import { logger } from '../utils/logger';

/**
 * Hackathon MVP stub: logs what would be sent instead of calling a real
 * email/SMS provider. Swap the bodies of these methods for Nodemailer/Twilio
 * (etc.) calls when wiring up real delivery — the call sites in
 * AuthController don't need to change.
 */
export class NotificationService {
  async sendEmailVerification(email: string, token: string): Promise<void> {
    logger.info('(stub) Would send verification email', { email, token });
  }

  async sendWelcomeSMS(phone: string, firstName: string): Promise<void> {
    logger.info('(stub) Would send welcome SMS', { phone, firstName });
  }
}
