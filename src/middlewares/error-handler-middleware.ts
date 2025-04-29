import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { HttpStatus } from '../lib/http-status';
import { HttpError } from '../lib/http-error';

/**
 * Миддлвейр обработки HTTP ошибки
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    logger.error({ err, req }, err.message);

    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message
    });
  } else {
    logger.error({ err, req }, 'Unhandled error occurred');

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: err.message
    });
  }
};
