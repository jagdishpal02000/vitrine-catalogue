import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './infra/logger.js';

const server = createApp().listen(config.PORT, (error) => {
  if (error) throw error;
  logger.info(`Vitrine API listening on port ${config.PORT}`);
});

// Docker and ECS stop containers with SIGTERM: finish in-flight requests, then exit.
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});
