import { Counter, Histogram, register } from 'prom-client';

/**
 * Счетчик успешных вызовов метода
 */
export const successCounter = new Counter({
  name: 'controller_success_count',
  help: 'Number of successful method calls',
  labelNames: ['controller', 'method']
});

/**
 * Счетчик неуспешных вызовов метода
 */
export const errorCounter = new Counter({
  name: 'controller_error_count',
  help: 'Number of failed method calls',
  labelNames: ['controller', 'method']
});

/**
 * Счетчик времени отработки метода
 */
export const durationHistogram = new Histogram({
  name: 'controller_duration_seconds',
  help: 'Duration of method calls in seconds',
  labelNames: ['controller', 'method'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});
