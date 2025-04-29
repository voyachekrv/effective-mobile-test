import { z } from 'zod';
import { queryValidatorMiddlewareTemplate } from '../../lib/validator-middleware-template';
import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';

const RequestQuerySchema = z
  .object({
    date: z
      .string()
      .refine(val => isValidDate(val), { message: 'Date format should be `yyyy-MM-dd`' })
      .optional(),
    from: z
      .string()
      .refine(val => isValidDate(val), { message: '`from` Date format should be `yyyy-MM-dd`' })
      .optional(),
    to: z
      .string()
      .refine(val => isValidDate(val), { message: '`to` Date format should be `yyyy-MM-dd`' })
      .optional(),
    take: z.coerce.number().int().min(0).default(10).optional(),
    skip: z.coerce.number().int().min(0).default(0).optional()
  })
  .refine(
    data => {
      const hasDate = Boolean(data.date);
      const hasRange = Boolean(data.from) || Boolean(data.to);

      return !(hasDate && hasRange);
    },
    { message: 'You can\'t use "date" and "from"/"to" at the same time' }
  );

/**
 * Миддлвейр для валидации схемы поиска обращений
 */
export const requestQueryValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  queryValidatorMiddlewareTemplate(req, res, next, RequestQuerySchema);
};

/**
 * Схема поиска обращений
 */
export type RequestQuery = z.infer<typeof RequestQuerySchema>;

/**
 * Проверка формата даты
 */
const isValidDate = (dateString: string | undefined): boolean => {
  if (dateString) {
    return DateTime.fromFormat(dateString, 'yyyy-MM-dd').isValid;
  }

  return true;
};
