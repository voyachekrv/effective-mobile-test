import pinoHttp from 'pino-http';
import logger from '../config/logger';

/**
 * Миддлвейр для логирования http-вызовов
 */
const loggerMiddleware = pinoHttp({ logger });

export default loggerMiddleware;
