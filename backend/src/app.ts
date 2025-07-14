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
import env from '@/config/environment';
import { requestLogger } from '@/config/logger';
import setupSwagger from '@/config/swagger';

// Import middleware
import requestId from '@/middleware/request-id.middleware';
import errorHandler from '@/middleware/error-handler.middleware';

// Import API routes
import apiV1Routes from '@/api/v1/index';

// Import shared types and utilities
import { TApiSuccessResponse, TApiErrorResponse } from '@shared/types/api.types';
import { createSuccessResponse, createErrorResponse, HTTP_STATUS_CODES, ERROR_CODES } from '@/utils/api-response.utils';

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

// Configure CORS to allow frontend applications
const corsOrigins = [
  'http://localhost:5173', // Student frontend dev server
  'http://localhost:3000', // Admin frontend dev server (if any)
  'http://localhost:4173', // Student frontend preview server
  env.CORS_ORIGIN, // Environment-specified origins
].filter(Boolean); // Remove any undefined values

// Apply global middleware
app.use(requestId);
app.use(requestLogger);
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Correlation-ID', 
    'X-Request-ID',
    'X-Tenant-Context',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Correlation-ID', 'X-Request-ID'],
  credentials: true,
  optionsSuccessStatus: 200,
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
