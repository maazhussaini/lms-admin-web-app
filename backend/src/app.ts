/**
 * @file app.ts
 * @description Express application setup and configuration.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import configuration
import env from '@/config/environment.js';
import { requestLogger } from '@/config/logger.js';
import setupSwagger from '@/config/swagger.js';

// Import middleware
import requestId from '@/middleware/request-id.middleware.js';
import errorHandler from '@/middleware/error-handler.middleware.js';

// Import API routes
import apiV1Routes from '@/api/v1/index.js';

// Import shared types and utilities
import { TApiSuccessResponse, TApiErrorResponse } from '@shared/types/api.types.js';
import { createSuccessResponse, createErrorResponse, HTTP_STATUS_CODES, ERROR_CODES } from '@/utils/api-response.utils.js';

// Get directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();

// Configure rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: createErrorResponse(
    'Too many requests, please try again later',
    HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
    ERROR_CODES.RATE_LIMIT_EXCEEDED
  ),
});

// Apply global middleware
app.use(requestId);
app.use(requestLogger);
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Request-ID'],
  exposedHeaders: ['X-Correlation-ID'],
  credentials: true,
}));
app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Apply rate limiting to all API routes
app.use(`${env.API_BASE_URL}`, limiter);

// API health check route
app.get('/health', (_req: Request, res: Response) => {
  const healthData = {
    version: process.env['npm_package_version'] || '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  const response: TApiSuccessResponse<typeof healthData> = createSuccessResponse(
    healthData,
    'LMS API is running',
    HTTP_STATUS_CODES.OK
  );

  res.status(HTTP_STATUS_CODES.OK).json(response);
});

// API routes
app.use(env.API_BASE_URL, apiV1Routes);

// Setup Swagger documentation
setupSwagger(app);

// Add Socket.IO documentation route
app.get('/socket-docs', (_req: Request, res: Response) => {
  try {
    const socketDocPath = path.join(__dirname, '../../documentation/socket-io-implementation.md');
    
    if (fs.existsSync(socketDocPath)) {
      res.sendFile(socketDocPath);
    } else {
      const errorResponse: TApiErrorResponse = createErrorResponse(
        'Socket.IO documentation not found',
        HTTP_STATUS_CODES.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json(errorResponse);
    }
  } catch (error) {
    const errorResponse: TApiErrorResponse = createErrorResponse(
      'Error serving Socket.IO documentation',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  const errorResponse: TApiErrorResponse = createErrorResponse(
    `Cannot ${req.method} ${req.path}`,
    HTTP_STATUS_CODES.NOT_FOUND,
    ERROR_CODES.NOT_FOUND,
    undefined,
    req.id,
    req.path
  );

  res.status(HTTP_STATUS_CODES.NOT_FOUND).json(errorResponse);
});

// Error handling middleware (cast to express.ErrorRequestHandler)
app.use(errorHandler as unknown as import('express').ErrorRequestHandler);

export default app;
