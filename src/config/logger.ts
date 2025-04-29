import pino from 'pino';

/**
 * Логгер, настроенный с использованием библиотеки `pino`.
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
});

export default logger;
