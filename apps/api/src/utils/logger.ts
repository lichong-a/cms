import { pino } from 'pino';

const createLoggerOptions = () => {
  const isDev = process.env['NODE_ENV'] === 'development';

  return {
    level: process.env['LOG_LEVEL'] || 'info',
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  };
};

export const logger = pino(createLoggerOptions());

export default logger;
