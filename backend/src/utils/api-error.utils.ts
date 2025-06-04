/**
 * @file utils/api-error.utils.ts
 * @description Custom error classes for API error handling.
 */

/**
 * Base API Error class for standardized error handling
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  details?: Record<string, string[]>;
  
  /**
   * Create a new API error
   * @param message Error message
   * @param statusCode HTTP status code
   * @param errorCode Optional error code for client handling
   * @param details Optional validation error details
   */
  constructor(
    message: string,
    statusCode = 500,
    errorCode?: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
    
    // Capture stack trace (Node.js specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request - Invalid input or parameters
 */
export class BadRequestError extends ApiError {
  constructor(
    message = 'Bad request',
    errorCode = 'BAD_REQUEST',
    details?: Record<string, string[]>
  ) {
    super(message, 400, errorCode, details);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends ApiError {
  constructor(
    message = 'Authentication required',
    errorCode = 'UNAUTHORIZED'
  ) {
    super(message, 401, errorCode);
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends ApiError {
  constructor(
    message = 'Insufficient permissions',
    errorCode = 'FORBIDDEN'
  ) {
    super(message, 403, errorCode);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends ApiError {
  constructor(
    message = 'Resource not found',
    errorCode = 'NOT_FOUND'
  ) {
    super(message, 404, errorCode);
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate entry)
 */
export class ConflictError extends ApiError {
  constructor(
    message = 'Resource conflict',
    errorCode = 'CONFLICT'
  ) {
    super(message, 409, errorCode);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends ApiError {
  constructor(
    message = 'Validation failed',
    details?: Record<string, string[]>,
    errorCode = 'VALIDATION_ERROR'
  ) {
    super(message, 422, errorCode, details);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends ApiError {
  constructor(
    message = 'Internal server error',
    errorCode = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message, 500, errorCode);
  }
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(
    message = 'Service temporarily unavailable',
    errorCode = 'SERVICE_UNAVAILABLE'
  ) {
    super(message, 503, errorCode);
  }
}
