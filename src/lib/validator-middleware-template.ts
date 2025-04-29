import { NextFunction, Request, Response } from 'express';
import { ZodEffects, ZodObject } from 'zod';
import { ZodRawShape } from 'zod/lib/types';
import { HttpStatus } from './http-status';
import { HttpError } from './http-error';
import { ParsedQs } from 'qs';

/**
 * Шаблон миддлвейра для проверки на корректность входящего тела запроса
 * @param req `Request`-объект Express.js
 * @param _res `Response`-объект Express.js
 * @param next Передача управления следующему обработчику
 * @param schema Zod-схема тела запроса
 */
export const bodyValidatorMiddlewareTemplate = <T extends ZodRawShape>(
  req: Request,
  _res: Response,
  next: NextFunction,
  schema: ZodObject<T>
): void => {
  /* const result = schema.safeParse(req.body);

  if (!result.success) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      errors: result.error.errors.map(e => e.message)
    });
  } else {
    req.body = result.data;
    next();
  } */
  req.body = parseSchema(req.body, schema);
  next();
};

export const queryValidatorMiddlewareTemplate = <T extends ZodRawShape>(
  req: Request,
  _res: Response,
  next: NextFunction,
  schema: ZodObject<T> | ZodEffects<ZodObject<T>>
): void => {
  req.query = parseSchema<T, ParsedQs>(req.query, schema);
  next();
};

const parseSchema = <T extends ZodRawShape, R>(reqObject: R, schema: ZodObject<T> | ZodEffects<ZodObject<T>>): R => {
  const result = schema.safeParse(reqObject);

  if (!result.success) {
    throw new HttpError(HttpStatus.BAD_REQUEST, result.error.errors.map(e => e.message).join(', '));
  } else {
    return result.data as R;
  }
};
