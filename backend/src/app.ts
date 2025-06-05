/**
 * @file app.ts
 * @description Express application setup and configuration.
 */

import express, { Request, Response, NextFunction } from 'express';
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
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
  },
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
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'LMS API is running',
    data: {
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(env.API_BASE_URL, apiV1Routes);

// Setup Swagger documentation
setupSwagger(app);

// Add Socket.IO documentation route
app.get('/socket-docs', (req: Request, res: Response) => {
  try {
    const socketDocPath = path.join(__dirname, '../../documentation/socket-io-implementation.md');
    
    if (fs.existsSync(socketDocPath)) {
      res.sendFile(socketDocPath);
    } else {
      res.status(404).send('Socket.IO documentation not found');
    }
  } catch (error) {
    res.status(500).send('Error serving Socket.IO documentation');
  }
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Cannot ${req.method} ${req.path}`,
    errorCode: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path,
    correlationId: req.id,
  });
});

// Error handling middleware (cast to express.ErrorRequestHandler)
app.use(errorHandler as unknown as import('express').ErrorRequestHandler);

export default app;
