import { Router } from 'express';
import {
  cancelAllInProgressRequests,
  cancelRequest,
  completeRequest,
  createRequest,
  getAllRequests,
  startRequest
} from '../controllers/request-controller';
import { requestCreateSchemaValidation } from '../schemas/request/request-create-schema';
import { trackMetrics } from '../metrics/track-metrics';
import { requestClosingSchemaValidation } from '../schemas/request/request-closing-schema';
import { requestQueryValidatorMiddleware } from '../schemas/request/request-query-schema';

/** Маршрутизатор для контроллера обращений */
const requestRouter = Router();

const CONTROLLER_NAME = 'request-controller';

requestRouter.get(
  '/',
  requestQueryValidatorMiddleware,
  trackMetrics(CONTROLLER_NAME, 'getAllRequests', getAllRequests)
);
requestRouter.post('/', requestCreateSchemaValidation, trackMetrics(CONTROLLER_NAME, 'createRequest', createRequest));
requestRouter.post('/:id/start', trackMetrics(CONTROLLER_NAME, 'startRequest', startRequest));
requestRouter.post(
  '/:id/complete',
  requestClosingSchemaValidation,
  trackMetrics(CONTROLLER_NAME, 'completeRequest', completeRequest)
);
requestRouter.post(
  '/:id/cancel',
  requestClosingSchemaValidation,
  trackMetrics(CONTROLLER_NAME, 'cancelRequest', cancelRequest)
);

requestRouter.post(
  '/cancel-all-in-progress',
  trackMetrics(CONTROLLER_NAME, 'cancelAllInProgressRequests', cancelAllInProgressRequests)
);

export default requestRouter;
