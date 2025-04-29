import Redis from 'ioredis';

/**
 * Клиент для Redis
 */
export const redis = new Redis(Number(process.env.REDIS_PORT) || 6379, process.env.REDIS_HOST || '127.0.0.1', {
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD || 'admin',
  db: Number(process.env.REDIS_DATABASE) || 0
});
