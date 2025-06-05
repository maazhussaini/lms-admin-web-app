/**
 * @file utils/api-error.utils.ts
 * @description Custom error classes for API error handling in the LMS application.
 * Implements a robust error hierarchy for standardized error handling across the application.
 * @module utils/api-error
 */

/**
 * Options for creating an API error
 */
export interface ApiErrorOptions {
  /** Original error that caused this error */
  cause?: Error;
  /** Additional validation error details */
  details?: Record<string, string[]>;
  /** Whether this is an operational error (vs a programming error) */
  isOperational?: boolean;
  /** Additional context for the error */
  context?: Record<string, any>;
}

/**
 * Base API Error class for standardized error handling
 * Extends the native Error class with additional properties needed for API responses
 */
export class ApiError extends Error {
  /** HTTP status code to be used in the response */
  statusCode: number;
  /** Error code for programmatic client-side handling */
  errorCode?: string;
  /** Validation details or additional error context */
  details?: Record<string, string[]>;
  /** Whether this is an operational error (expected in normal operation) vs a programming error */
  isOperational: boolean;
  /** Additional context data for logging/debugging */
  context?: Record<string, any>;
  /** Original error that caused this error */
  cause?: Error;
  
  /**
   * Create a new API error
   * @param message Human-readable error message
   * @param statusCode HTTP status code (defaults to 500)
   * @param errorCode Optional error code for client handling (for programmatic responses)
   * @param options Additional options like cause, details, operational flag, and context
   */  constructor(
    message: string,
    statusCode = 500,
    errorCode?: string,
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
  toString(): string {
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
    const newError = new (this.constructor as any)(
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
    errorCode = 'BAD_REQUEST',
    options?: Omit<ApiErrorOptions, 'details'> & { details?: Record<string, string[]> }
  ) {
    super(message, 400, errorCode, { ...options, details: options?.details });
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
    super(message, 401, errorCode, options);
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
    super(message, 403, errorCode, options);
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
    super(message, 404, errorCode, options);
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
    super(message, 409, errorCode, options);
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
    super(message, 422, errorCode, { ...options, details });
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
    super(message, 500, errorCode, { 
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
    super(message, 503, errorCode, options);
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
    super(message, 402, errorCode, options);
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
    super(message, 410, errorCode, options);
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
    super(message, 413, errorCode, options);
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
    super(message, 423, errorCode, options);
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
    super(message, 429, errorCode, options);
    
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
    super(message, 451, errorCode, options);
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
    super(message, 507, errorCode, options);
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
