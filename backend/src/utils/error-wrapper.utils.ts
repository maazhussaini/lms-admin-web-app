/**
 * @file utils/error-wrapper.utils.ts
 * @description Utility functions for wrapping and converting various error types into ApiError instances.
 * Provides a robust error handling infrastructure for standardizing error responses throughout the application.
 * @module utils/error-wrapper
 */

import { 
  ApiError, 
  InternalServerError, 
  BadRequestError,
  ValidationError,
  ExternalServiceError,
  ServiceUnavailableError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError
} from './api-error.utils.js';
import { 
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError
} from '@prisma/client/runtime/library';
import logger from '@/config/logger.js';

/**
 * Options for wrapping errors
 */
interface ErrorWrapperOptions {
  /** Default message to use if the original error has no message */
  defaultMessage?: string;
  /** Context to add to the wrapped error */
  context?: Record<string, any>;
  /** Whether to log the original error */
  logError?: boolean;
  /** Correlation ID for distributed tracing */
  correlationId?: string;
  /** Whether to include sensitive information in error logs (default: false) */
  includeSensitiveInfo?: boolean;
  /** Path or location where the error occurred */
  path?: string;
}

// Sensitive keys that should be redacted in error contexts
const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'key', 'credential', 'authorization',
  'apiKey', 'accessToken', 'refreshToken', 'jwt', 'private', 'auth'
];

/**
 * Sanitizes objects to remove sensitive information
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized: Record<string, any> = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Wraps an unknown error into an appropriate ApiError
 * This is useful for handling errors from third-party libraries or for 
 * standardizing error responses
 * 
 * @param error The original error
 * @param options Options for wrapping the error
 * @returns An ApiError instance
 */
export const wrapError = (
  error: unknown, 
  options: ErrorWrapperOptions = {}
): ApiError => {
  // If it's already an ApiError, just return it
  if (ApiError.isApiError(error)) {
    return error;
  }
  
  const {
    defaultMessage = 'An unexpected error occurred',
    context = {},
    logError = true,
    correlationId,
    includeSensitiveInfo = false,
    path
  } = options;
  
  // Extract message from the error
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string'
      ? error
      : defaultMessage;
  
  // Prepare context for logging, removing sensitive data if necessary
  const logContext = includeSensitiveInfo ? context : sanitizeObject(context);
  
  // Log the original error if requested
  if (logError) {
    logger.error('Error wrapped:', {
      originalError: error instanceof Error ? error.toString() : error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: errorMessage,
      context: logContext,
      correlationId,
      path
    });
  }
  
  // Handle specific error types
  
  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(error, context, correlationId, path);
  }
  
  if (error instanceof PrismaClientValidationError) {
    return new BadRequestError(
      'Database validation error',
      'VALIDATION_ERROR',
      { 
        cause: error, 
        context, 
        isOperational: true,
        details: { _error: [error.message.split('\n').pop() || 'Invalid data format'] }
      }
    );
  }
  
  if (error instanceof PrismaClientInitializationError) {
    return new ServiceUnavailableError(
      'Database connection failed',
      'DATABASE_UNAVAILABLE',
      { cause: error, context, isOperational: true }
    );
  }
  
  if (error instanceof PrismaClientRustPanicError || error instanceof PrismaClientUnknownRequestError) {
    return new InternalServerError(
      'Critical database error',
      'DATABASE_ERROR',
      { cause: error, context, isOperational: false }
    );
  }
  
  // JavaScript native errors
  if (error instanceof SyntaxError) {
    return new BadRequestError(
      'Invalid syntax in request',
      'SYNTAX_ERROR',
      { cause: error, context, isOperational: true }
    );
  }
  
  if (error instanceof TypeError) {
    return new InternalServerError(
      'Type error occurred',
      'TYPE_ERROR',
      { cause: error, context, isOperational: false }
    );
  }
  
  if (error instanceof RangeError) {
    return new BadRequestError(
      'Value out of range',
      'RANGE_ERROR',
      { cause: error, context, isOperational: true }
    );
  }
  
  if (error instanceof URIError) {
    return new BadRequestError(
      'Invalid URI',
      'URI_ERROR',
      { cause: error, context, isOperational: true }
    );
  }
  
  if (error instanceof ReferenceError) {
    return new InternalServerError(
      'Reference error occurred',
      'REFERENCE_ERROR',
      { cause: error, context, isOperational: false }
    );
  }
  
  // JWT errors
  if (error instanceof Error) {
    if (error.name === 'JsonWebTokenError') {
      return new UnauthorizedError(
        'Invalid token',
        'INVALID_TOKEN',
        { cause: error, context, isOperational: true }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return new UnauthorizedError(
        'Token expired',
        'TOKEN_EXPIRED',
        { cause: error, context, isOperational: true }
      );
    }
    
    if (error.name === 'NotBeforeError') {
      return new UnauthorizedError(
        'Token not yet valid',
        'TOKEN_NOT_VALID_YET',
        { cause: error, context, isOperational: true }
      );
    }
  }
  
  // Network/Connection errors
  if (
    (error instanceof Error && error.message.includes('ECONNREFUSED')) ||
    (error instanceof Error && error.message.includes('ETIMEDOUT')) ||
    (error instanceof Error && error.message.includes('ECONNRESET')) ||
    (error instanceof Error && error.message.includes('ENOTFOUND')) ||
    (error instanceof Error && error.message.includes('network'))
  ) {
    return new ServiceUnavailableError(
      'Service connection failed',
      'CONNECTION_ERROR',
      { cause: error, context, isOperational: true }
    );
  }
  
  // HTTP client errors (Fetch API, Axios, etc.)
  if (
    (error as any)?.response?.status ||
    (error as any)?.status
  ) {
    const status = (error as any)?.response?.status || (error as any)?.status;
    const data = (error as any)?.response?.data || (error as any)?.data;
    
    return new ExternalServiceError(
      data?.message || `External service returned ${status}`,
      status >= 400 && status < 600 ? status : 502,
      'EXTERNAL_API_ERROR',
      { 
        cause: error as Error, 
        context: { 
          ...context,
          responseData: sanitizeObject(data),
          status
        }, 
        isOperational: true 
      }
    );
  }
  
  // For unhandled AbortController aborts 
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ServiceUnavailableError(
      'Request was aborted',
      'REQUEST_ABORTED',
      { cause: error, context, isOperational: true }
    );
  }
  
  // Default case: return an InternalServerError
  return new InternalServerError(
    errorMessage || defaultMessage,
    'UNKNOWN_ERROR',
    { cause: error instanceof Error ? error : undefined, context }
  );
};

/**
 * Handle Prisma specific errors
 * @param error Prisma error
 * @param context Additional context
 * @param correlationId Optional correlation ID for tracing
 * @param path Optional path where the error occurred
 * @returns Appropriate ApiError
 */
function handlePrismaError(
  error: PrismaClientKnownRequestError,
  context: Record<string, any> = {},
  correlationId?: string,
  path?: string
): ApiError {
  // Add error metadata to context
  const errorContext = {
    ...context,
    prismaCode: error.code,
    prismaClientVersion: error.clientVersion,
    path,
    correlationId
  };
  
  switch (error.code) {
    // Constraint violations
    case 'P2002': // Unique constraint violation
      return new ConflictError(
        'Resource already exists',
        'UNIQUE_CONSTRAINT_VIOLATION',
        {
          cause: error,
          context: {
            ...errorContext,
            fields: error.meta?.target
          },
          details: error.meta?.target 
            ? { [Array.isArray(error.meta.target) 
                ? (error.meta.target as string[]).join(', ') 
                : error.meta.target as string
              ]: ['Must be unique'] 
            }
            : undefined
        }
      );
      
    case 'P2003': // Foreign key constraint violation
      return new BadRequestError(
        'Invalid relationship',
        'FOREIGN_KEY_CONSTRAINT_VIOLATION',
        {
          cause: error,
          context: {
            ...errorContext,
            field: error.meta?.field_name
          },
          details: error.meta?.field_name
            ? { [error.meta.field_name as string]: ['Invalid reference'] }
            : undefined
        }
      );
      
    case 'P2004': // Constraint violation
      return new BadRequestError(
        'Constraint violation',
        'CONSTRAINT_VIOLATION',
        {
          cause: error,
          context: {
            ...errorContext,
            constraint: error.meta?.constraint
          },
          details: error.meta?.constraint
            ? { [error.meta.constraint as string]: ['Constraint violated'] }
            : undefined
        }
      );
      
    // Not found errors
    case 'P2025': // Record not found
      return new NotFoundError(
        'Resource not found',
        'RESOURCE_NOT_FOUND',
        {
          cause: error,
          context: {
            ...errorContext,
            model: error.meta?.modelName
          }
        }
      );
      
    case 'P2018': // Required connected record not found
      return new NotFoundError(
        'Required related record not found',
        'RELATED_RECORD_NOT_FOUND',
        {
          cause: error,
          context: {
            ...errorContext,
            relation: error.meta?.cause
          }
        }
      );
      
    // Input validation errors
    case 'P2005': // Invalid value for field
      return new BadRequestError(
        'Invalid value',
        'INVALID_VALUE',
        {
          cause: error,
          context: {
            ...errorContext,
            field: error.meta?.field_name
          },
          details: error.meta?.field_name
            ? { [error.meta.field_name as string]: [`Invalid value: ${error.meta?.value}`] }
            : undefined
        }
      );
      
    case 'P2006': // Invalid value in database
      return new InternalServerError(
        'Database data integrity issue',
        'DATA_INTEGRITY_ERROR',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2007': // Database query validation error
      return new BadRequestError(
        'Invalid data provided',
        'INVALID_DATA',
        {
          cause: error,
          context: errorContext,
          details: { _error: [error.message] }
        }
      );
      
    case 'P2008': // Query failed - possibly schema mismatch
      return new InternalServerError(
        'Database query error',
        'DATABASE_QUERY_ERROR',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2009': // Invalid query 
      return new BadRequestError(
        'Invalid query arguments',
        'INVALID_QUERY_ARGUMENTS',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2010': // Raw query failed
      return new InternalServerError(
        'Database raw query failed',
        'DATABASE_RAW_QUERY_FAILED',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2011': // Null constraint violation
      return new BadRequestError(
        'Required field cannot be null',
        'NULL_CONSTRAINT_VIOLATION',
        {
          cause: error,
          context: {
            ...errorContext,
            field: error.meta?.constraint
          },
          details: error.meta?.constraint
            ? { [error.meta.constraint as string]: ['Cannot be null'] }
            : undefined
        }
      );
      
    case 'P2012': // Missing required value
      return new BadRequestError(
        'Missing required field',
        'MISSING_REQUIRED_FIELD',
        {
          cause: error,
          context: {
            ...errorContext,
            field: error.meta?.path
          },
          details: error.meta?.path
            ? { [error.meta.path as string]: ['Required field is missing'] }
            : undefined
        }
      );
      
    case 'P2013': // Missing required argument
      return new BadRequestError(
        'Missing required argument',
        'MISSING_REQUIRED_ARGUMENT',
        {
          cause: error,
          context: {
            ...errorContext,
            argument: error.meta?.argument,
            path: error.meta?.path
          }
        }
      );
      
    case 'P2014': // Violation of required relation
      return new BadRequestError(
        'Invalid relationship configuration',
        'INVALID_RELATION',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2015': // Related record not found
      return new NotFoundError(
        'Related record not found',
        'RELATED_RECORD_NOT_FOUND',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2016': // Query interpretation error
    case 'P2017': // Relation does not exist
      return new InternalServerError(
        'Database query error',
        'DATABASE_QUERY_ERROR',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2019': // Input error in where condition
      return new BadRequestError(
        'Invalid query parameters',
        'INVALID_QUERY_PARAMETERS',
        {
          cause: error,
          context: errorContext,
          details: { details: [error.meta?.cause as string || 'Invalid query structure'] }
        }
      );
      
    case 'P2020': // Value out of range for type
      return new BadRequestError(
        'Value out of range',
        'VALUE_OUT_OF_RANGE',
        {
          cause: error,
          context: errorContext,
          details: { details: [error.meta?.cause as string || 'Value exceeds allowed range'] }
        }
      );
      
    case 'P2021': // Table/Model does not exist
      logger.error('Prisma model or table not found:', { error: error.message, code: error.code });
      return new InternalServerError(
        'Database schema error',
        'DATABASE_SCHEMA_ERROR',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2022': // Column/Field does not exist
      logger.error('Prisma field or column not found:', { error: error.message, code: error.code });
      return new InternalServerError(
        'Database schema error',
        'DATABASE_SCHEMA_ERROR',
        {
          cause: error,
          context: {
            ...errorContext,
            field: error.meta?.column
          }
        }
      );
      
    case 'P2023': // Inconsistent column data
      return new BadRequestError(
        'Invalid data format',
        'INVALID_DATA_FORMAT',
        {
          cause: error,
          context: {
            ...errorContext,
            field: error.meta?.column
          }
        }
      );
      
    case 'P2024': // Connection timeout
      return new ServiceUnavailableError(
        'Database connection timeout',
        'DATABASE_TIMEOUT',
        {
          cause: error,
          context: errorContext
        }
      );
    
    case 'P2026': // Unsupported feature
      logger.error('Unsupported database feature:', { error: error.message, code: error.code });
      return new InternalServerError(
        'Unsupported database feature',
        'UNSUPPORTED_FEATURE',
        {
          cause: error,
          context: errorContext
        }
      );
      
    case 'P2027': // Multiple errors occurred
      return new BadRequestError(
        'Multiple database errors',
        'MULTIPLE_DATABASE_ERRORS',
        {
          cause: error,
          context: errorContext
        }
      );
    
    case 'P2028': // Transaction API error
      return new InternalServerError(
        'Database transaction error',
        'TRANSACTION_ERROR',
        {
          cause: error,
          context: errorContext
        }
      );
    
    case 'P2030': // Full-text search error
      return new BadRequestError(
        'Full-text search error',
        'FULLTEXT_SEARCH_ERROR',
        {
          cause: error,
          context: errorContext
        }
      );
      
    // Default case for unhandled Prisma error codes
    default:
      logger.warn(`Unhandled Prisma error code: ${error.code}`, { meta: error.meta });
      return new InternalServerError(
        'Database error',
        'DATABASE_ERROR',
        {
          cause: error,
          context: errorContext
        }
      );
  }
}

/**
 * Safely execute a function and wrap any errors in an ApiError
 * @param fn Function to execute
 * @param errorOptions Options for error wrapping
 * @returns Result of the function
 * @throws ApiError
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorOptions: ErrorWrapperOptions = {}
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    throw wrapError(error, errorOptions);
  }
};

// Type for error mapper functions
type ErrorMapper = (error: Error) => ApiError;
type ErrorMapperValue = ErrorMapper | string | (new (...args: any[]) => ApiError);

// Cache for memoized error mappers
const errorMapperCache = new Map<string, (error: unknown) => ApiError>();

/**
 * Create a function that maps specific error types to custom error messages or error classes
 * @param errorMap Map of error types to custom handlers
 * @param defaultHandler Default handler for unmatched errors
 * @returns Function that handles errors according to the map
 */
export const createErrorMapper = (
  errorMap: Record<string, ErrorMapperValue>,
  defaultHandler?: (error: unknown) => ApiError
): (error: unknown) => ApiError => {
  // Create a cache key based on the errorMap keys and the presence of a defaultHandler
  const cacheKey = Object.keys(errorMap).sort().join('|') + (defaultHandler ? '|default' : '');
  
  // Return cached mapper if available (performance optimization)
  if (errorMapperCache.has(cacheKey)) {
    return errorMapperCache.get(cacheKey)!;
  }
  
  // Create a new mapper function
  const mapper = (error: unknown): ApiError => {
    if (!(error instanceof Error)) {
      return defaultHandler 
        ? defaultHandler(error) 
        : wrapError(error);
    }
    
    const errorType = error.constructor.name;
    
    if (errorType in errorMap) {
      const handler = errorMap[errorType];
      
      if (typeof handler === 'function') {
        // If it's a function, call it with the error
        if (handler.prototype instanceof ApiError) {
          // It's a constructor for an ApiError class
          return new (handler as new (...args: any[]) => ApiError)(
            error.message,
            undefined,
            { cause: error }
          );
        }
        // It's a custom handler function
        return (handler as ErrorMapper)(error);
      }
      
      if (typeof handler === 'string') {
        // If it's a string, use it as the error message
        return new InternalServerError(
          handler,
          'MAPPED_ERROR',
          { cause: error }
        );
      }
    }
    
    return defaultHandler 
      ? defaultHandler(error) 
      : wrapError(error);
  };
  
  // Cache the mapper function
  errorMapperCache.set(cacheKey, mapper);
  
  return mapper;
};

/**
 * Creates a retry wrapper that attempts to execute a function multiple times before giving up
 * 
 * @param fn The function to retry
 * @param options Retry options
 * @returns The result of the function
 * @throws ApiError after all retries are exhausted
 */
export const withRetry = async <T>(
  fn: () => Promise<T>, 
  options: {
    retries?: number;
    delay?: number;
    backoffFactor?: number;
    errorFilter?: (error: unknown) => boolean;
    onRetry?: (error: unknown, attempt: number) => void;
    errorOptions?: ErrorWrapperOptions;
  } = {}
): Promise<T> => {
  const {
    retries = 3,
    delay = 500,
    backoffFactor = 2,
    errorFilter = () => true,
    onRetry,
    errorOptions
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // If this is the last attempt or the error doesn't pass the filter, don't retry
      if (attempt > retries || !errorFilter(error)) {
        break;
      }
      
      // Call the onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt);
      }
      
      // Wait before the next retry with exponential backoff
      const waitTime = delay * Math.pow(backoffFactor, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // All retries failed
  throw wrapError(lastError, {
    ...errorOptions,
    context: {
      ...errorOptions?.context,
      retryAttempts: retries
    }
  });
};
