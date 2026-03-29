import { Router } from 'express';
import { z } from 'zod';

import { authenticate, type AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as authService from '../services/auth.service';
import { success } from '../utils/response';

const router: ReturnType<typeof Router> = Router();

// 验证 schemas
const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    avatarUrl: z.string().url().optional().nullable(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
});

// 注册
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const tenantId = req.tenantId || 'default';
    const result = await authService.register(req.body, tenantId);
    success(res, result, 201);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 登录
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login({
      ...req.body,
      tenantId: req.tenantId || 'default',
    });
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 登出
router.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = req.token || '';
    const result = await authService.logout(req.user.userId, token);
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// Token 刷新（使用 Refresh Token，不需要 authenticate）
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.body?.refreshToken;
    
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }
    
    const result = await authService.refreshToken(refreshToken);
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 获取当前用户信息
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const profile = await authService.getProfile(req.user.userId);
    success(res, profile);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 更新用户信息
router.put('/profile', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const result = await authService.updateProfile(req.user.userId, req.body);
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 修改密码
router.put('/password', authenticate, validate(changePasswordSchema), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const result = await authService.changePassword(req.user.userId, req.body);
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

export default router;
