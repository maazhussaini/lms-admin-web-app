/**
 * @file api/client-utils.ts
 * @description Shared utilities for API clients to eliminate code duplication
 */

import { TApiErrorResponse, TApiSuccessResponse } from '@shared/types/api.types';
import { getStoredAuthToken, refreshAuthToken } from '@/services/authService';
import { interceptorManager } from './interceptors';
import { apiLogger } from './logger';

/**
 * API configuration constants
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 30000;

/**
 * Common interface for API client options
 */
export interface BaseApiClientOptions {
  headers?: Record<string, string>;
  withAuth?: boolean;
  signal?: AbortSignal;
  timeout?: number;
}

/**
 * Error with API response details
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  details?: Record<string, string[]>;
  correlationId?: string;

  constructor(response: TApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.statusCode = response.statusCode;
    this.errorCode = response.errorCode;
    this.details = response.details;
    this.correlationId = response.correlationId;
  }
}

/**
 * Timeout error for fetch requests
 */
export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Create an abort controller with timeout
 */
export const createAbortControllerWithTimeout = (timeout: number): { controller: AbortController; timeoutId: number } => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
};

/**
 * Merge multiple AbortSignals
 */
export const mergeSignals = (...signals: AbortSignal[]): AbortSignal => {
  const controller = new AbortController();
  const cleanup: AbortController[] = [];

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }

    const localController = new AbortController();
    signal.addEventListener('abort', () => controller.abort(signal.reason), { signal: localController.signal });
    cleanup.push(localController);
  }

  return controller.signal;
};

/**
 * Add authentication headers to request
 */
export const addAuthHeaders = async (headers: Headers): Promise<Headers> => {
  const token = await getStoredAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

/**
 * Process API response and extract data
 */
export const processResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Handle API error responses
    if (isJson && 'success' in data && data.success === false) {
      throw new ApiError(data as TApiErrorResponse);
    }
    
    // Handle non-API error responses
    throw new Error(`HTTP error ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data as T;
};

/**
 * Process API response and preserve full response structure
 */
export const processResponseWithMeta = async <T>(response: Response): Promise<TApiSuccessResponse<T>> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Handle API error responses
    if (isJson && 'success' in data && data.success === false) {
      throw new ApiError(data as TApiErrorResponse);
    }
    
    // Handle non-API error responses
    throw new Error(`HTTP error ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data as TApiSuccessResponse<T>;
};

/**
 * Handle authentication errors
 */
export const handleAuthError = async (error: ApiError): Promise<boolean> => {
  if (error.statusCode === 401 && error.errorCode === 'TOKEN_EXPIRED') {
    try {
      // Attempt to refresh the token
      await refreshAuthToken();
      return true; // Token refreshed successfully
    } catch (refreshError) {
      // Token refresh failed
      return false;
    }
  }
  return false; // Not an auth error or couldn't be handled
};

/**
 * Execute fetch request with timeout, interceptors, and logging
 */
export const fetchWithTimeout = async <T>(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<T> => {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options;
  const { controller, timeoutId } = createAbortControllerWithTimeout(timeout);

  // Generate correlation ID for this request
  const correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Process request through interceptors
    const processedOptions = await interceptorManager.processRequest(fetchOptions, url);
    
    // Add correlation ID to headers
    const headers = new Headers(processedOptions.headers);
    if (!headers.has('X-Correlation-ID')) {
      headers.set('X-Correlation-ID', correlationId);
    }
    
    // Create request log info
    const requestLogInfo = apiLogger.createRequestLogInfo(url, { ...processedOptions, headers }, correlationId);
    const startTime = Date.now();
    
    // Log the request
    apiLogger.logRequest(requestLogInfo);

    // Merge the abort signal
    const signal = options.signal 
      ? mergeSignals(options.signal, controller.signal) 
      : controller.signal;

    const response = await fetch(url, { ...processedOptions, headers, signal });
    const result = await processResponse<T>(response);
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Process response through interceptors if it's a success response
    if (result && typeof result === 'object' && 'success' in result && result.success) {
      const processedResponse = await interceptorManager.processResponse(result as any);
      
      // Log the response
      const responseLogInfo = apiLogger.createResponseLogInfo(processedResponse, correlationId);
      responseLogInfo.duration = duration;
      apiLogger.logResponse(responseLogInfo, requestLogInfo);
      
      return processedResponse as T;
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - (Date.now() - timeout); // Approximate duration
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new TimeoutError(timeout);
      
      // Log timeout error
      const errorInfo = {
        statusCode: 408,
        errorCode: 'TIMEOUT',
        message: timeoutError.message,
        correlationId,
        timestamp: new Date().toISOString(),
        duration
      };
      apiLogger.logError(errorInfo);
      
      throw timeoutError;
    }
    
    if (error instanceof ApiError) {
      // Log API error
      const errorLogInfo = apiLogger.createErrorLogInfo(error, correlationId);
      errorLogInfo.duration = duration;
      apiLogger.logError(errorLogInfo);
      
      // Process error through interceptors
      await interceptorManager.processError(error);
    }
    
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Execute fetch request with timeout and return full response
 */
export const fetchWithTimeoutAndMeta = async <T>(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<TApiSuccessResponse<T>> => {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options;
  const { controller, timeoutId } = createAbortControllerWithTimeout(timeout);

  try {
    const signal = options.signal 
      ? mergeSignals(options.signal, controller.signal) 
      : controller.signal;

    const response = await fetch(url, { ...fetchOptions, signal });
    return await processResponseWithMeta<T>(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TimeoutError(timeout);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Prepare request headers with optional auth
 */
export const prepareHeaders = async (
  options: BaseApiClientOptions
): Promise<Headers> => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (options.withAuth !== false) {
    await addAuthHeaders(headers);
  }
  
  return headers;
};

/**
 * Create request options for fetch
 */
export const createRequestOptions = (
  method: string,
  headers: Headers,
  options: BaseApiClientOptions,
  body?: any
): RequestInit & { timeout?: number } => {
  return {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
    signal: options.signal,
    timeout: options.timeout,
  };
};

/**
 * Create multipart form data request options
 */
export const createFormDataRequestOptions = (
  headers: Headers,
  formData: FormData,
  options: BaseApiClientOptions
): RequestInit & { timeout?: number } => {
  // Don't set Content-Type for FormData, it will be set automatically with boundary
  headers.delete('Content-Type');
  
  return {
    method: 'POST',
    headers,
    body: formData,
    signal: options.signal,
    timeout: options.timeout || 60000, // Longer timeout for file uploads
  };
};

/**
 * Build full URL from endpoint
 */
export const buildUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Retry wrapper for API calls with authentication error handling
 */
export const retryWithAuth = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> => {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      if (error instanceof ApiError && retries < maxRetries) {
        const shouldRetry = await handleAuthError(error);
        if (shouldRetry) {
          retries++;
          continue;
        }
      }
      throw error;
    }
  }
  
  throw new Error('Maximum retries exceeded');
};
