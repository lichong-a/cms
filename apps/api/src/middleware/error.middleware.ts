import { type Request, type Response, type NextFunction } from 'express';

import logger from '../utils/logger';
import { error } from '../utils/response';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal Server Error';

  logger.error({
    error: {
      code,
      message,
      statusCode,
      stack: err.stack,
      details: err.details,
    },
  });

  return error(res, message, code, statusCode, err.details);
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return error(res, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND', 404);
};

export const createError = (
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: any
): AppError => {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  err.details = details;
  return err;
};

export default { errorHandler, notFoundHandler, createError };
