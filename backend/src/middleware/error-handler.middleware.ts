/**
 * @file middleware/error-handler.middleware.ts
 * @description Global error handling middleware for Express.
 * Handles various error types and returns standardized error responses.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError as ApiValidationError } from '@/utils/api-error.utils.js';
import { createErrorResponse } from '@/utils/api-response.utils.js';
import logger from '@/config/logger.js';
import env from '@/config/environment.js';
import { 
  PrismaClientKnownRequestError, 
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError
} from '@prisma/client/runtime/library';
import { TApiErrorResponse } from '@shared/types';
import { validationResult } from 'express-validator';

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses conforming to TApiErrorResponse
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response<TApiErrorResponse> => {
  // Log the error with structured metadata
  logError(err, req);

  // Handle ApiError instances (application-specific errors)
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

  // Handle Prisma database errors
  if (err instanceof PrismaClientKnownRequestError) {
    return handlePrismaKnownRequestError(err, req, res);
  }

  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json(
      createErrorResponse(
        'Database validation error',
        400,
        'VALIDATION_ERROR',
        { _error: [err.message.split('\n').pop() || 'Invalid data format'] },
        req.id,
        req.path
      )
    );
  }

  if (err instanceof PrismaClientInitializationError) {
    logger.error('Database initialization error:', err);
    return res.status(503).json(
      createErrorResponse(
        'Service temporarily unavailable',
        503,
        'DATABASE_UNAVAILABLE',
        undefined,
        req.id,
        req.path
      )
    );
  }

  if (err instanceof PrismaClientRustPanicError || 
      err instanceof PrismaClientUnknownRequestError) {
    logger.error('Critical database error:', err);
    return res.status(500).json(
      createErrorResponse(
        'Critical database error',
        500,
        'DATABASE_ERROR',
        undefined,
        req.id,
        req.path
      )
    );
  }
  // Handle Express Validator errors
  if (Array.isArray(err) && err.length > 0 && typeof err[0] === 'object' && err[0] !== null && 'msg' in err[0] && 'param' in err[0]) {
    const validationErrors: Record<string, string[]> = {};
    
    err.forEach((error: any) => {
      const key = error.param || 'general';
      if (!validationErrors[key]) {
        validationErrors[key] = [];
      }
      validationErrors[key].push(error.msg);
    });

    return res.status(422).json(
      createErrorResponse(
        'Validation failed',
        422,
        'VALIDATION_ERROR',
        validationErrors,
        req.id,
        req.path
      )
    );
  }

  // Handle express-validator errors passed from validation middleware
  if (err instanceof ApiValidationError) {
    return res.status(422).json(
      createErrorResponse(
        err.message,
        422,
        err.errorCode,
        err.details,
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

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json(
      createErrorResponse(
        'Invalid JSON in request body',
        400,
        'INVALID_JSON',
        undefined,
        req.id,
        req.path
      )
    );
  }  // Handle rate limit errors
  if (err.name === 'RateLimitExceeded' || (err.message && err.message.includes('rate limit'))) {
    const retryAfter = (err as any).headers?.['retry-after'] || '60';
    return res.status(429).json(
      createErrorResponse(
        'Too many requests',
        429,
        'RATE_LIMIT_EXCEEDED',
        { retryAfter: [retryAfter] },
        req.id,
        req.path
      )
    );
  }

  // Handle URI malformed errors
  if (err.name === 'URIError') {
    return res.status(400).json(
      createErrorResponse(
        'Invalid URI',
        400,
        'INVALID_URI',
        undefined,
        req.id,
        req.path
      )
    );
  }
  // Default error handler for unhandled errors
  // Default error handler for unhandled errors
  const statusCode = 500;
  const errorCode = 'INTERNAL_SERVER_ERROR';
  
  // Provide more detailed error info in non-production environments
  let message = 'Internal server error';
  let details: Record<string, string[]> | undefined = undefined;
  
  if (!env.IS_PRODUCTION) {
    message = err.message || 'Internal server error';
    
    // Include stack trace in development for easier debugging
    if (err.stack) {
      details = {
        stack: [err.stack.split('\n')[0]], // Just the first line of stack for brevity
        type: [err.constructor.name]
      };
    }
  }

  return res.status(statusCode).json(
    createErrorResponse(
      message,
      statusCode,
      errorCode,
      details,
      req.id,
      req.path
    )
  );
};

/**
 * Handle specific Prisma known request errors
 */
function handlePrismaKnownRequestError(
  err: PrismaClientKnownRequestError,
  req: Request,
  res: Response
): Response<TApiErrorResponse> {
  switch (err.code) {
    case 'P2002': // Unique constraint violation
      return res.status(409).json(
        createErrorResponse(
          'Resource already exists',
          409,
          'CONFLICT',
          { [Array.isArray(err.meta?.target) ? (err.meta?.target as string[]).join(', ') : (err.meta?.target as string || 'field')]: ['Must be unique'] },
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
          { entity: err.meta?.modelName ? [err.meta.modelName as string] : ['Unknown'] },
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
    
    case 'P2004': // Constraint violation
      return res.status(400).json(
        createErrorResponse(
          'Constraint violation',
          400,
          'CONSTRAINT_VIOLATION',
          { [err.meta?.constraint as string || 'constraint']: ['Constraint violated'] },
          req.id,
          req.path
        )
      );
    
    case 'P2005': // Invalid value for field
      return res.status(400).json(
        createErrorResponse(
          'Invalid value',
          400,
          'INVALID_VALUE',
          { [err.meta?.field_name as string || 'field']: [`Invalid value: ${err.meta?.value}`] },
          req.id,
          req.path
        )
      );
    
    case 'P2006': // Invalid value in database
      return res.status(500).json(
        createErrorResponse(
          'Database data integrity issue',
          500,
          'DATA_INTEGRITY_ERROR',
          undefined,
          req.id,
          req.path
        )
      );
    
    case 'P2014': // Violation of required relation
      return res.status(400).json(
        createErrorResponse(
          'Invalid relationship configuration',
          400,
          'INVALID_RELATION',
          undefined,
          req.id,
          req.path
        )
      );    case 'P2016': // Query interpretation error
    case 'P2017': // Relation does not exist
      return res.status(500).json(
        createErrorResponse(
          'Database query error',
          500,
          'DATABASE_QUERY_ERROR',
          undefined,
          req.id,
          req.path
        )
      );
      
    case 'P2018': // Required connected record not found
      return res.status(404).json(
        createErrorResponse(
          'Required related record not found',
          404,
          'RELATED_RECORD_NOT_FOUND',
          { relationName: [err.meta?.cause as string || 'unknown relation'] },
          req.id,
          req.path
        )
      );

    case 'P2019': // Input error in where condition
      return res.status(400).json(
        createErrorResponse(
          'Invalid query parameters',
          400,
          'INVALID_QUERY_PARAMETERS',
          { details: [err.meta?.cause as string || 'Invalid query structure'] },
          req.id,
          req.path
        )
      );
    
    case 'P2020': // Value out of range for type
      return res.status(400).json(
        createErrorResponse(
          'Value out of range',
          400,
          'VALUE_OUT_OF_RANGE',
          { details: [err.meta?.cause as string || 'Value exceeds allowed range'] },
          req.id,
          req.path
        )
      );
    
    case 'P2021': // Table/Model does not exist
      logger.error('Prisma model or table not found:', err.message);
      return res.status(500).json(
        createErrorResponse(
          'Database schema error',
          500,
          'DATABASE_SCHEMA_ERROR',
          undefined,
          req.id,
          req.path
        )
      );
    
    case 'P2022': // Column/Field does not exist
      logger.error('Prisma field or column not found:', err.message);
      return res.status(500).json(
        createErrorResponse(
          'Database schema error',
          500,
          'DATABASE_SCHEMA_ERROR',
          { field: [err.meta?.column as string || 'unknown'] },
          req.id,
          req.path
        )
      );
    
    case 'P2023': // Inconsistent column data
      return res.status(400).json(
        createErrorResponse(
          'Invalid data format',
          400,
          'INVALID_DATA_FORMAT',
          { field: [err.meta?.column as string || 'unknown'] },
          req.id,
          req.path
        )
      );
      
    case 'P2024': // Connection timeout
      logger.error('Database connection timeout:', err);
      return res.status(503).json(
        createErrorResponse(
          'Database connection timeout',
          503,
          'DATABASE_TIMEOUT',
          undefined,
          req.id,
          req.path
        )
      );
    
    default:
      logger.warn(`Unhandled Prisma error code: ${err.code}`, { meta: err.meta });
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

/**
 * Error logging utility with sanitization for sensitive data
 * @param err Error to log
 * @param req Express request
 */
function logError(err: Error, req: Request): void {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential', 'authorization'];
  
  // Sanitize request body, query and params
  const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
    if (!obj) return obj;
    
    const sanitized = { ...obj };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeObject(sanitized[key]);
      }
    }
    
    return sanitized;
  };
  
  const sanitizedReq = {
    method: req.method,
    path: req.path,
    query: sanitizeObject(req.query),
    body: sanitizeObject(req.body),
    params: sanitizeObject(req.params),
    headers: sanitizeObject({
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'accept': req.headers.accept,
      'origin': req.headers.origin,
      'referer': req.headers.referer,
    }),
    ip: req.ip,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
  };
  // Log different levels based on error type
  if (ApiError.isApiError(err) && err.isOperational) {
    // Operational errors are expected in normal operation
    logger.warn(`${err.toString()}`, {
      error: err.toJSON(false),
      request: sanitizedReq,
      correlationId: req.id
    });
  } else {
    // Programming errors or unexpected errors
    logger.error(`${err.toString()}`, {
      error: ApiError.isApiError(err) 
        ? err.toJSON(true) 
        : {
            name: err.name,
            message: err.message,
            stack: err.stack
          },
      request: sanitizedReq,
      correlationId: req.id
    });
  }
}

export default errorHandler;
