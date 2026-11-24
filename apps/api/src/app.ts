import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config/env.js';
import { JSON_BODY_LIMIT } from './constants/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { createApiRouter } from './routes/index.js';

/** Builds the Express app. Kept apart from server.ts so tests can use it without opening a port. */
export function createApp() {
  const app = express();
  app.set('trust proxy', config.TRUST_PROXY);

  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGINS }));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use('/api', createApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
