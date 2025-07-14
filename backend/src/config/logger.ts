/**
 * @file config/logger.ts
 * @description Configures the application logger using Winston with enhanced TypeScript safety.
 */

import winston from 'winston';
import type { Request, Response, NextFunction } from 'express';
import type { RequestLogMetadata } from '@shared/types/logger.types';
import env from './environment';

// Define log format based on environment
const logFormat = env.IS_PRODUCTION
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        let logMessage = `${timestamp} ${level}: ${message}`;
        
        // Add metadata in development for better debugging
        if (Object.keys(meta).length > 0) {
          logMessage += ` ${JSON.stringify(meta, null, 2)}`;
        }
        
        return logMessage;
      })
    );

// Create Winston logger instance with appropriate log level
const logger = winston.createLogger({
  // Use debug level in development, or the configured level in production
  level: env.IS_PRODUCTION ? (env.LOG_LEVEL || 'info') : 'debug',
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
    
    // Create type-safe metadata object with only defined values
    const metadata: RequestLogMetadata = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration
    };

    // Add optional properties only if they have values
    if (req.ip) {
      metadata.ip = req.ip;
    }
    if (req.user?.id) {
      metadata.userId = req.user.id;
    }
    if (req.user?.tenantId) {
      metadata.tenantId = req.user.tenantId;
    }
    const userAgent = req.get('user-agent');
    if (userAgent) {
      metadata.userAgent = userAgent;
    }
    
    // Log based on status code with type-safe metadata
    if (res.statusCode >= 500) {
      logger.error(message, metadata);
    } else if (res.statusCode >= 400) {
      logger.warn(message, metadata);
    } else {
      logger.info(message, metadata);
    }
  });
  
  next();
};

export default logger;
