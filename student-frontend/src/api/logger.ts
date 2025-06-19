/**
 * @file api/logger.ts
 * @description Enhanced API request/response logging utilities
 */

import { ApiError } from '@/types/auth.types';
import { TApiSuccessResponse } from '@shared/types/api.types';
import { 
  IApiLogger, 
  IRequestInfo, 
  IResponseInfo, 
  IErrorInfo 
} from '@/api/interfaces';

/**
 * Log levels for API operations
 */
export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

/**
 * Configuration for API logger
 */
export interface ApiLoggerConfig {
  enabled: boolean;
  level: LogLevel;
  enableColors: boolean;
  enableGrouping: boolean;
  enableTimestamps: boolean;
  enableCorrelationId: boolean;
  maxDataLength?: number;
  sensitiveHeaders: string[];
  sensitiveFields: string[];
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: ApiLoggerConfig = {
  enabled: import.meta.env.DEV,
  level: LogLevel.DEBUG,
  enableColors: true,
  enableGrouping: true,
  enableTimestamps: true,
  enableCorrelationId: true,
  maxDataLength: 1000,
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token'
  ],
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'key',
    'credential',
    'authorization'
  ]
};

/**
 * Request information for logging
 */
export interface RequestLogInfo {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  correlationId?: string;
  timestamp: string;
}

/**
 * Response information for logging
 */
export interface ResponseLogInfo {
  statusCode: number;
  headers?: Record<string, string>;
  data?: any;
  correlationId?: string;
  timestamp: string;
  duration?: number;
}

/**
 * Error information for logging
 */
export interface ErrorLogInfo {
  statusCode: number;
  errorCode?: string;
  message: string;
  details?: Record<string, string[]>;
  correlationId?: string;
  timestamp: string;
  duration?: number;
}

/**
 * API Logger class implementing the interface
 */
export class ApiLogger implements IApiLogger {
  private config: ApiLoggerConfig;
  private requestTimings = new Map<string, number>();

  constructor(config: Partial<ApiLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<ApiLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if logging is enabled for the given level
   */
  private isEnabled(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex <= currentLevelIndex;
  }

  /**
   * Sanitize sensitive data from objects
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.config.sensitiveFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize headers
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.config.sensitiveHeaders.some(header => 
        lowerKey.includes(header.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Truncate data if it exceeds maximum length
   */
  private truncateData(data: any): any {
    if (!this.config.maxDataLength) {
      return data;
    }

    const jsonString = JSON.stringify(data);
    if (jsonString.length <= this.config.maxDataLength) {
      return data;
    }

    const truncated = jsonString.substring(0, this.config.maxDataLength);
    return {
      __truncated: true,
      __originalLength: jsonString.length,
      __data: truncated + '...'
    };
  }

  /**
   * Format timestamp
   */
  private formatTimestamp(timestamp: string): string {
    if (!this.config.enableTimestamps) {
      return '';
    }
    return new Date(timestamp).toLocaleTimeString();
  }


  /**
   * Log API request
   */
  logRequest(info: IRequestInfo): void {
    if (!this.isEnabled(LogLevel.DEBUG)) return;

    const timestamp = this.formatTimestamp(info.timestamp);
    const correlationId = this.config.enableCorrelationId && info.correlationId 
      ? `[${info.correlationId}]` 
      : '';

    if (this.config.enableGrouping) {
      console.group(
        `📤 API Request: ${info.method} ${info.url} ${correlationId} ${timestamp}`.trim()
      );
    } else {
      console.log(
        `📤 API Request: ${info.method} ${info.url} ${correlationId} ${timestamp}`.trim()
      );
    }

    if (info.headers && Object.keys(info.headers).length > 0) {
      console.log('Headers:', this.sanitizeHeaders(info.headers));
    }

    if (info.body !== undefined) {
      const sanitizedBody = this.sanitizeData(info.body);
      const truncatedBody = this.truncateData(sanitizedBody);
      console.log('Body:', truncatedBody);
    }

    if (this.config.enableGrouping) {
      console.groupEnd();
    }

    // Store timing for duration calculation
    if (info.correlationId) {
      this.requestTimings.set(info.correlationId, Date.now());
    }
  }

  /**
   * Log API response
   */
  logResponse(info: IResponseInfo, _originalRequest?: IRequestInfo): void {
    if (!this.isEnabled(LogLevel.DEBUG)) return;

    const timestamp = this.formatTimestamp(info.timestamp);
    const correlationId = this.config.enableCorrelationId && info.correlationId 
      ? `[${info.correlationId}]` 
      : '';

    // Calculate duration if possible
    let duration = info.duration;
    if (!duration && info.correlationId) {
      const startTime = this.requestTimings.get(info.correlationId);
      if (startTime) {
        duration = Date.now() - startTime;
        this.requestTimings.delete(info.correlationId);
      }
    }

    const durationText = duration ? `(${duration}ms)` : '';

    if (this.config.enableGrouping) {
      console.group(
        `📥 API Response: ${info.statusCode} ${correlationId} ${durationText} ${timestamp}`.trim()
      );
    } else {
      console.log(
        `📥 API Response: ${info.statusCode} ${correlationId} ${durationText} ${timestamp}`.trim()
      );
    }

    if (info.headers && Object.keys(info.headers).length > 0) {
      console.log('Headers:', this.sanitizeHeaders(info.headers));
    }

    if (info.data !== undefined) {
      const sanitizedData = this.sanitizeData(info.data);
      const truncatedData = this.truncateData(sanitizedData);
      console.log('Response:', truncatedData);
    }

    if (this.config.enableGrouping) {
      console.groupEnd();
    }
  }

  /**
   * Log API error
   */
  logError(info: IErrorInfo, originalRequest?: IRequestInfo): void {
    if (!this.isEnabled(LogLevel.ERROR)) return;

    const timestamp = this.formatTimestamp(info.timestamp);
    const correlationId = this.config.enableCorrelationId && info.correlationId 
      ? `[${info.correlationId}]` 
      : '';

    // Calculate duration if possible
    let duration = info.duration;
    if (!duration && info.correlationId) {
      const startTime = this.requestTimings.get(info.correlationId);
      if (startTime) {
        duration = Date.now() - startTime;
        this.requestTimings.delete(info.correlationId);
      }
    }

    const durationText = duration ? `(${duration}ms)` : '';

    if (this.config.enableGrouping) {
      console.group(
        `❌ API Error: ${info.statusCode} ${correlationId} ${durationText} ${timestamp}`.trim()
      );
    } else {
      console.error(
        `❌ API Error: ${info.statusCode} ${correlationId} ${durationText} ${timestamp}`.trim()
      );
    }

    console.error('Message:', info.message);
    
    if (info.errorCode) {
      console.log('Error Code:', info.errorCode);
    }

    if (info.details && Object.keys(info.details).length > 0) {
      console.log('Details:', info.details);
    }

    if (originalRequest) {
      console.log('Original Request:', {
        method: originalRequest.method,
        url: originalRequest.url,
        body: this.sanitizeData(originalRequest.body)
      });
    }

    if (this.config.enableGrouping) {
      console.groupEnd();
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    correlationId: string,
    metrics: {
      requestSize?: number;
      responseSize?: number;
      duration: number;
      cacheHit?: boolean;
      retryCount?: number;
    }
  ): void {
    if (!this.isEnabled(LogLevel.INFO)) return;

    const logData: any = {
      correlationId,
      duration: `${metrics.duration}ms`,
    };

    if (metrics.requestSize) {
      logData.requestSize = `${(metrics.requestSize / 1024).toFixed(2)}KB`;
    }

    if (metrics.responseSize) {
      logData.responseSize = `${(metrics.responseSize / 1024).toFixed(2)}KB`;
    }

    if (metrics.cacheHit !== undefined) {
      logData.cacheHit = metrics.cacheHit;
    }

    if (metrics.retryCount) {
      logData.retryCount = metrics.retryCount;
    }

    console.log('📊 API Performance:', logData);
  }

  /**
   * Create request log info from fetch parameters
   */
  createRequestLogInfo(
    url: string,
    init: RequestInit,
    correlationId?: string
  ): IRequestInfo {
    const headers = init.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {};
    
    let body: any;
    if (init.body) {
      try {
        body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
      } catch {
        body = init.body;
      }
    }

    return {
      method: init.method || 'GET',
      url,
      headers,
      body,
      correlationId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create response log info from API response
   */
  createResponseLogInfo<T>(
    response: TApiSuccessResponse<T>,
    correlationId?: string
  ): IResponseInfo {
    return {
      statusCode: response.statusCode,
      data: response.data,
      correlationId: correlationId || response.correlationId,
      timestamp: response.timestamp
    };
  }

  /**
   * Create error log info from API error
   */
  createErrorLogInfo(
    error: ApiError,
    correlationId?: string
  ): IErrorInfo {
    return {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
      details: error.details,
      correlationId: correlationId || error.correlationId,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Default API logger instance
 */
export const apiLogger = new ApiLogger();

/**
 * Utility functions for common logging scenarios
 */
export const logUtils = {
  /**
   * Log a complete request-response cycle
   */
  logRequestResponse: <T>(
    request: RequestLogInfo,
    response: TApiSuccessResponse<T>,
    duration?: number
  ): void => {
    apiLogger.logRequest(request);
    
    const responseInfo = apiLogger.createResponseLogInfo(response, request.correlationId);
    if (duration) {
      responseInfo.duration = duration;
    }
    
    apiLogger.logResponse(responseInfo, request);
  },

  /**
   * Log a complete request-error cycle
   */
  logRequestError: (
    request: RequestLogInfo,
    error: ApiError,
    duration?: number
  ): void => {
    apiLogger.logRequest(request);
    
    const errorInfo = apiLogger.createErrorLogInfo(error, request.correlationId);
    if (duration) {
      errorInfo.duration = duration;
    }
    
    apiLogger.logError(errorInfo, request);
  }
};
