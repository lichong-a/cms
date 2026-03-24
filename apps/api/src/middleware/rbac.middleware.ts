import { type Response, type NextFunction } from 'express';

import { prisma } from '../services/database.service';
import { error } from '../utils/response';

import { type AuthRequest } from './auth.middleware';

export const requireRole = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        error(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        return;
      }

      const userRoles = await prisma.user_roles.findMany({
        where: { user_id: req.user.userId },
        include: { roles: true },
      });

      const hasRole = userRoles.some((ur) => roles.includes(ur.roles.name));

      if (!hasRole) {
        error(res, 'Forbidden - Insufficient permissions', 'FORBIDDEN', 403);
        return;
      }

      next();
    } catch {
      error(res, 'Authorization check failed', 'FORBIDDEN', 403);
      return;
    }
  };
};

export const requirePermission = (...permissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        error(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        return;
      }

      const userRoles = await prisma.user_roles.findMany({
        where: { user_id: req.user.userId },
        include: {
          roles: {
            include: {
              role_permissions: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      });

      const userPermissions = userRoles.flatMap((ur) =>
        ur.roles.role_permissions.map((rp) => rp.permissions.name)
      );

      const hasAllPermissions = permissions.every((p) => userPermissions.includes(p));

      if (!hasAllPermissions) {
        error(res, 'Forbidden - Insufficient permissions', 'FORBIDDEN', 403);
        return;
      }

      next();
    } catch {
      error(res, 'Authorization check failed', 'FORBIDDEN', 403);
      return;
    }
  };
};

export default { requireRole, requirePermission };
