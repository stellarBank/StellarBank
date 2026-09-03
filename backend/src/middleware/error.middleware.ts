import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Unhandled application error', { error: err.message, stack: err.stack });
    }
    res.status(err.statusCode).json({ error: err.code, message: err.message });
    return;
  }

  logger.error('Unexpected error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
  });
}
