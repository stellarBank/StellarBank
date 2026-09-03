import { AppError } from './AppError';

describe('AppError', () => {
  it('sets code, message, and statusCode', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);

    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
  });

  it('defaults statusCode to 400 when not provided', () => {
    const err = new AppError('BAD_INPUT', 'Invalid input');

    expect(err.statusCode).toBe(400);
  });
});
