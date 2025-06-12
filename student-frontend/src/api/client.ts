import { TApiErrorResponse, TApiSuccessResponse } from '@shared/types/api.types';
import { getStoredAuthToken, refreshAuthToken } from '@/services/authService';

/**
 * API configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Interface for API client options
 */
export interface ApiClientOptions {
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
const createAbortControllerWithTimeout = (timeout: number): { controller: AbortController; timeoutId: number } => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
};

/**
 * Add authentication headers to request
 */
const addAuthHeaders = async (headers: Headers): Promise<Headers> => {
  const token = await getStoredAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

/**
 * Process API response
 */
async function processResponse<T>(response: Response): Promise<T> {
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
}

/**
 * Handle authentication errors
 */
async function handleAuthError(error: ApiError): Promise<boolean> {
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
}

/**
 * Execute fetch request with timeout and retries
 */
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<T> {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options;
  const { controller, timeoutId } = createAbortControllerWithTimeout(timeout);

  try {
    // Merge the abort signal
    const signal = options.signal 
      ? mergeSignals(options.signal, controller.signal) 
      : controller.signal;

    const response = await fetch(url, { ...fetchOptions, signal });
    return await processResponse<T>(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TimeoutError(timeout);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Merge multiple AbortSignals
 */
function mergeSignals(...signals: AbortSignal[]): AbortSignal {
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
}

/**
 * API client with authentication and error handling
 */
export const apiClient = {
  /**
   * Send GET request
   */
  async get<T = any>(
    endpoint: string, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (options.withAuth !== false) {
      await addAuthHeaders(headers);
    }
    
    try {
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, {
        method: 'GET',
        headers,
        signal: options.signal,
        timeout: options.timeout,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && await handleAuthError(error)) {
        // Retry the request with a new token
        return this.get<T>(endpoint, options);
      }
      throw error;
    }
  },

  /**
   * Send POST request
   */
  async post<T = any, D = any>(
    endpoint: string, 
    data?: D, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (options.withAuth !== false) {
      await addAuthHeaders(headers);
    }
    
    try {
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal: options.signal,
        timeout: options.timeout,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && await handleAuthError(error)) {
        // Retry the request with a new token
        return this.post<T, D>(endpoint, data, options);
      }
      throw error;
    }
  },

  /**
   * Send PUT request
   */
  async put<T = any, D = any>(
    endpoint: string, 
    data?: D, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (options.withAuth !== false) {
      await addAuthHeaders(headers);
    }
    
    try {
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        signal: options.signal,
        timeout: options.timeout,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && await handleAuthError(error)) {
        // Retry the request with a new token
        return this.put<T, D>(endpoint, data, options);
      }
      throw error;
    }
  },

  /**
   * Send DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (options.withAuth !== false) {
      await addAuthHeaders(headers);
    }
    
    try {
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, {
        method: 'DELETE',
        headers,
        signal: options.signal,
        timeout: options.timeout,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && await handleAuthError(error)) {
        // Retry the request with a new token
        return this.delete<T>(endpoint, options);
      }
      throw error;
    }
  },

  /**
   * Upload file
   */
  async uploadFile<T = any>(
    endpoint: string, 
    file: File, 
    fieldName: string = 'file',
    options: ApiClientOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const headers = new Headers(options.headers);
    // Don't set Content-Type, it will be set automatically with boundary
    
    if (options.withAuth !== false) {
      await addAuthHeaders(headers);
    }
    
    try {
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: options.signal,
        timeout: options.timeout || 60000, // Longer timeout for file uploads
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && await handleAuthError(error)) {
        // Retry the request with a new token
        return this.uploadFile<T>(endpoint, file, fieldName, options);
      }
      throw error;
    }
  }
};
