import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').isString().notEmpty(),
    body('lastName').isString().notEmpty(),
    body('countryCode').isString().isLength({ min: 2, max: 2 }),
  ],
  (req: Parameters<typeof controller.register>[0], res: Parameters<typeof controller.register>[1]) =>
    controller.register(req, res)
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  (req: Parameters<typeof controller.login>[0], res: Parameters<typeof controller.login>[1]) =>
    controller.login(req, res)
);

router.post('/refresh', (req, res) => controller.refresh(req, res));
router.post('/logout', authMiddleware, (req, res) => controller.logout(req, res));
router.post('/2fa/enable', authMiddleware, (req, res) => controller.enable2FA(req, res));
router.post('/2fa/verify', authMiddleware, (req, res) => controller.verify2FA(req, res));

export default router;
