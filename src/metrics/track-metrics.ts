import { Request, Response, NextFunction } from 'express';
import { durationHistogram, successCounter, errorCounter } from './metrics-registry';
import { errorHandler } from '../middlewares/error-handler-middleware';

/**
 * Обертка, задающая отслеживание метрик выполнения методов контроллера
 * @param controllerName Имя контроллера
 * @param methodName Имя метода
 * @param fn Оборачиваемая функция
 */
export const trackMetrics = (controllerName: string, methodName: string, fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const end = durationHistogram.startTimer({
      controller: controllerName,
      method: methodName
    });

    try {
      await fn(req, res, next);
      successCounter.inc({ controller: controllerName, method: methodName });
      end();
    } catch (err) {
      errorCounter.inc({ controller: controllerName, method: methodName });
      end();
      errorHandler(err as Error, req, res, next);
    }
  };
};
