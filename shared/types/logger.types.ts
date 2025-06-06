/**
 * @file types/logger.types.ts
 * @description TypeScript type definitions for logger metadata and structures
 */

/**
 * Base metadata interface for all log entries
 */
export interface BaseLogMetadata {
  /**
   * IP address of the client making the request
   */
  ip?: string;
  
  /**
   * User agent string from the client
   */
  userAgent?: string;
  
  /**
   * Unique request/correlation ID for tracing
   */
  requestId?: string;
}

/**
 * User-related metadata for authenticated requests
 */
export interface UserLogMetadata extends BaseLogMetadata {
  /**
   * ID of the authenticated user
   */
  userId?: number;
  
  /**
   * Tenant ID of the authenticated user
   */
  tenantId?: number;
  
  /**
   * Role of the authenticated user
   */
  userRole?: string;
}

/**
 * Request logging metadata with performance information
 */
export interface RequestLogMetadata extends UserLogMetadata {
  /**
   * HTTP method used for the request
   */
  method?: string;
  
  /**
   * Request URL path
   */
  path?: string;
  
  /**
   * HTTP status code of the response
   */
  statusCode?: number;
  
  /**
   * Request duration in milliseconds
   */
  duration?: number;
  
  /**
   * Size of the request body in bytes
   */
  requestSize?: number;
  
  /**
   * Size of the response body in bytes
   */
  responseSize?: number;
}

/**
 * Error logging metadata with additional context
 */
export interface ErrorLogMetadata extends UserLogMetadata {
  /**
   * Error code or type
   */
  errorCode?: string;
  
  /**
   * Error stack trace
   */
  stack?: string;
  
  /**
   * Additional error context
   */
  errorContext?: Record<string, any>;
  
  /**
   * HTTP method that caused the error
   */
  method?: string;
  
  /**
   * Request path that caused the error
   */
  path?: string;
}

/**
 * Security-related logging metadata
 */
export interface SecurityLogMetadata extends BaseLogMetadata {
  /**
   * Type of security event
   */
  securityEvent: 'AUTH_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'TOKEN_VALIDATION_FAILED';
  
  /**
   * User ID if available
   */
  userId?: number;
  
  /**
   * Tenant ID if available
   */
  tenantId?: number;
  
  /**
   * Additional security context
   */
  securityContext?: Record<string, any>;
}

/**
 * Audit logging metadata for data changes
 */
export interface AuditLogMetadata extends UserLogMetadata {
  /**
   * Type of operation performed
   */
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  
  /**
   * Resource type that was modified
   */
  resourceType: string;
  
  /**
   * Resource ID that was modified
   */
  resourceId?: number | string;
  
  /**
   * Previous values before the change
   */
  previousValues?: Record<string, any>;
  
  /**
   * New values after the change
   */
  newValues?: Record<string, any>;
}

/**
 * Performance logging metadata
 */
export interface PerformanceLogMetadata extends BaseLogMetadata {
  /**
   * Database query execution time in milliseconds
   */
  dbQueryTime?: number;
  
  /**
   * External API call time in milliseconds
   */
  externalApiTime?: number;
  
  /**
   * Memory usage in bytes
   */
  memoryUsage?: number;
  
  /**
   * CPU usage percentage
   */
  cpuUsage?: number;
}

/**
 * Union type for all possible log metadata types
 */
export type LogMetadata = 
  | BaseLogMetadata 
  | UserLogMetadata 
  | RequestLogMetadata 
  | ErrorLogMetadata 
  | SecurityLogMetadata 
  | AuditLogMetadata 
  | PerformanceLogMetadata;
