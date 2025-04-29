import { z } from 'zod';
import { bodyValidatorMiddlewareTemplate } from '../../lib/validator-middleware-template';
import { NextFunction, Request, Response } from 'express';

const RequestClosingDtoSchema = z.object({
  closingText: z.string().min(1, { message: 'Text of closing reason is required' })
});

/**
 * Миддлвейр для валидации схемы добавления текста, описывающего результат закрытия обращения
 */
export const requestClosingSchemaValidation = (req: Request, res: Response, next: NextFunction) => {
  bodyValidatorMiddlewareTemplate(req, res, next, RequestClosingDtoSchema);
};

/**
 * Схема добавления текста, описывающего результат закрытия обращения
 */
export type RequestClosingDto = z.infer<typeof RequestClosingDtoSchema>;
