/**
 * @file utils/api-error.utils.ts
 * @description Custom error classes for API error handling in the LMS application.
 * Implements a robust error hierarchy for standardized error handling across the application.
 * @module utils/api-error
 */

/**
 * HTTP Status Codes as constants for type safety
 */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  TOO_MANY_REQUESTS: 429,
  LEGAL_RESTRICTION: 451,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  INSUFFICIENT_STORAGE: 507,
} as const;

/**
 * Standard error codes as enum for consistency
 */
export const ERROR_CODES = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RESOURCE_GONE: 'RESOURCE_GONE',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  LEGAL_RESTRICTION: 'LEGAL_RESTRICTION',
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',  // Database-specific errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',
  DATABASE_TIMEOUT: 'DATABASE_TIMEOUT',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  DATABASE_SCHEMA_ERROR: 'DATABASE_SCHEMA_ERROR',
  DATA_INTEGRITY_ERROR: 'DATA_INTEGRITY_ERROR',

  // JWT and Token errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Data format and validation errors
  INVALID_JSON: 'INVALID_JSON',
  INVALID_URI: 'INVALID_URI',
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',
  INVALID_RELATIONSHIP: 'INVALID_RELATIONSHIP',
  INVALID_RELATION: 'INVALID_RELATION',
  INVALID_QUERY_PARAMETERS: 'INVALID_QUERY_PARAMETERS',

  // Constraint and relationship errors
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  RELATED_RECORD_NOT_FOUND: 'RELATED_RECORD_NOT_FOUND',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE',

  // Domain-specific errors
  TENANT_ERROR: 'TENANT_ERROR',
  COURSE_ERROR: 'COURSE_ERROR',
  ENROLLMENT_ERROR: 'ENROLLMENT_ERROR',
} as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Options for creating an API error
 */
export interface ApiErrorOptions {
  /** Original error that caused this error */
  cause?: Error | undefined;
  /** Additional validation error details */
  details?: Record<string, string[]> | undefined;
  /** Whether this is an operational error (vs a programming error) */
  isOperational?: boolean | undefined;
  /** Additional context for the error */
  context?: Record<string, any> | undefined;
}

/**
 * Base API Error class for standardized error handling
 * Extends the native Error class with additional properties needed for API responses
 */
export class ApiError extends Error {
  /** HTTP status code to be used in the response */
  statusCode: number;
  /** Error code for programmatic client-side handling */
  errorCode?: ErrorCode | string | undefined;
  /** Validation details or additional error context */
  details?: Record<string, string[]> | undefined;
  /** Whether this is an operational error (expected in normal operation) vs a programming error */
  isOperational: boolean;
  /** Additional context data for logging/debugging */
  context?: Record<string, any> | undefined;
  /** Original error that caused this error */
  override cause?: Error | undefined;  /**
   * Create a new API error
   * @param message Human-readable error message
   * @param statusCode HTTP status code (defaults to 500)
   * @param errorCode Optional error code for client handling (for programmatic responses)
   * @param options Additional options like cause, details, operational flag, and context
   */ constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCode | string,
    options?: ApiErrorOptions
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = options?.details;
    this.isOperational = options?.isOperational ?? true; // Default to operational errors
    this.context = options?.context;
    this.cause = options?.cause;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);

    // Capture stack trace (Node.js specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  /**
   * Type guard to check if an error is an ApiError
   * @param error The error to check
   * @returns True if the error is an ApiError
   */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
  /**
   * Create a standardized string representation of the error
   * @returns String representation of the error
   */
  override toString(): string {
    return `[${this.constructor.name}] ${this.statusCode} - ${this.message}${this.errorCode ? ` (${this.errorCode})` : ''}`;
  }

  /**
   * Convert to plain object for logging or serialization
   * @param includeStack Whether to include the stack trace
   * @returns Plain object representation
   */
  toJSON(includeStack = false): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      details: this.details,
      isOperational: this.isOperational,
      context: this.context,
      stack: includeStack ? this.stack : undefined
    };
  }
  /**
   * Create a new error with additional context
   * @param additionalContext Additional context to add
   * @returns New ApiError instance with combined context
   */
  withContext(additionalContext: Record<string, any>): ApiError {
    const ErrorConstructor = this.constructor as new (
      message: string,
      statusCode: number,
      errorCode?: string,
      options?: ApiErrorOptions
    ) => ApiError;

    const newError = new ErrorConstructor(
      this.message,
      this.statusCode,
      this.errorCode,
      {
        details: this.details,
        isOperational: this.isOperational,
        cause: this.cause,
        context: { ...this.context, ...additionalContext }
      }
    );

    return newError;
  }
}

/**
 * 400 Bad Request - Invalid input or parameters
 */
export class BadRequestError extends ApiError {
  constructor(
    message = 'Bad request',
    errorCode: ErrorCode | string = ERROR_CODES.BAD_REQUEST,
    options?: Omit<ApiErrorOptions, 'details'> & { details?: Record<string, string[]> | undefined }
  ) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode, options?.details ? { ...options, details: options.details } : options);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends ApiError {
  constructor(
    message = 'Authentication required',
    errorCode = 'UNAUTHORIZED',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode, options);
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends ApiError {
  constructor(
    message = 'Insufficient permissions',
    errorCode = 'FORBIDDEN',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.FORBIDDEN, errorCode, options);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends ApiError {
  constructor(
    message = 'Resource not found',
    errorCode = 'NOT_FOUND',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.NOT_FOUND, errorCode, options);
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate entry)
 */
export class ConflictError extends ApiError {
  constructor(
    message = 'Resource conflict',
    errorCode = 'CONFLICT',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.CONFLICT, errorCode, options);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends ApiError {
  constructor(
    message = 'Validation failed',
    details?: Record<string, string[]>,
    errorCode = 'VALIDATION_ERROR',
    options?: Omit<ApiErrorOptions, 'details'>
  ) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errorCode, details ? { ...options, details } : options);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends ApiError {
  constructor(
    message = 'Internal server error',
    errorCode = 'INTERNAL_SERVER_ERROR',
    options?: ApiErrorOptions
  ) {
    // Internal server errors are typically not operational
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode, {
      ...options,
      isOperational: options?.isOperational ?? false
    });
  }
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(
    message = 'Service temporarily unavailable',
    errorCode = 'SERVICE_UNAVAILABLE',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, errorCode, options);
  }
}

/**
 * 402 Payment Required - Premium feature or subscription required
 */
export class PaymentRequiredError extends ApiError {
  constructor(
    message = 'Payment required to access this feature',
    errorCode = 'PAYMENT_REQUIRED',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.PAYMENT_REQUIRED, errorCode, options);
  }
}

/**
 * 410 Gone - Resource no longer available
 */
export class GoneError extends ApiError {
  constructor(
    message = 'Resource is no longer available',
    errorCode = 'RESOURCE_GONE',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.GONE, errorCode, options);
  }
}

/**
 * 413 Payload Too Large - Request entity too large
 */
export class PayloadTooLargeError extends ApiError {
  constructor(
    message = 'Request payload too large',
    errorCode = 'PAYLOAD_TOO_LARGE',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.PAYLOAD_TOO_LARGE, errorCode, options);
  }
}

/**
 * 423 Locked - Resource is locked (e.g., course being edited by another user)
 */
export class LockedError extends ApiError {
  constructor(
    message = 'Resource is currently locked',
    errorCode = 'RESOURCE_LOCKED',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.LOCKED, errorCode, options);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class TooManyRequestsError extends ApiError {
  constructor(
    message = 'Rate limit exceeded',
    errorCode = 'RATE_LIMIT_EXCEEDED',
    options?: ApiErrorOptions & { retryAfter?: number }
  ) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, errorCode, options);

    // Add retry-after information to the context if provided
    if (options?.retryAfter) {
      this.context = {
        ...this.context,
        retryAfter: options.retryAfter
      };
    }
  }
}

/**
 * 451 Unavailable For Legal Reasons - Content removed for legal reasons
 */
export class LegalRestrictionError extends ApiError {
  constructor(
    message = 'Content unavailable due to legal restrictions',
    errorCode = 'LEGAL_RESTRICTION',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.LEGAL_RESTRICTION, errorCode, options);
  }
}

/**
 * 507 Insufficient Storage - Storage quota exceeded
 */
export class InsufficientStorageError extends ApiError {
  constructor(
    message = 'Storage quota exceeded',
    errorCode = 'STORAGE_QUOTA_EXCEEDED',
    options?: ApiErrorOptions
  ) {
    super(message, HTTP_STATUS.INSUFFICIENT_STORAGE, errorCode, options);
  }
}

/**
 * Domain-specific error for tenant operations
 */
export class TenantError extends ApiError {
  constructor(
    message = 'Tenant operation failed',
    statusCode = 400,
    errorCode = 'TENANT_ERROR',
    options?: ApiErrorOptions
  ) {
    super(message, statusCode, errorCode, options);
  }
}

/**
 * Domain-specific error for course operations
 */
export class CourseError extends ApiError {
  constructor(
    message = 'Course operation failed',
    statusCode = 400,
    errorCode = 'COURSE_ERROR',
    options?: ApiErrorOptions
  ) {
    super(message, statusCode, errorCode, options);
  }
}

/**
 * Domain-specific error for enrollment operations
 */
export class EnrollmentError extends ApiError {
  constructor(
    message = 'Enrollment operation failed',
    statusCode = 400,
    errorCode = 'ENROLLMENT_ERROR',
    options?: ApiErrorOptions
  ) {
    super(message, statusCode, errorCode, options);
  }
}

/**
 * Error for external service integration failures (e.g., Bunny.net)
 */
export class ExternalServiceError extends ApiError {
  constructor(
    message = 'External service error',
    statusCode = 502,
    errorCode = 'EXTERNAL_SERVICE_ERROR',
    options?: ApiErrorOptions & { service?: string }
  ) {
    super(message, statusCode, errorCode, options);

    // Add service information to the context if provided
    if (options?.service) {
      this.context = {
        ...this.context,
        service: options.service
      };
    }
  }
}
