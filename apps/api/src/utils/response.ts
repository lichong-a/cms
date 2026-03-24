import { type Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

export const success = <T>(res: Response, data: T, statusCode = 200): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
};

export const error = (
  res: Response,
  message: string,
  code = 'UNKNOWN_ERROR',
  statusCode = 500,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
};

export const paginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response => {
  const totalPages = Math.ceil(total / limit);
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
  return res.status(200).json(response);
};

export default { success, error, paginated };
