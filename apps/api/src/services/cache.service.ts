import { createClient } from 'redis';

import logger from '../utils/logger';

let isConnected = false;

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

const getRedisUrl = (): string => {
  return process.env['REDIS_URL'] || 'redis://localhost:6379';
};

export const getRedisClient = (): RedisClient => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: getRedisUrl(),
    socket: {
      reconnectStrategy: false, // 禁用自动重连
    },
  });

  redisClient.on('error', () => {
    if (!isConnected) {
      // 只记录一次错误
      logger.warn('⚠️  Redis connection failed. Caching will be disabled.');
      isConnected = false;
    }
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected successfully');
    isConnected = true;
  });

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  try {
    await getRedisClient().connect();
    isConnected = true;
  } catch {
    logger.warn('⚠️  Redis connection failed. Caching will be disabled.');
    // 不抛出错误，允许应用继续运行
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (isConnected && redisClient) {
    await redisClient.quit();
    logger.info('Redis disconnected');
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!isConnected) return null;
  try {
    const value = await getRedisClient().get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error({ error }, 'Cache get error');
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<void> => {
  if (!isConnected) return;
  try {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await getRedisClient().setEx(key, ttlSeconds, stringValue);
    } else {
      await getRedisClient().set(key, stringValue);
    }
  } catch (error) {
    logger.error({ error }, 'Cache set error');
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  if (!isConnected) return;
  try {
    await getRedisClient().del(key);
  } catch (error) {
    logger.error({ error }, 'Cache del error');
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  if (!isConnected) return;
  try {
    const keys = await getRedisClient().keys(pattern);
    if (keys.length > 0) {
      await getRedisClient().del(keys);
    }
  } catch (error) {
    logger.error({ error }, 'Cache delPattern error');
  }
};

export default {
  connectRedis,
  disconnectRedis,
  getClient: getRedisClient,
  get: cacheGet,
  set: cacheSet,
  del: cacheDel,
  delPattern: cacheDelPattern,
};
