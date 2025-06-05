/**
 * @file utils/api-response.utils.ts
 * @description Utility functions for creating standardized API responses.
 * @module utils/api-response
 */

import { TApiSuccessResponse, TApiErrorResponse, TListResponse } from '@shared/types/api.types.js';

/**
 * Creates a standardized success response object
 * 
 * @template T - The type of data being returned
 * @param {T} data - The data to include in the response
 * @param {string} [message='Success'] - The success message
 * @param {number} [statusCode=200] - The HTTP status code
 * @param {TApiSuccessResponse['pagination']} [pagination] - Optional pagination metadata
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @returns {TApiSuccessResponse<T>} A structured success response
 */
export const createSuccessResponse = <T>(
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: TApiSuccessResponse['pagination'],
  correlationId?: string
): TApiSuccessResponse<T> => {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    pagination,
    correlationId,
  };
};

/**
 * Creates a standardized error response object
 * 
 * @param {string} [message='An error occurred'] - The error message
 * @param {number} [statusCode=500] - The HTTP status code
 * @param {string} [errorCode] - Optional error code for client handling
 * @param {Record<string, string[]>} [details] - Optional validation error details
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured error response
 */
export const createErrorResponse = (
  message = 'An error occurred',
  statusCode = 500,
  errorCode?: string,
  details?: Record<string, string[]>,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return {
    success: false,
    statusCode,
    message,
    errorCode,
    details,
    timestamp: new Date().toISOString(),
    correlationId,
    path,
  };
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
 * @param {number} [statusCode=200] - The HTTP status code
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @returns {TApiSuccessResponse<TListResponse<T>>} A structured paginated response
 */
export const createPaginatedResponse = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message = 'Success',
  statusCode = 200,
  correlationId?: string
): TApiSuccessResponse<TListResponse<T>> => {
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
  
  return createSuccessResponse(
    listResponse,
    message,
    statusCode,
    paginationData,
    correlationId
  );
};

/**
 * Creates a created (201) response with the newly created resource
 * 
 * @template T - The type of data being returned
 * @param {T} data - The newly created resource
 * @param {string} [message='Resource created successfully'] - The success message
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @returns {TApiSuccessResponse<T>} A structured created response
 */
export const createCreatedResponse = <T>(
  data: T,
  message = 'Resource created successfully',
  correlationId?: string
): TApiSuccessResponse<T> => {
  return createSuccessResponse(data, message, 201, undefined, correlationId);
};

/**
 * Creates a no content (204) response for successful operations that don't return data
 * 
 * @param {string} [message='Operation successful'] - The success message
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @returns {TApiSuccessResponse<null>} A structured no content response
 */
export const createNoContentResponse = (
  message = 'Operation successful',
  correlationId?: string
): TApiSuccessResponse<null> => {
  return createSuccessResponse(null, message, 204, undefined, correlationId);
};

/**
 * Creates a bad request (400) error response
 * 
 * @param {string} [message='Bad request'] - The error message
 * @param {string} [errorCode='BAD_REQUEST'] - Error code for client handling
 * @param {Record<string, string[]>} [details] - Optional validation error details
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured bad request error response
 */
export const createBadRequestResponse = (
  message = 'Bad request',
  errorCode = 'BAD_REQUEST',
  details?: Record<string, string[]>,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, 400, errorCode, details, correlationId, path);
};

/**
 * Creates an unauthorized (401) error response
 * 
 * @param {string} [message='Unauthorized'] - The error message
 * @param {string} [errorCode='UNAUTHORIZED'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured unauthorized error response
 */
export const createUnauthorizedResponse = (
  message = 'Unauthorized',
  errorCode = 'UNAUTHORIZED',
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, 401, errorCode, undefined, correlationId, path);
};

/**
 * Creates a forbidden (403) error response
 * 
 * @param {string} [message='Forbidden'] - The error message
 * @param {string} [errorCode='FORBIDDEN'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured forbidden error response
 */
export const createForbiddenResponse = (
  message = 'Forbidden',
  errorCode = 'FORBIDDEN',
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, 403, errorCode, undefined, correlationId, path);
};

/**
 * Creates a not found (404) error response
 * 
 * @param {string} [message='Resource not found'] - The error message
 * @param {string} [errorCode='NOT_FOUND'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured not found error response
 */
export const createNotFoundResponse = (
  message = 'Resource not found',
  errorCode = 'NOT_FOUND',
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, 404, errorCode, undefined, correlationId, path);
};

/**
 * Creates a conflict (409) error response
 * 
 * @param {string} [message='Resource conflict'] - The error message
 * @param {string} [errorCode='CONFLICT'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured conflict error response
 */
export const createConflictResponse = (
  message = 'Resource conflict',
  errorCode = 'CONFLICT',
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, 409, errorCode, undefined, correlationId, path);
};

/**
 * Creates an unprocessable entity (422) error response, typically for validation errors
 * 
 * @param {string} [message='Validation failed'] - The error message
 * @param {string} [errorCode='VALIDATION_ERROR'] - Error code for client handling
 * @param {Record<string, string[]>} [details] - Optional validation error details
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured validation error response
 */
export const createValidationErrorResponse = (
  message = 'Validation failed',
  errorCode = 'VALIDATION_ERROR',
  details?: Record<string, string[]>,
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, 422, errorCode, details, correlationId, path);
};

/**
 * Creates an internal server error (500) response
 * 
 * @param {string} [message='Internal server error'] - The error message
 * @param {string} [errorCode='INTERNAL_SERVER_ERROR'] - Error code for client handling
 * @param {string} [correlationId] - Optional request correlation ID for tracing
 * @param {string} [path] - Optional request path where the error occurred
 * @returns {TApiErrorResponse} A structured internal server error response
 */
export const createInternalServerErrorResponse = (
  message = 'Internal server error',
  errorCode = 'INTERNAL_SERVER_ERROR',
  correlationId?: string,
  path?: string
): TApiErrorResponse => {
  return createErrorResponse(message, 500, errorCode, undefined, correlationId, path);
};
