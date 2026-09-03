import { Router, Response } from 'express';
import { AuthedRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/AppError';

const router = Router();
const userService = new UserService();

router.get('/me', async (req: AuthedRequest, res: Response) => {
  const user = await userService.findById(req.userId!);
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    countryCode: user.countryCode,
    kycStatus: user.kycStatus,
    kycLevel: user.kycLevel,
    twoFaEnabled: user.twoFaEnabled,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt,
  });
});

export default router;
