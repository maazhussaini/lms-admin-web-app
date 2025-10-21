/**
 * @file api/client-utils.ts
 * @description Shared utilities for API clients to eliminate code duplication
 */

import { TApiErrorResponse, TApiSuccessResponse } from '@shared/types/api.types';
import { 
  IApiAuthProvider,
  IApiLogger, 
  IInterceptorManager, 
  apiEvents, 
  API_EVENTS 
} from '@/api/interfaces';
import { ApiError, TimeoutError } from '@/types/auth.types';

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

// Re-export errors from auth types
export { ApiError, TimeoutError };

/**
 * Dependency injection container for API utilities
 */
class ApiDependencies {
  private static instance: ApiDependencies;
  private authProvider: IApiAuthProvider | null = null;
  private logger: IApiLogger | null = null;
  private interceptorManager: IInterceptorManager | null = null;

  private constructor() {}

  static getInstance(): ApiDependencies {
    if (!ApiDependencies.instance) {
      ApiDependencies.instance = new ApiDependencies();
    }
    return ApiDependencies.instance;
  }

  setAuthProvider(provider: IApiAuthProvider): void {
    this.authProvider = provider;
  }

  setLogger(logger: IApiLogger): void {
    this.logger = logger;
  }

  setInterceptorManager(manager: IInterceptorManager): void {
    this.interceptorManager = manager;
  }

  getAuthProvider(): IApiAuthProvider | null {
    return this.authProvider;
  }

  getLogger(): IApiLogger | null {
    return this.logger;
  }

  getInterceptorManager(): IInterceptorManager | null {
    return this.interceptorManager;
  }
}

const dependencies = ApiDependencies.getInstance();

/**
 * Dependency injection setters
 */
export const setAuthProvider = (provider: IApiAuthProvider): void => {
  dependencies.setAuthProvider(provider);
};

export const setApiLogger = (logger: IApiLogger): void => {
  dependencies.setLogger(logger);
};

export const setInterceptorManager = (manager: IInterceptorManager): void => {
  dependencies.setInterceptorManager(manager);
};

/**
 * Create an abort controller with timeout
 */
export const createAbortControllerWithTimeout = (timeout: number): { controller: AbortController; timeoutId: number } => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort(`Request timed out after ${timeout}ms`);
  }, timeout);
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
  const authProvider = dependencies.getAuthProvider();
  if (authProvider) {
    const token = await authProvider.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
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
 * Handle authentication errors using the auth provider
 */
export const handleAuthError = async (error: ApiError): Promise<boolean> => {
  const authProvider = dependencies.getAuthProvider();
  
  // Handle 401 Unauthorized errors
  if (authProvider && error.statusCode === 401) {
    try {
      console.log('Attempting to refresh authentication token...');
      const refreshSuccess = await authProvider.onAuthError(error);
      
      if (refreshSuccess) {
        console.log('Token refresh successful - retrying request');
        return true;
      } else {
        console.error('Token refresh failed - authentication required');
        // Emit auth error event to trigger login redirect
        apiEvents.emit(API_EVENTS.AUTH_ERROR, {
          message: 'Authentication failed - please log in again',
          statusCode: error.statusCode,
          errorCode: error.errorCode,
          timestamp: new Date().toISOString()
        });
        return false;
      }
    } catch (refreshError) {
      console.error('Error during token refresh:', refreshError);
      // Emit auth error event
      apiEvents.emit(API_EVENTS.AUTH_ERROR, {
        message: 'Authentication error',
        error: refreshError,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }
  
  return false;
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
  let startTime = Date.now();
  
  try {
    // Process request through interceptors if available
    const interceptorManager = dependencies.getInterceptorManager();
    const processedOptions = interceptorManager 
      ? await interceptorManager.processRequest(fetchOptions, url)
      : fetchOptions;
    
    // Add correlation ID to headers
    const headers = new Headers(processedOptions.headers);
    if (!headers.has('X-Correlation-ID')) {
      headers.set('X-Correlation-ID', correlationId);
    }
    
    // Emit request start event
    apiEvents.emit(API_EVENTS.REQUEST_START, {
      url,
      options: { ...processedOptions, headers },
      correlationId,
      timestamp: new Date().toISOString()
    });
    
    // Log the request if logger is available
    const logger = dependencies.getLogger();
    if (logger) {
      const requestLogInfo = logger.createRequestLogInfo(url, { ...processedOptions, headers }, correlationId);
      startTime = Date.now();
      logger.logRequest(requestLogInfo);
    }

    // Merge the abort signal
    const signal = options.signal 
      ? mergeSignals(options.signal, controller.signal) 
      : controller.signal;

    const response = await fetch(url, { ...processedOptions, headers, signal });
    const result = await processResponse<T>(response);
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Process response through interceptors if available and it's a success response
    let finalResult: T = result;
    if (interceptorManager && result && typeof result === 'object' && 'success' in result && (result as any).success) {
      const processed = await interceptorManager.processResponse(result as any);
      finalResult = processed as T;
    }
    
    // Emit success event
    apiEvents.emit(API_EVENTS.REQUEST_SUCCESS, {
      url,
      response: finalResult,
      correlationId,
      duration
    });
    
    // Log the response if logger is available
    if (logger && result && typeof result === 'object' && 'success' in result) {
      const responseLogInfo = logger.createResponseLogInfo(result, correlationId);
      responseLogInfo.duration = duration;
      logger.logResponse(responseLogInfo);
    }
    
    return finalResult;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Handle AbortError - check if it's from timeout or manual cancellation
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Check if this is a timeout (our timeout controller) vs manual abort
      const isTimeout = error.message && error.message.includes('timed out after');
      
      if (isTimeout) {
        // This is a timeout error - treat as an actual error
        const timeoutError = new TimeoutError(timeout);
        
        // Emit error event
        apiEvents.emit(API_EVENTS.REQUEST_ERROR, {
          url,
          error: timeoutError,
          correlationId,
          duration
        });
        
        // Log timeout error if logger is available
        const logger = dependencies.getLogger();
        if (logger) {
          const errorInfo = logger.createErrorLogInfo(timeoutError as any, correlationId);
          errorInfo.duration = duration;
          logger.logError(errorInfo);
        }
        
        throw timeoutError;
      } else {
        // This is a manual abort (component unmount, new request, etc.)
        // Don't emit events or log, just silently re-throw to be caught by hooks
        throw error;
      }
    }
    
    // Handle other AbortError types (from Error instances)
    if (error instanceof Error && error.name === 'AbortError') {
      // This is also a manual abort, silently re-throw
      throw error;
    }
    
    if (error instanceof ApiError) {
      // Process error through interceptors if available
      const interceptorManager = dependencies.getInterceptorManager();
      if (interceptorManager) {
        await interceptorManager.processError(error);
      }
      
      // Emit error event
      apiEvents.emit(API_EVENTS.REQUEST_ERROR, {
        url,
        error,
        correlationId,
        duration
      });
      
      // Log API error if logger is available
      const logger = dependencies.getLogger();
      if (logger) {
        const errorLogInfo = logger.createErrorLogInfo(error, correlationId);
        errorLogInfo.duration = duration;
        logger.logError(errorLogInfo);
      }
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
    // Handle AbortError - check if it's from timeout or manual cancellation
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Check if this is a timeout (our timeout controller) vs manual abort
      const isTimeout = error.message && error.message.includes('timed out after');
      
      if (isTimeout) {
        // This is a timeout error - treat as an actual error
        throw new TimeoutError(timeout);
      } else {
        // This is a manual abort (component unmount, new request, etc.)
        // Just re-throw to be handled by the calling code
        throw error;
      }
    }
    
    // Handle other AbortError types (from Error instances)
    if (error instanceof Error && error.name === 'AbortError') {
      // This is also a manual abort, re-throw
      throw error;
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
        // Only attempt to retry authentication errors
        if (error.statusCode === 401) {
          const shouldRetry = await handleAuthError(error);
          if (shouldRetry) {
            retries++;
            console.log(`Retrying request after token refresh (attempt ${retries}/${maxRetries})`);
            continue;
          } else {
            // Authentication failed completely - don't retry
            console.error('Authentication failed - cannot retry request');
            throw error;
          }
        }
      }
      // For all other errors or if max retries reached, throw immediately
      throw error;
    }
  }
  
  throw new Error('Maximum retries exceeded');
};
