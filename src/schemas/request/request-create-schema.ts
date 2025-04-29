import { z } from 'zod';
import { bodyValidatorMiddlewareTemplate } from '../../lib/validator-middleware-template';
import { NextFunction, Request, Response } from 'express';

const RequestCreateDtoSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required' }),
  description: z.string().min(1, { message: 'Description is required' })
});

/**
 * Миддлвейр для валидации схемы создания нового обращения
 */
export const requestCreateSchemaValidation = (req: Request, res: Response, next: NextFunction) => {
  bodyValidatorMiddlewareTemplate(req, res, next, RequestCreateDtoSchema);
};

/**
 * Схема создания нового обращения
 */
export type RequestCreateDto = z.infer<typeof RequestCreateDtoSchema>;
