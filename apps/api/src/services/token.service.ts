import * as jose from 'jose';

import logger from '../utils/logger';

import { getRedisClient } from './cache.service';
import { prisma } from './database.service';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7天

let accessTokenKey: Uint8Array;
let refreshTokenKey: Uint8Array;

const getAccessTokenSecret = (): string => {
  return process.env['JWT_SECRET'] || 'cms-jwt-secret-change-in-production';
};

const getRefreshTokenSecret = (): string => {
  return process.env['JWT_REFRESH_SECRET'] || 'cms-refresh-secret-change-in-production';
};

const getAccessTokenKey = (): Uint8Array => {
  if (!accessTokenKey) {
    accessTokenKey = new TextEncoder().encode(getAccessTokenSecret());
  }
  return accessTokenKey;
};

const getRefreshTokenKey = (): Uint8Array => {
  if (!refreshTokenKey) {
    refreshTokenKey = new TextEncoder().encode(getRefreshTokenSecret());
  }
  return refreshTokenKey;
};

export interface TokenPayload {
  userId: number;
  email: string;
  username: string;
  role?: string;
  tenantId?: string;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: string; // 唯一标识，用于撤销
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access Token 过期时间（秒）
}

const toJWTPayload = <T>(payload: T): jose.JWTPayload & T => {
  return payload as jose.JWTPayload & T;
};

const buildTokenPayload = (payload: {
  userId: number;
  email: string;
  username: string;
  role?: string | undefined;
  tenantId?: string | undefined;
}): TokenPayload => {
  return payload as TokenPayload;
};

class TokenService {
  /**
   * 生成 Access Token（15分钟有效期）
   */
  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return await new jose.SignJWT(toJWTPayload(buildTokenPayload(payload)))
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(getAccessTokenKey());
  }

  /**
   * 生成 Refresh Token（7天有效期，存储到 Redis）
   */
  async generateRefreshToken(userId: number): Promise<string> {
    const tokenId = crypto.randomUUID();
    const payload: RefreshTokenPayload = { userId, tokenId };
    
    const refreshToken = await new jose.SignJWT(toJWTPayload(payload))
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${REFRESH_TOKEN_EXPIRY_SECONDS}s`)
      .sign(getRefreshTokenKey());

    // 存储到 Redis
    try {
      await getRedisClient().setEx(
        `refresh:${userId}`,
        REFRESH_TOKEN_EXPIRY_SECONDS,
        JSON.stringify({ tokenId, token: refreshToken })
      );
    } catch (error) {
      logger.error({ error }, 'Failed to store refresh token in Redis');
      // 继续执行，Redis 不可用时仍然返回 token
    }

    return refreshToken;
  }

  /**
   * 生成 Token 对（Access + Refresh）
   */
  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload.userId);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15分钟 = 900秒
    };
  }

  /**
   * 验证 Access Token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jose.jwtVerify(token, getAccessTokenKey());
      return payload as unknown as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * 验证 Refresh Token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      // 1. JWT 格式验证
      const { payload } = await jose.jwtVerify(token, getRefreshTokenKey());
      const decoded = payload as unknown as RefreshTokenPayload;

      // 2. 检查 Redis 中是否存在
      try {
        const stored = await getRedisClient().get(`refresh:${decoded.userId}`);
        if (!stored) {
          // Redis 中没有，可能是 Redis 连接失败导致登录时未存储
          // 降级策略：只验证 JWT（仍有过期时间保护）
          logger.warn('Refresh token not found in Redis, validating JWT only');
          return decoded;
        }

        const storedData = JSON.parse(stored);
        if (storedData.tokenId !== decoded.tokenId) {
          return null;
        }
      } catch {
        // Redis 不可用时，只验证 JWT
        logger.warn('Redis unavailable, skipping refresh token storage check');
      }

      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * 撤销 Refresh Token（登出时调用）
   */
  async revokeRefreshToken(userId: number): Promise<void> {
    try {
      await getRedisClient().del(`refresh:${userId}`);
    } catch (error) {
      logger.error({ error }, 'Failed to revoke refresh token');
    }
  }

  /**
   * 刷新 Token 对
   * @param refreshToken 旧的 refresh token
   * @returns 新的 token 对，如果验证失败返回 null
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    // 1. 验证 refresh token
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    // 2. 获取用户信息
    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
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

    if (!user || !user.isActive) {
      // 用户不存在或已禁用，撤销 token
      await this.revokeRefreshToken(payload.userId);
      return null;
    }

    // 3. 生成新的 token 对
    const tokenPayload = buildTokenPayload({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.user_roles[0]?.roles.name,
      tenantId: user.tenant_id,
    });

    return await this.generateTokenPair(tokenPayload);
  }

  /**
   * 检查 Redis 连接状态
   */
  isRedisConnected(): boolean {
    return getRedisClient().isOpen;
  }
}

// 导出单例
export const tokenService = new TokenService();
export default tokenService;
