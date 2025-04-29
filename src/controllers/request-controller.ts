import { Request, Response } from 'express';
import { RequestService } from '../services/request/request-service';
import { logMessage } from '../lib/log-message';
import logger from '../config/logger';
import { RequestCreateDto } from '../schemas/request/request-create-schema';
import { HttpStatus } from '../lib/http-status';
import { RequestClosingDto } from '../schemas/request/request-closing-schema';
import { RequestQuery } from '../schemas/request/request-query-schema';

const service = new RequestService();
const msg = logMessage('request-controller');

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  logger.info({ query: req.query }, msg('Find all requests'));

  const response = await service.findAll(req.query as RequestQuery);

  logger.info({ response }, msg('Requests found'));

  res.status(HttpStatus.OK).json(response);
};

/**
 * Создание нового обращения и его получение
 */
export const createRequest = async (req: Request, res: Response): Promise<void> => {
  logger.info({ body: req.body }, msg('Create new Request'));

  const response = await service.create(req.body as RequestCreateDto);

  logger.info({ response }, msg('New Request created'));

  res.status(HttpStatus.CREATED).json(response);
};

/**
 * Перевод обращения в работу (перевод статуса во "В работе").
 */
export const startRequest = async (req: Request, res: Response): Promise<void> => {
  logger.info({ id: req.params.id }, msg('Start Request'));

  const response = await service.start(req.params.id);

  logger.info({ id: req.params.id }, msg('Request started'));

  res.status(HttpStatus.OK).json(response);
};

/**
 * Завершение обработки обращения (перевод статуса в "Завершено")
 */
export const completeRequest = async (req: Request, res: Response): Promise<void> => {
  logger.info({ id: req.params.id, dto: req.body }, msg('Complete Request'));

  const response = await service.complete(req.params.id, req.body as RequestClosingDto);

  logger.info({ id: req.params.id }, msg('Request completed'));

  res.status(HttpStatus.OK).json(response);
};

/**
 * Отмена обращения (перевод статуса в "Завершено")
 */
export const cancelRequest = async (req: Request, res: Response): Promise<void> => {
  logger.info({ id: req.params.id, dto: req.body }, msg('Cancel Request'));

  const response = await service.cancel(req.params.id, req.body as RequestClosingDto);

  logger.info({ id: req.params.id }, msg('Request canceled'));

  res.status(HttpStatus.OK).json(response);
};

/**
 * Отмена всех обращений, которые находятся в статусе "В работе"
 */
export const cancelAllInProgressRequests = async (req: Request, res: Response): Promise<void> => {
  logger.info(msg('Cancel all `IN_PROGRESS` requests'));

  const response = await service.cancelAllInProgress();

  logger.info(response, msg('All `IN_PROGRESS` requests canceled'));

  res.status(HttpStatus.OK).json(response);
};
