import winston from 'winston';
import { config } from '../config/env.js';

const { combine, timestamp, json, colorize, simple } = winston.format;

/**
 * The app's only logger: JSON lines in production (easy to search in CloudWatch),
 * readable coloured lines in development, and silent during tests.
 */
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format:
    config.NODE_ENV === 'production' ? combine(timestamp(), json()) : combine(colorize(), simple()),
  transports: [
    // winston types its transports as interfaces, which this rule misreads; at runtime it is a real TransportStream.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-class-instance-assignment
    new winston.transports.Console({ silent: config.NODE_ENV === 'test' }),
  ],
});
