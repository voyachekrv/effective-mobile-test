import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import loggerMiddleware from './middlewares/logger-middleware';
import requestRouter from './routers/request-router';
import { register } from 'prom-client';
import { errorHandler } from './middlewares/error-handler-middleware';

const env = dotenv.config();
dotenvExpand.expand(env);

const app = express();
app.use(cors());
app.use(express.json());

app.use(errorHandler);
app.use(loggerMiddleware);

app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/request', requestRouter);

export default app;
