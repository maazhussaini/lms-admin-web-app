/**
 * @file utils/api-response.utils.ts
 * @description Utility functions for creating standardized API responses.
 */

import { TApiSuccessResponse, TApiErrorResponse } from '@shared/types/api.types.js';

/**
 * Creates a standardized success response object
 * @param data The data to include in the response
 * @param message The success message
 * @param statusCode The HTTP status code
 * @param pagination Optional pagination metadata
 * @returns A structured success response
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
 * @param message The error message
 * @param statusCode The HTTP status code
 * @param errorCode Optional error code for client handling
 * @param details Optional validation error details
 * @returns A structured error response
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
