/**
 * @file utils/api-response.utils.ts
 * @description Utility functions for creating standardized API responses.
 * @module utils/api-response
 */

import { TApiSuccessResponse, TApiErrorResponse, TListResponse } from '@shared/types/api.types';

/**
 * HTTP status codes enum for type safety
 */
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  TOO_MANY_REQUESTS: 429,
  LEGAL_RESTRICTION: 451,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  INSUFFICIENT_STORAGE: 507,
} as const;

/**
 * Valid HTTP status code type
 */
export type HttpStatusCode = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];

/**
 * Error codes enum for consistent error handling
 */
export const ERROR_CODES = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RESOURCE_GONE: 'RESOURCE_GONE',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  LEGAL_RESTRICTION: 'LEGAL_RESTRICTION',
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  // Database-specific errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',
  DATABASE_TIMEOUT: 'DATABASE_TIMEOUT',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  DATABASE_SCHEMA_ERROR: 'DATABASE_SCHEMA_ERROR',
  DATA_INTEGRITY_ERROR: 'DATA_INTEGRITY_ERROR',
  // JWT and Token errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  // Data format and validation errors
  INVALID_JSON: 'INVALID_JSON',
  INVALID_URI: 'INVALID_URI',
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',
  INVALID_RELATIONSHIP: 'INVALID_RELATIONSHIP',
  INVALID_RELATION: 'INVALID_RELATION',
  INVALID_QUERY_PARAMETERS: 'INVALID_QUERY_PARAMETERS',
  // Constraint and relationship errors
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  RELATED_RECORD_NOT_FOUND: 'RELATED_RECORD_NOT_FOUND',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE',
  // Domain-specific errors
  TENANT_ERROR: 'TENANT_ERROR',
  COURSE_ERROR: 'COURSE_ERROR',
  ENROLLMENT_ERROR: 'ENROLLMENT_ERROR',
} as const;

/**
 * Valid error code type
 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Creates a standardized success response object
 * 
 * @template T - The type of data being returned
 * @param {T} data - The data to include in the response
 * @param {string} [message='Success'] - The success message
 * @param {HttpStatusCode} [statusCode=200] - The HTTP status code
 * @param {TApiSuccessResponse['pagination']} [pagination] - Optional pagination metadata
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @returns {TApiSuccessResponse<T>} A structured success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode?: HttpStatusCode,
  correlationId?: string
): TApiSuccessResponse<T>;

/**
 * Creates a standardized success response object (with pagination)
 */
export function createSuccessResponse<T>(
  data: T,
  message: string,
  statusCode: HttpStatusCode,
  pagination: TApiSuccessResponse['pagination'],
  correlationId?: string
): TApiSuccessResponse<T>;

/**
 * Implementation of createSuccessResponse
 */
export function createSuccessResponse<T>(
  data: T,
  message = 'Success',
  statusCode: HttpStatusCode = HTTP_STATUS_CODES.OK,
  paginationOrCorrelationId?: TApiSuccessResponse['pagination'] | string,
  correlationId?: string
): TApiSuccessResponse<T> {
  // Determine if the fourth parameter is pagination or correlationId
  let pagination: TApiSuccessResponse['pagination'] | undefined;
  let finalCorrelationId: string | undefined;
  
  if (typeof paginationOrCorrelationId === 'string') {
    // Fourth parameter is correlationId
    finalCorrelationId = paginationOrCorrelationId;
  } else {
    // Fourth parameter is pagination
    pagination = paginationOrCorrelationId;
    finalCorrelationId = correlationId;
  }
  
  // Validate correlation ID if provided
  const validatedCorrelationId = validateCorrelationId(finalCorrelationId);
  
  const response: TApiSuccessResponse<T> = {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  // Only include optional properties if they have actual values
  if (pagination !== undefined) {
    response.pagination = pagination;
  }
  
  if (validatedCorrelationId !== undefined) {
    response.correlationId = validatedCorrelationId;
  }

  return response;
}

/**
 * Creates a standardized error response object
 * 
 * @param {string} [message='An error occurred'] - The error message
 * @param {HttpStatusCode} [statusCode=500] - The HTTP status code
 * @param {ErrorCode} [errorCode] - Optional error code for client handling
 * @param {Record<string, string[]>} [details] - Optional validation error details
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured error response
 */
export const createErrorResponse = (
  message = 'An error occurred',
  statusCode: HttpStatusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  errorCode?: ErrorCode,
  details?: Record<string, string[]>,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  // Validate correlation ID if provided
  const validatedCorrelationId = validateCorrelationId(correlationId);
  
  const response: TApiErrorResponse = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  // Only include optional properties if they have actual values
  if (errorCode !== undefined) {
    response.errorCode = errorCode;
  }
  
  if (details !== undefined) {
    response.details = details;
  }
  
  if (validatedCorrelationId !== undefined) {
    response.correlationId = validatedCorrelationId;
  }
  
  if (path !== undefined) {
    response.path = path;
  }

  return response;
};

/**
 * Creates a paginated list response with standardized structure
 * 
 * @template T - The type of items in the list
 * @param {T[]} items - The list of items
 * @param {number} page - Current page number (1-based)
 * @param {number} limit - Number of items per page
 * @param {number} total - Total number of items across all pages
 * @param {string} [message='Success'] - The success message
 * @param {HttpStatusCode} [statusCode=200] - The HTTP status code
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @returns {TApiSuccessResponse<TListResponse<T>>} A structured paginated response
 */
export const createPaginatedResponse = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message = 'Success',
  statusCode: HttpStatusCode = HTTP_STATUS_CODES.OK,
  correlationId?: string
): TApiSuccessResponse<TListResponse<T>> => {
  // Validate pagination parameters for type safety
  validatePaginationParams(page, limit, total);
  
  // Validate correlation ID if provided
  const validatedCorrelationId = validateCorrelationId(correlationId);
  
  const totalPages = Math.ceil(total / limit);
  
  const paginationData = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
  
  const listResponse: TListResponse<T> = {
    items,
    pagination: paginationData,
  };
  
  // Use the cleaner approach without explicit undefined
  return createSuccessResponse(listResponse, message, statusCode, validatedCorrelationId);
};

/**
 * Helper functions for common responses without explicit undefined
 */

/**
 * Creates a success response for single items
 */
export const createItemResponse = <T>(
  data: T,
  message = 'Item retrieved successfully',
  correlationId?: string
): TApiSuccessResponse<T> => {
  return createSuccessResponse(data, message, HTTP_STATUS_CODES.OK, correlationId);
};

/**
 * Creates a created response for newly created resources
 */
export const createCreatedResponse = <T>(
  data: T,
  message = 'Resource created successfully',
  correlationId?: string
): TApiSuccessResponse<T> => {
  return createSuccessResponse(data, message, HTTP_STATUS_CODES.CREATED, correlationId);
};

/**
 * Creates a success response for updates
 */
export const createUpdatedResponse = <T>(
  data: T,
  message = 'Resource updated successfully',
  correlationId?: string
): TApiSuccessResponse<T> => {
  return createSuccessResponse(data, message, HTTP_STATUS_CODES.OK, correlationId);
};

/**
 * Creates a no content response for deletions
 */
export const createDeletedResponse = (
  message = 'Resource deleted successfully',
  correlationId?: string
): TApiSuccessResponse<null> => {
  return createSuccessResponse(null, message, HTTP_STATUS_CODES.NO_CONTENT, correlationId);
};

/**
 * Creates a bad request (400) error response
 * 
 * @param {string} [message='Bad request'] - The error message
 * @param {ErrorCode} [errorCode='BAD_REQUEST'] - Error code for client handling
 * @param {Record<string, string[]>} [details] - Optional validation error details
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured bad request error response
 */
export const createBadRequestResponse = (
  message = 'Bad request',
  errorCode: ErrorCode = ERROR_CODES.BAD_REQUEST,
  details?: Record<string, string[]>,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, HTTP_STATUS_CODES.BAD_REQUEST, errorCode, details, correlationId, path);
};

/**
 * Creates an unauthorized (401) error response
 * 
 * @param {string} [message='Unauthorized'] - The error message
 * @param {ErrorCode} [errorCode='UNAUTHORIZED'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured unauthorized error response
 */
export const createUnauthorizedResponse = (
  message = 'Unauthorized',
  errorCode: ErrorCode = ERROR_CODES.UNAUTHORIZED,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, HTTP_STATUS_CODES.UNAUTHORIZED, errorCode, undefined, correlationId, path);
};

/**
 * Creates a forbidden (403) error response
 * 
 * @param {string} [message='Forbidden'] - The error message
 * @param {ErrorCode} [errorCode='FORBIDDEN'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured forbidden error response
 */
export const createForbiddenResponse = (
  message = 'Forbidden',
  errorCode: ErrorCode = ERROR_CODES.FORBIDDEN,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, HTTP_STATUS_CODES.FORBIDDEN, errorCode, undefined, correlationId, path);
};

/**
 * Creates a not found (404) error response
 * 
 * @param {string} [message='Resource not found'] - The error message
 * @param {ErrorCode} [errorCode='NOT_FOUND'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured not found error response
 */
export const createNotFoundResponse = (
  message = 'Resource not found',
  errorCode: ErrorCode = ERROR_CODES.NOT_FOUND,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, HTTP_STATUS_CODES.NOT_FOUND, errorCode, undefined, correlationId, path);
};

/**
 * Creates a conflict (409) error response
 * 
 * @param {string} [message='Resource conflict'] - The error message
 * @param {ErrorCode} [errorCode='CONFLICT'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured conflict error response
 */
export const createConflictResponse = (
  message = 'Resource conflict',
  errorCode: ErrorCode = ERROR_CODES.CONFLICT,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, HTTP_STATUS_CODES.CONFLICT, errorCode, undefined, correlationId, path);
};

/**
 * Creates an unprocessable entity (422) error response, typically for validation errors
 * 
 * @param {string} [message='Validation failed'] - The error message
 * @param {ErrorCode} [errorCode='VALIDATION_ERROR'] - Error code for client handling
 * @param {Record<string, string[]>} [details] - Optional validation error details
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured validation error response
 */
export const createValidationErrorResponse = (
  message = 'Validation failed',
  errorCode: ErrorCode = ERROR_CODES.VALIDATION_ERROR,
  details?: Record<string, string[]>,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, errorCode, details, correlationId, path);
};

/**
 * Creates an internal server error (500) response
 * 
 * @param {string} [message='Internal server error'] - The error message
 * @param {ErrorCode} [errorCode='INTERNAL_SERVER_ERROR'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured internal server error response
 */
export const createInternalServerErrorResponse = (
  message = 'Internal server error',
  errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, errorCode, undefined, correlationId, path);
};

/**
 * Validates pagination parameters for type safety
 * 
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @throws {Error} If parameters are invalid
 */
const validatePaginationParams = (page: number, limit: number, total: number): void => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('Page must be a positive integer starting from 1');
  }
  
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be a positive integer between 1 and 100');
  }
  
  if (!Number.isInteger(total) || total < 0) {
    throw new Error('Total must be a non-negative integer');
  }
};

/**
 * Type guard to check if a value is a non-empty string
 * 
 * @param {unknown} value - Value to check
 * @returns {value is string} Type predicate
 */
const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Sanitizes and validates correlation ID
 * 
 * @param {string} [correlationId] - Optional correlation ID
 * @returns {string | undefined} Validated correlation ID or undefined
 */
const validateCorrelationId = (correlationId?: string): string | undefined => {
  if (correlationId === undefined) {
    return undefined;
  }
  
  if (!isNonEmptyString(correlationId)) {
    throw new Error('Correlation ID must be a non-empty string');
  }
  
  // Basic UUID v4 validation (optional but recommended)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(correlationId)) {
    // You can choose to be strict about UUID format or just warn
    console.warn(`Correlation ID ${correlationId} is not a valid UUID v4 format`);
  }
  
  return correlationId;
};

/**
 * @example
 * ```typescript
 * // Basic usage
 * const response = createSuccessResponse({ id: 1, name: 'John' });
 * 
 * // With pagination
 * const paginatedResponse = createPaginatedResponse(
 *   users,
 *   1,
 *   10,
 *   100,
 *   'Users retrieved successfully',
 *   HTTP_STATUS_CODES.OK,
 *   'req-123'
 * );
 * 
 * // Error response
 * const errorResponse = createNotFoundResponse(
 *   'User not found',
 *   ERROR_CODES.NOT_FOUND,
 *   'req-123',
 *   '/api/users/999'
 * );
 * ```
 */
