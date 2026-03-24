import { type Request, type Response, type NextFunction } from 'express';

import { isTokenBlacklisted } from '../services/auth.service';
import { tokenService } from '../services/token.service';
import { error } from '../utils/response';

import { createError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    username: string;
    role?: string;
    tenantId?: string;
  };
  token?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Unauthorized - No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    // 检查 Access Token 是否在黑名单中（已登出）
    if (isTokenBlacklisted(token)) {
      return error(res, 'Token has been revoked', 'TOKEN_REVOKED', 401);
    }

    // 使用 tokenService 验证 Access Token
    const decoded = await tokenService.verifyAccessToken(token);
    
    if (!decoded) {
      return error(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
    }
    
    req.user = decoded;
    req.token = token;
    next();
  } catch {
    return error(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await tokenService.verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch {
    next();
  }
};

export default { authenticate, optionalAuth };
