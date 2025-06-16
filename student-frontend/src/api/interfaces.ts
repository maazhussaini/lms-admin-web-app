/**
 * @file api/interfaces.ts
 * @description Comprehensive API interfaces and abstractions to prevent circular dependencies
 */

import { TApiSuccessResponse } from '@shared/types/api.types';

/**
 * Base API client options
 */
export interface BaseApiClientOptions {
  headers?: Record<string, string>;
  withAuth?: boolean;
  signal?: AbortSignal;
  timeout?: number;
}

/**
 * API client interface
 */
export interface IApiClient {
  get<T = any>(endpoint: string, options?: BaseApiClientOptions): Promise<T>;
  post<T = any, D = any>(endpoint: string, data?: D, options?: BaseApiClientOptions): Promise<T>;
  put<T = any, D = any>(endpoint: string, data?: D, options?: BaseApiClientOptions): Promise<T>;
  delete<T = any>(endpoint: string, options?: BaseApiClientOptions): Promise<T>;
  uploadFile<T = any>(endpoint: string, file: File, fieldName?: string, options?: BaseApiClientOptions): Promise<T>;
}

/**
 * Enhanced API client with metadata support
 */
export interface IApiClientWithMeta {
  get<_T = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    options?: BaseApiClientOptions & { includeMeta?: IncludeMeta }
  ): Promise<any>;
  
  getPaginated<_T = any, IncludeMeta extends boolean = false>(
    endpoint: string,
    options?: BaseApiClientOptions & { includeMeta?: IncludeMeta }
  ): Promise<any>;
  
  post<_T = any, D = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    data?: D, 
    options?: BaseApiClientOptions & { includeMeta?: IncludeMeta }
  ): Promise<any>;
  
  put<_T = any, D = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    data?: D, 
    options?: BaseApiClientOptions & { includeMeta?: IncludeMeta }
  ): Promise<any>;
  
  delete<_T = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    options?: BaseApiClientOptions & { includeMeta?: IncludeMeta }
  ): Promise<any>;
}

/**
 * Auth provider for API client
 */
export interface IApiAuthProvider {
  getAuthToken(): Promise<string | null>;
  refreshAuthToken(): Promise<boolean>;
  onAuthError(error: any): Promise<boolean>;
  clearAuth(): Promise<void>;
}

// =============================================================================
// LOGGING AND INTERCEPTOR ABSTRACTIONS (from abstractions.ts)
// =============================================================================

/**
 * Basic request information for logging
 */
export interface IRequestInfo {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  correlationId?: string;
  timestamp: string;
}

/**
 * Basic response information for logging
 */
export interface IResponseInfo {
  statusCode: number;
  headers?: Record<string, string>;
  data?: any;
  correlationId?: string;
  timestamp: string;
  duration?: number;
}

/**
 * Basic error information for logging
 */
export interface IErrorInfo {
  statusCode: number;
  errorCode?: string;
  message: string;
  details?: Record<string, string[]>;
  correlationId?: string;
  timestamp: string;
  duration?: number;
}

/**
 * Logger interface - prevents circular dependencies
 */
export interface IApiLogger {
  logRequest(info: IRequestInfo): void;
  logResponse(info: IResponseInfo, requestInfo?: IRequestInfo): void;
  logError(info: IErrorInfo, requestInfo?: IRequestInfo): void;
  createRequestLogInfo(url: string, options: any, correlationId?: string): IRequestInfo;
  createResponseLogInfo(response: any, correlationId?: string): IResponseInfo;
  createErrorLogInfo(error: any, correlationId?: string): IErrorInfo;
}

/**
 * Interceptor interfaces - prevents circular dependencies
 */
export interface IRequestInterceptor {
  (config: RequestInit, url: string): RequestInit | Promise<RequestInit>;
}

export interface IResponseInterceptor {
  <T>(response: TApiSuccessResponse<T>): TApiSuccessResponse<T> | Promise<TApiSuccessResponse<T>>;
}

export interface IErrorInterceptor {
  (error: any): Promise<never> | any | Promise<any>;
}

/**
 * Interceptor manager interface
 */
export interface IInterceptorManager {
  processRequest(config: RequestInit, url: string): Promise<RequestInit>;
  processResponse<T>(response: TApiSuccessResponse<T>): Promise<TApiSuccessResponse<T>>;
  processError(error: any): Promise<never>;
}

// =============================================================================
// EVENT SYSTEM FOR LOOSE COUPLING
// =============================================================================

/**
 * Event emitter interface for loose coupling
 */
export interface IEventEmitter {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

/**
 * API events for loose coupling
 */
export const API_EVENTS = {
  REQUEST_START: 'request:start',
  REQUEST_SUCCESS: 'request:success',
  REQUEST_ERROR: 'request:error',
  AUTH_TOKEN_REFRESH: 'auth:token:refresh',
  AUTH_ERROR: 'auth:error',
} as const;

/**
 * Simple event emitter implementation
 */
export class EventEmitter implements IEventEmitter {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

/**
 * Global event emitter instance
 */
export const apiEvents = new EventEmitter();
