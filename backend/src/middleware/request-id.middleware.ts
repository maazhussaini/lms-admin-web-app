/**
 * @file middleware/request-id.middleware.ts
 * @description Middleware to generate and attach a unique request/correlation ID to each request.
 * This facilitates request tracing across distributed systems, logging, and debugging.
 * Follows industry standards by checking for existing headers and propagating IDs.
 * 
 * @see https://github.com/w3c/trace-context/ - W3C Trace Context specification
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Configuration options for the request ID middleware
 */
export interface RequestIdOptions {
  /** The header name to check for incoming correlation IDs (default: 'x-correlation-id') */
  correlationHeader?: string;
  /** The header name to check for incoming request IDs (default: 'x-request-id') */
  requestHeader?: string;
  /** The header name to use when sending the ID in the response (default: 'X-Correlation-ID') */
  responseHeader?: string;
  /** Custom ID generator function (default: randomUUID from crypto) */
  generator?: () => string;
  /** Whether to trust incoming IDs that don't match UUID format (default: false) */
  trustNonUuidIds?: boolean;
}

/**
 * Default configuration for the request ID middleware
 */
const DEFAULT_OPTIONS: RequestIdOptions = {
  correlationHeader: 'x-correlation-id',
  requestHeader: 'x-request-id',
  responseHeader: 'X-Correlation-ID',
  generator: randomUUID,
  trustNonUuidIds: false
};

/**
 * UUID v4 validation regex pattern
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Extends Express Request interface to include request ID
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Unique identifier for the current request
       * Used for tracing, logging, and debugging
       */
      id: string;
    }
  }
}

/**
 * Validates if a string is a valid UUID v4
 * @param id - The ID string to validate
 * @returns Whether the ID is a valid UUID v4
 */
const isValidUuid = (id: string): boolean => {
  return UUID_REGEX.test(id);
};

/**
 * Creates the request ID middleware with optional configuration
 * 
 * @param options - Configuration options for the middleware
 * @returns Express middleware function
 */
export const createRequestIdMiddleware = (
  options: RequestIdOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  // Merge default options with provided options
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Extract correlation ID from headers or generate new one
      const headerCorrelationId = req.headers[config.correlationHeader!] as string;
      const headerRequestId = req.headers[config.requestHeader!] as string;
      
      let correlationId = '';
      
      // Use existing ID if available and valid, otherwise generate new one
      if (headerCorrelationId && (config.trustNonUuidIds || isValidUuid(headerCorrelationId))) {
        correlationId = headerCorrelationId;
      } else if (headerRequestId && (config.trustNonUuidIds || isValidUuid(headerRequestId))) {
        correlationId = headerRequestId;
      } else {
        correlationId = config.generator!();
      }
      
      // Attach to request object
      req.id = correlationId;
      
      // Add to response headers
      res.setHeader(config.responseHeader!, correlationId);
    } catch (error) {
      // Fallback to a new UUID if something goes wrong
      req.id = randomUUID();
      res.setHeader(config.responseHeader!, req.id);
    }
    
    next();
  };
};

/**
 * Default instance of the request ID middleware with standard configuration
 * Used for request tracking across logs and responses
 */
export const requestId = createRequestIdMiddleware();

/**
 * Default export for backward compatibility
 * @example
 * // Basic usage
 * app.use(requestId);
 * 
 * // With custom options
 * app.use(createRequestIdMiddleware({
 *   correlationHeader: 'x-my-correlation-id',
 *   trustNonUuidIds: true
 * }));
 */
export default requestId;
