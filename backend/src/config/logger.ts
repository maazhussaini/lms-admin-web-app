/**
 * @file config/logger.ts
 * @description Configures the application logger using Winston.
 */

import winston from 'winston';
import type { Request, Response, NextFunction } from 'express';
import env from './environment.js';

// Define log format based on environment
const logFormat = env.IS_PRODUCTION
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    );

// Create Winston logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'lms-backend' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// Add file transports in production
if (env.IS_PRODUCTION) {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  );
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

// Add request logging middleware for Express
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log on request completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(message, { 
        ip: req.ip, 
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
        userAgent: req.get('user-agent'),
        requestId: req.id
      });
    } else if (res.statusCode >= 400) {
      logger.warn(message, { 
        ip: req.ip, 
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
        userAgent: req.get('user-agent'),
        requestId: req.id
      });
    } else {
      logger.info(message, { 
        ip: req.ip, 
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
        requestId: req.id
      });
    }
  });
  
  next();
};

export default logger;
