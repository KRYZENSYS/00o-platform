/**
 * Logger utility — pino wrapper
 */
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
    : undefined,
  base: { service: '00o-api', env: process.env.NODE_ENV },
  redact: ['req.headers.authorization', '*.password', '*.token'],
});

export default logger;
