/**
 * @file api/index.ts
 * @description Main entry point for API utilities and clients
 */

import { apiClient } from './client';
import { apiClientWithMeta } from './client-with-meta';
import { initializeCommonInterceptors, interceptorManager } from './interceptors';
import { apiLogger } from './logger';
import { PaginatedResponseResult } from './response-utils';

// Core API client
export { apiClient, ApiError, TimeoutError } from './client';
export type { ApiClientOptions } from './client';

// Enhanced API client with metadata
export { apiClientWithMeta } from './client-with-meta';
export type { 
  ApiClientOptionsWithMeta, 
  ApiResponseWithOptionalMeta, 
  PaginatedApiResponse 
} from './client-with-meta';

// Client utilities
export {
  API_BASE_URL,
  API_TIMEOUT,
  createAbortControllerWithTimeout,
  mergeSignals,
  addAuthHeaders,
  processResponse,
  processResponseWithMeta,
  handleAuthError,
  fetchWithTimeout,
  fetchWithTimeoutAndMeta,
  prepareHeaders,
  createRequestOptions,
  createFormDataRequestOptions,
  buildUrl,
  retryWithAuth
} from './client-utils';
export type { BaseApiClientOptions } from './client-utils';

// Response utilities
export {
  handlePaginatedResponse,
  handleItemResponse,
  handleListResponse,
  getCorrelationId,
  getResponseMeta,
  withResponseMeta,
  isSuccessResponse,
  isErrorResponse,
  getErrorDetails,
  hasValidationErrors,
  getValidationErrors,
  extractNestedData,
  transformPaginatedResponse,
  createCacheKey,
  isEmptyResponse
} from './response-utils';
export type { 
  PaginatedResponseResult, 
  ResponseWithMeta 
} from './response-utils';

// Interceptors
export { 
  ApiInterceptorManager, 
  interceptorManager, 
  commonInterceptors,
  initializeCommonInterceptors 
} from './interceptors';
export type { 
  RequestInterceptor, 
  ResponseInterceptor, 
  ErrorInterceptor,
  InterceptorConfig 
} from './interceptors';

// Logger
export { ApiLogger, apiLogger, logUtils, LogLevel } from './logger';
export type { 
  ApiLoggerConfig, 
  RequestLogInfo, 
  ResponseLogInfo, 
  ErrorLogInfo 
} from './logger';

// Error Boundary
export { 
  ApiErrorBoundary, 
  withApiErrorBoundary,
} from '../components/APIErrorBoundary/ApiErrorBoundary';

// Hooks (import from hooks barrel)
export { useErrorBoundary, useApiErrorBoundary } from '@/hooks';

/**
 * Initialize the API system with common interceptors
 */
export const initializeApi = () => {
  initializeCommonInterceptors();
  
  // Log initialization in development
  if (import.meta.env.DEV) {
    console.log('🚀 API system initialized with interceptors');
  }
};

/**
 * Quick setup for common API patterns with enhanced type safety
 */
export const apiPatterns = {
  /**
   * Get a single item by ID with proper type constraints
   */
  getById: async <T extends Record<string, any>>(
    endpoint: string, 
    id: string | number
  ): Promise<T> => {
    return apiClient.get<T>(`${endpoint}/${id}`);
  },

  /**
   * Get a paginated list with common query parameters and type safety
   */
  getList: async <T extends Record<string, any>>(
    endpoint: string, 
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
      search?: string;
      [key: string]: any;
    } = {}
  ): Promise<PaginatedResponseResult<T>> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return apiClientWithMeta.getPaginated<T>(url);
  },

  /**
   * Create a new resource with type constraints
   */
  create: async <T extends Record<string, any>, D extends Record<string, any> = Record<string, any>>(
    endpoint: string, 
    data: D
  ): Promise<T> => {
    return apiClient.post<T, D>(endpoint, data);
  },

  /**
   * Update an existing resource with type safety
   */
  update: async <T extends Record<string, any>, D extends Record<string, any> = Partial<T>>(
    endpoint: string, 
    id: string | number, 
    data: D
  ): Promise<T> => {
    return apiClient.put<T, D>(`${endpoint}/${id}`, data);
  },

  /**
   * Partially update an existing resource
   */
  patch: async <T extends Record<string, any>, D extends Record<string, any> = Partial<T>>(
    endpoint: string, 
    id: string | number, 
    data: D
  ): Promise<T> => {
    return apiClient.put<T, D>(`${endpoint}/${id}`, data); // Using PUT as PATCH isn't implemented in base client
  },

  /**
   * Delete a resource
   */
  delete: async (endpoint: string, id: string | number): Promise<void> => {
    return apiClient.delete<void>(`${endpoint}/${id}`);
  },

  /**
   * Search resources with filters and proper typing
   */
  search: async <T extends Record<string, any>>(
    endpoint: string,
    query: string,
    filters: Record<string, any> = {}
  ): Promise<PaginatedResponseResult<T>> => {
    const params = {
      search: query,
      ...filters
    };
    
    return apiPatterns.getList<T>(endpoint, params);
  }
};

/**
 * Utility for building query strings from objects
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, String(v)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  return queryParams.toString();
};

/**
 * Utility for combining endpoints
 */
export const combineEndpoints = (...parts: string[]): string => {
  return parts
    .map(part => part.replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes
    .filter(part => part.length > 0)
    .join('/');
};

/**
 * Default export for convenience
 */
export default {
  client: apiClient,
  clientWithMeta: apiClientWithMeta,
  patterns: apiPatterns,
  interceptors: interceptorManager,
  logger: apiLogger,
  utils: {
    buildQueryString,
    combineEndpoints
  },
  initialize: initializeApi
};
