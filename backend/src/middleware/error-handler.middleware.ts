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

/**
 * Type definitions for enhanced error handling
 */
interface ValidationErrorItem {
  msg: string;
  param: string;
  value?: unknown;
  location?: string;
}

interface RateLimitError extends Error {
  headers?: {
    'retry-after'?: string;
  };
}

interface JSONSyntaxError extends SyntaxError {
  body: string;
}

/**
 * Type guard to check if error is a validation error array
 */
function isValidationErrorArray(err: unknown): err is ValidationErrorItem[] {
  return Array.isArray(err) && 
         err.length > 0 && 
         typeof err[0] === 'object' && 
         err[0] !== null && 
         'msg' in err[0] && 
         'param' in err[0];
}

/**
 * Type guard to check if error is a rate limit error
 */
function isRateLimitError(err: Error): err is RateLimitError {
  return err.name === 'RateLimitExceeded' || 
         (err.message ? err.message.includes('rate limit') : false);
}

/**
 * Type guard to check if error is a JSON syntax error
 */
function isJSONSyntaxError(err: Error): err is JSONSyntaxError {
  return err instanceof SyntaxError && 'body' in err;
}

/**
 * Safely extract meta field from Prisma error with proper type safety
 */
function getPrismaMetaField(meta: unknown, field: string): string {
  if (meta && typeof meta === 'object' && meta !== null && field in meta) {
    const value = (meta as Record<string, unknown>)[field];
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.filter((v): v is string => typeof v === 'string').join(', ');
    }
  }
  return 'unknown';
}

/**
 * Type-safe helper to extract Prisma meta target field
 */
function getPrismaTargetField(meta: unknown): string {
  const target = getPrismaMetaField(meta, 'target');
  if (target === 'unknown' && meta && typeof meta === 'object' && meta !== null && 'target' in meta) {
    const targetValue = (meta as Record<string, unknown>)['target'];
    if (Array.isArray(targetValue)) {
      return targetValue.filter((v): v is string => typeof v === 'string').join(', ') || 'field';
    }
  }
  return target === 'unknown' ? 'field' : target;
}

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses conforming to TApiErrorResponse
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response<TApiErrorResponse> => {
  // Ensure err is an Error object
  const error = err instanceof Error ? err : new Error(String(err));
  
  // Log the error with structured metadata
  logError(error, req);

  // Handle ApiError instances (application-specific errors)
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(
      createErrorResponse(
        error.message,
        error.statusCode,
        error.errorCode,
        error.details,
        req.id,
        req.path
      )
    );
  }

  // Handle Prisma database errors
  if (error instanceof PrismaClientKnownRequestError) {
    return handlePrismaKnownRequestError(error, req, res);
  }

  if (error instanceof PrismaClientValidationError) {
    return res.status(400).json(
      createErrorResponse(
        'Database validation error',
        400,
        'VALIDATION_ERROR',
        { _error: [error.message.split('\n').pop() || 'Invalid data format'] },
        req.id,
        req.path
      )
    );
  }

  if (error instanceof PrismaClientInitializationError) {
    logger.error('Database initialization error:', error);
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

  if (error instanceof PrismaClientRustPanicError || 
      error instanceof PrismaClientUnknownRequestError) {
    logger.error('Critical database error:', error);
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

  // Handle Express Validator errors with type safety
  if (isValidationErrorArray(err)) {
    const validationErrors: Record<string, string[]> = {};
    
    err.forEach((error: ValidationErrorItem) => {
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
  if (error instanceof ApiValidationError) {
    return res.status(422).json(
      createErrorResponse(
        error.message,
        422,
        error.errorCode,
        error.details,
        req.id,
        req.path
      )
    );
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
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

  if (error.name === 'TokenExpiredError') {
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

  // Handle JSON parsing errors with type safety
  if (isJSONSyntaxError(error)) {
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
  }

  // Handle rate limit errors with type safety
  if (isRateLimitError(error)) {
    const retryAfter = error.headers?.['retry-after'] || '60';
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
  if (error.name === 'URIError') {
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
  const statusCode = 500;
  const errorCode = 'INTERNAL_SERVER_ERROR';
  
  // Provide more detailed error info in non-production environments
  let message = 'Internal server error';
  let details: Record<string, string[]> | undefined = undefined;
  
  if (!env.IS_PRODUCTION) {
    message = error.message || 'Internal server error';
    
    // Include stack trace in development for easier debugging
    if (error.stack) {
      details = {
        stack: [error.stack.split('\n')[0] || 'No stack trace available'], // Just the first line of stack for brevity
        type: [error.constructor.name]
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
  switch (err.code) {    case 'P2002': // Unique constraint violation
      return res.status(409).json(
        createErrorResponse(
          'Resource already exists',
          409,
          'CONFLICT',
          { [getPrismaTargetField(err.meta)]: ['Must be unique'] },
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
          { entity: [getPrismaMetaField(err.meta, 'modelName')] },
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
          { [getPrismaMetaField(err.meta, 'field_name')]: ['Invalid reference'] },
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
          { [getPrismaMetaField(err.meta, 'constraint')]: ['Constraint violated'] },
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
          { [getPrismaMetaField(err.meta, 'field_name')]: [`Invalid value: ${getPrismaMetaField(err.meta, 'value')}`] },
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
          { relationName: [getPrismaMetaField(err.meta, 'cause')] },
          req.id,
          req.path
        )
      );    case 'P2019': // Input error in where condition
      return res.status(400).json(
        createErrorResponse(
          'Invalid query parameters',
          400,
          'INVALID_QUERY_PARAMETERS',
          { details: [getPrismaMetaField(err.meta, 'cause')] },
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
          { details: [getPrismaMetaField(err.meta, 'cause')] },
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
          { field: [getPrismaMetaField(err.meta, 'column')] },
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
          { field: [getPrismaMetaField(err.meta, 'column')] },
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
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursive sanitization for nested objects
        if (Array.isArray(sanitized[key])) {
          sanitized[key] = (sanitized[key] as any[]).map(item => 
            typeof item === 'object' && item !== null ? sanitizeObject(item) : item
          );
        } else {
          sanitized[key] = sanitizeObject(sanitized[key] as Record<string, any>);
        }
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
