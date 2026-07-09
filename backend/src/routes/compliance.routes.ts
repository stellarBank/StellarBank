import { Router, Response } from 'express';
import { AuthedRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/AppError';

const router = Router();
const userService = new UserService();

// Simplified, deterministic limits by KYC level. This is a placeholder for
// real KYC/AML/sanctions screening (see contracts/README.md's note on the
// unimplemented compliance-oracle contract) — good enough to demo a tiered
// limit UX, not a real compliance engine.
const LIMITS_BY_LEVEL: Record<number, { dailyUsd: number; monthlyUsd: number }> = {
  1: { dailyUsd: 500, monthlyUsd: 2000 },
  2: { dailyUsd: 5000, monthlyUsd: 20000 },
  3: { dailyUsd: 50000, monthlyUsd: 200000 },
};

router.get('/status', async (req: AuthedRequest, res: Response) => {
  const user = await userService.findById(req.userId!);
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  const limits = LIMITS_BY_LEVEL[user.kycLevel] ?? LIMITS_BY_LEVEL[1];

  res.json({
    kycStatus: user.kycStatus,
    kycLevel: user.kycLevel,
    limits,
  });
});

export default router;
