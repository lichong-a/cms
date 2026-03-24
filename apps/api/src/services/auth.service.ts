import { createError } from '../middleware/error.middleware';
import { hashPassword, comparePassword } from '../utils/password';

import { prisma } from './database.service';
import { tokenService, type TokenPayload } from './token.service';

const buildTokenPayload = (payload: {
  userId: number;
  email: string;
  username: string;
  role?: string | undefined;
  tenantId?: string | undefined;
}): TokenPayload => {
  return payload as TokenPayload;
};

// Access Token 黑名单（短期，用于 logout 后立即失效）
const accessTokenBlacklist = new Set<string>();

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  tenantId?: string;
}

export interface UpdateProfileInput {
  username?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// 检查 Access Token 是否在黑名单中
export const isTokenBlacklisted = (token: string): boolean => {
  return accessTokenBlacklist.has(token);
};

// 将 Access Token 加入黑名单
export const addAccessTokenToBlacklist = (token: string): void => {
  accessTokenBlacklist.add(token);
  // 自动清理（每1000个清理一次，Access Token 15分钟过期，不需要长期存储）
  if (accessTokenBlacklist.size > 1000) {
    accessTokenBlacklist.clear();
  }
};

export const register = async (input: RegisterInput, tenantId: string = 'default') => {
  const { username, email, password } = input;

  // 检查用户是否已存在（租户内）
  const existingUser = await prisma.users.findFirst({
    where: {
      tenant_id: tenantId,
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw createError('User already exists', 409, 'USER_ALREADY_EXISTS');
  }

  // 创建用户
  const passwordHash = await hashPassword(password);
  const user = await prisma.users.create({
    data: {
      username,
      email,
      passwordHash,
      tenant_id: tenantId,
      updated_at: new Date(),
    },
  });

  // 生成双 Token
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };
  const tokens = await tokenService.generateTokenPair(buildTokenPayload(tokenPayload));

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.created_at,
    },
    ...tokens,
  };
};

export const login = async (input: LoginInput) => {
  const { email, password, tenantId = 'default' } = input;

  // 查找用户
  const user = await prisma.users.findUnique({
    where: { tenant_id_email: { tenant_id: tenantId, email } },
    include: {
      user_roles: {
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
      },
    },
  });

  if (!user) {
    throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 验证密码
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 检查用户是否激活
  if (!user.isActive) {
    throw createError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  // 生成双 Token
  const tokenPayload = buildTokenPayload({
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.user_roles[0]?.roles.name,
    tenantId: user.tenant_id,
  });
  const tokens = await tokenService.generateTokenPair(tokenPayload);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.created_at,
      roles: user.user_roles.map((ur) => ur.roles.name),
      permissions: user.user_roles.flatMap((ur) =>
        ur.roles.role_permissions.map((rp) => rp.permissions.name)
      ),
    },
    ...tokens,
  };
};

export const getProfile = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      user_roles: {
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
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    roles: user.user_roles.map((ur) => ur.roles.name),
    permissions: user.user_roles.flatMap((ur) =>
      ur.roles.role_permissions.map((rp) => rp.permissions.name)
    ),
  };
};

export const updateProfile = async (userId: number, input: UpdateProfileInput) => {
  const { username, email, avatarUrl } = input;

  // 如果要更新用户名或邮箱，检查唯一性
  if (username || email) {
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw createError('Username already taken', 409, 'USERNAME_EXISTS');
      }
      if (existingUser.email === email) {
        throw createError('Email already in use', 409, 'EMAIL_EXISTS');
      }
    }
  }

  // 更新用户信息
  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      ...(username && { username }),
      ...(email && { email }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    updatedAt: user.updated_at,
  };
};

export const changePassword = async (userId: number, input: ChangePasswordInput) => {
  const { currentPassword, newPassword } = input;

  // 查找用户
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  // 验证当前密码
  const isValid = await comparePassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw createError('Current password is incorrect', 401, 'INVALID_PASSWORD');
  }

  // 更新密码
  const passwordHash = await hashPassword(newPassword);
  await prisma.users.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password changed successfully' };
};

export const logout = async (userId: number, accessToken: string) => {
  // 1. 将 Access Token 加入黑名单（立即失效）
  addAccessTokenToBlacklist(accessToken);
  
  // 2. 撤销 Refresh Token
  await tokenService.revokeRefreshToken(userId);
  
  return { message: 'Logged out successfully' };
};

export const refreshToken = async (refreshToken: string) => {
  // 使用 TokenService 刷新
  const tokens = await tokenService.refreshTokens(refreshToken);
  
  if (!tokens) {
    throw createError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
  
  return tokens;
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  isTokenBlacklisted,
};
