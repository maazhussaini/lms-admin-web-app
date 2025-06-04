/**
 * @file middleware/error-handler.middleware.ts
 * @description Global error handling middleware for Express.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/api-error.utils.js';
import { createErrorResponse } from '@/utils/api-response.utils.js';
import logger from '@/config/logger.js';
import env from '@/config/environment.js';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    correlationId: req.id,
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      createErrorResponse(
        err.message,
        err.statusCode,
        err.errorCode,
        err.details,
        req.id,
        req.path
      )
    );
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    // Handle specific Prisma error codes
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json(
          createErrorResponse(
            'Resource already exists',
            409,
            'CONFLICT',
            { [err.meta?.target as string || 'field']: ['Must be unique'] },
            req.id,
            req.path
          )
        );
      case 'P2025': // Record not found
        return res.status(404).json(
          createErrorResponse(
            'Resource not found',
            404,
            'NOT_FOUND',
            undefined,
            req.id,
            req.path
          )
        );
      case 'P2003': // Foreign key constraint violation
        return res.status(400).json(
          createErrorResponse(
            'Invalid relationship',
            400,
            'INVALID_RELATIONSHIP',
            { [err.meta?.field_name as string || 'field']: ['Invalid reference'] },
            req.id,
            req.path
          )
        );
      default:
        return res.status(500).json(
          createErrorResponse(
            'Database error',
            500,
            'DATABASE_ERROR',
            undefined,
            req.id,
            req.path
          )
        );
    }
  }

  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json(
      createErrorResponse(
        'Validation error',
        400,
        'VALIDATION_ERROR',
        undefined,
        req.id,
        req.path
      )
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      createErrorResponse(
        'Invalid token',
        401,
        'INVALID_TOKEN',
        undefined,
        req.id,
        req.path
      )
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      createErrorResponse(
        'Token expired',
        401,
        'TOKEN_EXPIRED',
        undefined,
        req.id,
        req.path
      )
    );
  }

  // Handle SyntaxError (usually from JSON parsing)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json(
      createErrorResponse(
        'Invalid JSON',
        400,
        'INVALID_JSON',
        undefined,
        req.id,
        req.path
      )
    );
  }

  // Default error handler for unhandled errors
  const statusCode = 500;
  const message = env.IS_PRODUCTION
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return res.status(statusCode).json(
    createErrorResponse(
      message,
      statusCode,
      'INTERNAL_SERVER_ERROR',
      undefined,
      req.id,
      req.path
    )
  );
};

export default errorHandler;
