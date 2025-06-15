/**
 * @file api/response-utils.ts
 * @description Type-safe response handling utilities for API responses
 */

import { TApiSuccessResponse, TApiErrorResponse, TListResponse } from '@shared/types/api.types';

/**
 * Base constraint for API response data - more flexible to handle all data types
 */
type ApiResponseData = any;

/**
 * Response with extracted pagination metadata
 */
export interface PaginatedResponseResult<T extends ApiResponseData> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Response with full metadata
 */
export interface ResponseWithMeta<T extends ApiResponseData> {
  data: T;
  statusCode: number;
  message: string;
  correlationId?: string;
  timestamp: string;
  success: boolean;
}

/**
 * Type-safe response handler for paginated data
 * @param response - API response containing paginated data
 * @returns Extracted items and pagination metadata
 */
export const handlePaginatedResponse = <T extends ApiResponseData>(
  response: TApiSuccessResponse<TListResponse<T>>
): PaginatedResponseResult<T> => {
  if (!response.data || !response.data.items || !response.data.pagination) {
    throw new Error('Invalid paginated response structure');
  }

  return {
    items: response.data.items,
    pagination: response.data.pagination
  };
};

/**
 * Type-safe response handler for single items
 * @param response - API response containing single item
 * @returns Extracted data
 */
export const handleItemResponse = <T extends ApiResponseData>(
  response: TApiSuccessResponse<T>
): T => {
  return response.data;
};

/**
 * Type-safe response handler for list items (non-paginated)
 * @param response - API response containing array of items
 * @returns Extracted items array
 */
export const handleListResponse = <T extends ApiResponseData>(
  response: TApiSuccessResponse<T[]>
): T[] => {
  if (!Array.isArray(response.data)) {
    throw new Error('Expected array response but received different type');
  }
  return response.data;
};

/**
 * Extract correlation ID from response for tracking
 * @param response - Any API response
 * @returns Correlation ID if present
 */
export const getCorrelationId = (
  response: TApiSuccessResponse<any> | TApiErrorResponse
): string | undefined => {
  return response.correlationId;
};

/**
 * Extract response metadata without the data
 * @param response - API success response
 * @returns Response metadata
 */
export const getResponseMeta = <T>(
  response: TApiSuccessResponse<T>
): Omit<TApiSuccessResponse<T>, 'data'> => {
  const { data, ...meta } = response;
  return meta;
};

/**
 * Create a response with full metadata
 * @param response - API success response
 * @returns Response with metadata accessible
 */
export const withResponseMeta = <T>(
  response: TApiSuccessResponse<T>
): ResponseWithMeta<T> => {
  return {
    data: response.data,
    statusCode: response.statusCode,
    message: response.message,
    correlationId: response.correlationId,
    timestamp: response.timestamp,
    success: response.success
  };
};

/**
 * Check if response indicates success
 * @param response - Any response object
 * @returns Type guard for success response
 */
export const isSuccessResponse = <T = any>(
  response: any
): response is TApiSuccessResponse<T> => {
  return response && 
         typeof response === 'object' && 
         response.success === true &&
         'data' in response;
};

/**
 * Type guard for error responses
 * @param response - Any response object
 * @returns Type guard for error response
 */
export const isErrorResponse = (
  response: any
): response is TApiErrorResponse => {
  return response && 
         typeof response === 'object' && 
         response.success === false &&
         'message' in response;
};

/**
 * Extract error details from error response
 * @param response - Error response
 * @returns Error details object
 */
export const getErrorDetails = (
  response: TApiErrorResponse
): {
  message: string;
  errorCode?: string;
  details?: Record<string, string[]>;
  correlationId?: string;
  statusCode: number;
} => {
  return {
    message: response.message,
    errorCode: response.errorCode,
    details: response.details,
    correlationId: response.correlationId,
    statusCode: response.statusCode
  };
};

/**
 * Check if error response has validation details
 * @param response - Error response
 * @returns Whether error has validation details
 */
export const hasValidationErrors = (
  response: TApiErrorResponse
): boolean => {
  return Boolean(response.details && Object.keys(response.details).length > 0);
};

/**
 * Extract validation errors in a flattened format
 * @param response - Error response with validation details
 * @returns Flattened array of validation messages
 */
export const getValidationErrors = (
  response: TApiErrorResponse
): string[] => {
  if (!hasValidationErrors(response)) {
    return [];
  }

  const errors: string[] = [];
  for (const [field, messages] of Object.entries(response.details!)) {
    for (const message of messages) {
      errors.push(`${field}: ${message}`);
    }
  }
  return errors;
};

/**
 * Utility to safely extract nested data from response
 * @param response - API response
 * @param path - Dot notation path to extract
 * @returns Extracted value or undefined
 */
export const extractNestedData = <T = any>(
  response: TApiSuccessResponse<any>,
  path: string
): T | undefined => {
  const keys = path.split('.');
  let current: any = response.data;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current as T;
};

/**
 * Transform paginated response to include computed properties
 * @param response - Paginated API response
 * @param transformer - Function to transform each item
 * @returns Transformed paginated result
 */
export const transformPaginatedResponse = <T, U extends ApiResponseData>(
  response: TApiSuccessResponse<TListResponse<T>>,
  transformer: (item: T, index: number) => U
): PaginatedResponseResult<U> => {
  const { items, pagination } = handlePaginatedResponse(response);
  
  return {
    items: items.map(transformer),
    pagination
  };
};

/**
 * Create a cache key from response metadata
 * @param response - API response
 * @param additionalKeys - Additional keys to include in cache key
 * @returns Cache key string
 */
export const createCacheKey = (
  response: TApiSuccessResponse<any> | TApiErrorResponse,
  ...additionalKeys: string[]
): string => {
  const baseKey = `${response.statusCode}_${response.timestamp}`;
  const additional = additionalKeys.length > 0 ? `_${additionalKeys.join('_')}` : '';
  return `${baseKey}${additional}`;
};

/**
 * Utility to check if response data is empty
 * @param response - API response
 * @returns Whether the response data is considered empty
 */
export const isEmptyResponse = <T>(
  response: TApiSuccessResponse<T>
): boolean => {
  const { data } = response;
  
  if (data === null || data === undefined) {
    return true;
  }
  
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  
  if (typeof data === 'object') {
    return Object.keys(data).length === 0;
  }
  
  if (typeof data === 'string') {
    return data.trim().length === 0;
  }
  
  return false;
};
