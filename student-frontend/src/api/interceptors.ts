/**
 * @file api/interceptors.ts
 * @description Request and response interceptors for consistent API handling
 */

import { ApiError } from './client';
import { TApiSuccessResponse } from '@shared/types/api.types';

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (config: RequestInit, url: string) => RequestInit | Promise<RequestInit>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = <T>(response: TApiSuccessResponse<T>) => TApiSuccessResponse<T> | Promise<TApiSuccessResponse<T>>;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: ApiError) => Promise<never> | ApiError | Promise<ApiError>;

/**
 * Interceptor configuration
 */
export interface InterceptorConfig {
  id: string;
  priority?: number; // Higher numbers run first
}

/**
 * Request interceptor with configuration
 */
export interface RequestInterceptorWithConfig extends InterceptorConfig {
  interceptor: RequestInterceptor;
}

/**
 * Response interceptor with configuration
 */
export interface ResponseInterceptorWithConfig extends InterceptorConfig {
  interceptor: ResponseInterceptor;
}

/**
 * Error interceptor with configuration
 */
export interface ErrorInterceptorWithConfig extends InterceptorConfig {
  interceptor: ErrorInterceptor;
}

/**
 * API Interceptor Manager
 */
export class ApiInterceptorManager {
  private requestInterceptors: RequestInterceptorWithConfig[] = [];
  private responseInterceptors: ResponseInterceptorWithConfig[] = [];
  private errorInterceptors: ErrorInterceptorWithConfig[] = [];

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(
    interceptor: RequestInterceptor,
    config: InterceptorConfig = { id: `req_${Date.now()}`, priority: 0 }
  ): string {
    const interceptorWithConfig: RequestInterceptorWithConfig = {
      ...config,
      interceptor
    };
    
    this.requestInterceptors.push(interceptorWithConfig);
    this.requestInterceptors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    return config.id;
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(
    interceptor: ResponseInterceptor,
    config: InterceptorConfig = { id: `res_${Date.now()}`, priority: 0 }
  ): string {
    const interceptorWithConfig: ResponseInterceptorWithConfig = {
      ...config,
      interceptor
    };
    
    this.responseInterceptors.push(interceptorWithConfig);
    this.responseInterceptors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    return config.id;
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(
    interceptor: ErrorInterceptor,
    config: InterceptorConfig = { id: `err_${Date.now()}`, priority: 0 }
  ): string {
    const interceptorWithConfig: ErrorInterceptorWithConfig = {
      ...config,
      interceptor
    };
    
    this.errorInterceptors.push(interceptorWithConfig);
    this.errorInterceptors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    return config.id;
  }

  /**
   * Remove an interceptor by ID
   */
  removeInterceptor(id: string): boolean {
    const requestIndex = this.requestInterceptors.findIndex(i => i.id === id);
    if (requestIndex !== -1) {
      this.requestInterceptors.splice(requestIndex, 1);
      return true;
    }

    const responseIndex = this.responseInterceptors.findIndex(i => i.id === id);
    if (responseIndex !== -1) {
      this.responseInterceptors.splice(responseIndex, 1);
      return true;
    }

    const errorIndex = this.errorInterceptors.findIndex(i => i.id === id);
    if (errorIndex !== -1) {
      this.errorInterceptors.splice(errorIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Clear all interceptors
   */
  clearAll(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  /**
   * Process request through all request interceptors
   */
  async processRequest(config: RequestInit, url: string): Promise<RequestInit> {
    let processedConfig = config;
    
    for (const { interceptor } of this.requestInterceptors) {
      try {
        processedConfig = await Promise.resolve(interceptor(processedConfig, url));
      } catch (error) {
        console.warn('Request interceptor failed:', error);
        // Continue with the current config if interceptor fails
      }
    }
    
    return processedConfig;
  }

  /**
   * Process response through all response interceptors
   */
  async processResponse<T>(response: TApiSuccessResponse<T>): Promise<TApiSuccessResponse<T>> {
    let processedResponse = response;
    
    for (const { interceptor } of this.responseInterceptors) {
      try {
        processedResponse = await Promise.resolve(interceptor(processedResponse));
      } catch (error) {
        console.warn('Response interceptor failed:', error);
        // Continue with the current response if interceptor fails
      }
    }
    
    return processedResponse;
  }

  /**
   * Process error through all error interceptors
   */
  async processError(error: ApiError): Promise<never> {
    let processedError = error;
    
    for (const { interceptor } of this.errorInterceptors) {
      try {
        const result = await Promise.resolve(interceptor(processedError));
        if (result instanceof ApiError) {
          processedError = result;
        }
      } catch (interceptorError) {
        console.warn('Error interceptor failed:', interceptorError);
        // Continue with the current error if interceptor fails
      }
    }
    
    throw processedError;
  }

  /**
   * Get list of interceptor IDs by type
   */
  getInterceptorIds(): {
    request: string[];
    response: string[];
    error: string[];
  } {
    return {
      request: this.requestInterceptors.map(i => i.id),
      response: this.responseInterceptors.map(i => i.id),
      error: this.errorInterceptors.map(i => i.id)
    };
  }
}

/**
 * Global interceptor manager instance
 */
export const interceptorManager = new ApiInterceptorManager();

/**
 * Common interceptors
 */
export const commonInterceptors = {
  /**
   * Add correlation ID to all requests
   */
  addCorrelationId: (): string => {
    return interceptorManager.addRequestInterceptor(
      (config, _url) => {
        const headers = new Headers(config.headers);
        if (!headers.has('X-Correlation-ID')) {
          headers.set('X-Correlation-ID', `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        }
        return { ...config, headers };
      },
      { id: 'correlation-id', priority: 100 }
    );
  },

  /**
   * Add request timing
   */
  addRequestTiming: (): string => {
    const timingMap = new Map<string, number>();
    
    // Request interceptor to mark start time
    interceptorManager.addRequestInterceptor(
      (config, url) => {
        const correlationId = new Headers(config.headers).get('X-Correlation-ID') || url;
        timingMap.set(correlationId, Date.now());
        return config;
      },
      { id: 'timing-start', priority: 90 }
    );

    // Response interceptor to calculate duration
    return interceptorManager.addResponseInterceptor(
      (response) => {
        const correlationId = response.correlationId || 'unknown';
        const startTime = timingMap.get(correlationId);
        if (startTime) {
          const duration = Date.now() - startTime;
          timingMap.delete(correlationId);
          
          if (import.meta.env.DEV) {
            console.debug(`API Request completed in ${duration}ms`, { correlationId });
          }
        }
        return response;
      },
      { id: 'timing-end', priority: 90 }
    );
  },

  /**
   * Add user agent header
   */
  addUserAgent: (userAgent?: string): string => {
    const defaultUserAgent = `${import.meta.env.VITE_APP_NAME || 'LMS-Student'}/${import.meta.env.VITE_APP_VERSION || '1.0.0'}`;
    
    return interceptorManager.addRequestInterceptor(
      (config) => {
        const headers = new Headers(config.headers);
        if (!headers.has('User-Agent')) {
          headers.set('User-Agent', userAgent || defaultUserAgent);
        }
        return { ...config, headers };
      },
      { id: 'user-agent', priority: 80 }
    );
  },

  /**
   * Add request/response logging for development
   */
  addDevelopmentLogging: (): string[] => {
    if (!import.meta.env.DEV) {
      return [];
    }

    const requestId = interceptorManager.addRequestInterceptor(
      (config, url) => {
        console.group(`📤 API Request: ${config.method || 'GET'} ${url}`);
        console.log('Headers:', Object.fromEntries(new Headers(config.headers).entries()));
        if (config.body) {
          try {
            const body = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
            console.log('Body:', body);
          } catch {
            console.log('Body:', config.body);
          }
        }
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
        return config;
      },
      { id: 'dev-logging-request', priority: 10 }
    );

    const responseId = interceptorManager.addResponseInterceptor(
      (response) => {
        console.group(`📥 API Response: ${response.statusCode}`);
        console.log('Response:', response);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
        return response;
      },
      { id: 'dev-logging-response', priority: 10 }
    );

    const errorId = interceptorManager.addErrorInterceptor(
      (error) => {
        console.group(`❌ API Error: ${error.statusCode}`);
        console.error('Error:', error);
        console.log('Status:', error.statusCode);
        console.log('Code:', error.errorCode);
        if (error.details) console.log('Details:', error.details);
        console.log('Correlation ID:', error.correlationId);
        console.groupEnd();
        return error;
      },
      { id: 'dev-logging-error', priority: 10 }
    );

    return [requestId, responseId, errorId];
  },

  /**
   * Add automatic retry for network errors
   */
  addRetryOnNetworkError: (maxRetries: number = 3, delay: number = 1000): string => {
    const retryMap = new Map<string, number>();

    return interceptorManager.addErrorInterceptor(
      async (error) => {
        // Only retry network errors, not client errors (4xx)
        if (error.statusCode >= 400 && error.statusCode < 500) {
          return error;
        }

        const correlationId = error.correlationId || 'unknown';
        const currentRetries = retryMap.get(correlationId) || 0;

        if (currentRetries < maxRetries) {
          retryMap.set(correlationId, currentRetries + 1);
          
          console.warn(`Retrying request ${currentRetries + 1}/${maxRetries} after ${delay}ms`, {
            correlationId,
            error: error.message
          });
          
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, currentRetries)));
          
          // This error will be caught and the request will be retried
          throw new Error('RETRY_REQUEST');
        } else {
          retryMap.delete(correlationId);
          return error;
        }
      },
      { id: 'network-retry', priority: 50 }
    );
  },

  /**
   * Add response caching for GET requests
   */
  addResponseCaching: (ttlMs: number = 300000): string => { // 5 minutes default
    const cache = new Map<string, { response: any; expiry: number }>();

    const requestId = interceptorManager.addRequestInterceptor(
      (config, url) => {
        // Only cache GET requests
        if (config.method === 'GET' || !config.method) {
          const cacheKey = `${url}_${JSON.stringify(config.headers)}`;
          const cached = cache.get(cacheKey);
          
          if (cached && cached.expiry > Date.now()) {
            // Return cached response by throwing a special error
            throw new Error(`CACHED_RESPONSE:${JSON.stringify(cached.response)}`);
          }
        }
        return config;
      },
      { id: 'cache-request', priority: 95 }
    );

    const responseId = interceptorManager.addResponseInterceptor(
      (response) => {
        // Cache successful GET responses
        const cacheKey = `${response.correlationId || 'unknown'}_response`;
        cache.set(cacheKey, {
          response,
          expiry: Date.now() + ttlMs
        });
        return response;
      },
      { id: 'cache-response', priority: 95 }
    );

    return `${requestId},${responseId}`;
  }
};

/**
 * Initialize common interceptors
 */
export const initializeCommonInterceptors = (): void => {
  commonInterceptors.addCorrelationId();
  commonInterceptors.addRequestTiming();
  commonInterceptors.addUserAgent();
  
  if (import.meta.env.DEV) {
    commonInterceptors.addDevelopmentLogging();
  }
};
