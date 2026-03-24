import { PrismaClient } from '@prisma/client';

import logger from '../utils/logger';

let prismaClient: PrismaClient | null = null;

const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  client.$on('query', (e) => {
    logger.debug({ query: e.query, duration: e.duration });
  });

  client.$on('error', (e) => {
    logger.error({ prismaError: e.message });
  });

  client.$on('warn', (e) => {
    logger.warn({ prismaWarn: e.message });
  });

  return client;
};

export const getPrismaClient = (): PrismaClient => {
  if (!prismaClient) {
    prismaClient = createPrismaClient();
  }

  return prismaClient;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client as unknown as object, prop, receiver);

    return typeof value === 'function' ? value.bind(client) : value;
  },
}) as PrismaClient;

export const connectDatabase = async (): Promise<void> => {
  try {
    await getPrismaClient().$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error({ error }, '❌ Database connection failed');
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (!prismaClient) {
    return;
  }

  await prismaClient.$disconnect();
  logger.info('Database disconnected');
};

export default prisma;
