/**
 * @file utils/async-handler.utils.ts
 * @description Advanced utilities for handling asynchronous operations in Express route handlers.
 * Provides wrappers for automatic error handling and standardized response formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './api-error.utils.js';
import { createSuccessResponse, createPaginatedResponse, createCreatedResponse } from './api-response.utils.js';
import { wrapError } from './error-wrapper.utils.js';
import { PaginationParams, SortOrder } from './pagination.utils.js';
import { TApiSuccessResponse, TListResponse } from '@shared/types';

/**
 * Type definition for an async Express route handler
 */
export type AsyncRouteHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

/**
 * Options for configuring the async handler
 */
export interface AsyncHandlerOptions {
  /** Whether to wrap non-ApiError exceptions */
  wrapErrors?: boolean;
  /** Whether to log errors (defaults to true) */
  logErrors?: boolean;
}

/**
 * Wraps an async Express route handler to automatically catch errors
 * and pass them to Express error middleware
 * 
 * @param fn Async Express route handler function
 * @param options Configuration options
 * @returns Wrapped function that forwards errors to next()
 */
export const asyncHandler = <T = any>(
  fn: AsyncRouteHandler<T>,
  options: AsyncHandlerOptions = {}
): (req: Request, res: Response, next: NextFunction) => void => {
  const { wrapErrors = true, logErrors = true } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use Promise.resolve to handle both synchronous and asynchronous functions
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        // Don't process errors if headers already sent
        if (res.headersSent) {
          return next(error);
        }
        
        if (wrapErrors && !(error instanceof ApiError)) {
          error = wrapError(error, { 
            context: { 
              path: req.path, 
              method: req.method, 
              userId: req.user?.id, 
              tenantId: req.user?.tenantId,
              requestId: req.id // Include request/correlation ID if available
            },
            logError: logErrors
          });
        }
        next(error);
      });
  };
};

/**
 * Options for routes that send success responses
 */
export interface RouteHandlerOptions extends AsyncHandlerOptions {
  /** Default success status code */
  statusCode?: number;
  /** Default success message */
  message?: string;
}

/**
 * Creates a route handler that automatically formats successful responses
 * using the standard API response format
 * 
 * @param fn Handler function that returns data to include in the response
 * @param options Configuration options
 * @returns Express route handler
 */
/**
 * Creates a route handler that automatically formats successful responses
 * using the standard API response format
 * 
 * @param fn Handler function that returns data to include in the response
 * @param options Configuration options
 * @returns Express route handler
 */
export const createRouteHandler = <T = any>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): (req: Request, res: Response, next: NextFunction) => void => {
  const { 
    statusCode = 200, 
    message = 'Success',
    wrapErrors = true,
    logErrors = true
  } = options;
  
  return asyncHandler(
    async (req, res, next) => {
      // Allow returning null/undefined to indicate "no content"
      const data = await fn(req, res, next);
      
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      // Handle null/undefined as 204 No Content
      if (data === null || data === undefined) {
        // Format the response using our standard format but with 204 status
        const response: TApiSuccessResponse<null> = createSuccessResponse(
          null,
          message,
          204,
          undefined, // pagination
          req.id // correlation ID
        );
        
        return res.status(204).json(response);
      }
      
      // Format the response using our standard format
      const response: TApiSuccessResponse<T> = createSuccessResponse(
        data,
        message,
        statusCode,
        undefined, // pagination
        req.id // correlation ID
      );
      
      res.status(statusCode).json(response);
    },
    { wrapErrors, logErrors }
  );
};

/**
 * Extended pagination parameters interface for async handlers
 * Extends the base PaginationParams with additional sorting and filtering options
 */
export interface ExtendedPaginationParams extends PaginationParams {
  sortBy?: string;
  sortOrder?: SortOrder;
  [key: string]: any; // Additional filter parameters
}

/**
 * Type for a function that returns a list of items with total count
 */
export type ListFunction<T> = (
  params: ExtendedPaginationParams,
  req: Request
) => Promise<{ items: T[]; total: number }>;

/**
 * Creates a paginated list endpoint handler with standardized response format
 * 
 * @param listFn Function that returns paginated data and total count
 * @param options Configuration options
 * @returns Express route handler
 */
export const createListHandler = <T = any>(
  listFn: ListFunction<T>,
  options: RouteHandlerOptions = {}
): (req: Request, res: Response, next: NextFunction) => void => {
  const { 
    message = 'Items retrieved successfully',
    wrapErrors = true,
    logErrors = true
  } = options;
  
  return asyncHandler(
    async (req, res, next) => {
      // Extract pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Ensure positive values
      const normalizedPage = Math.max(1, page);
      const normalizedLimit = Math.max(1, Math.min(100, limit)); // Cap at 100 items per page
      
      // Get sort parameters
      const sortBy = req.query.sortBy as string;
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
        // Collect all query params for filtering
      const params: ExtendedPaginationParams = {
        page: normalizedPage,
        limit: normalizedLimit,
        skip: (normalizedPage - 1) * normalizedLimit,
        sortBy,
        sortOrder,
        ...req.query
      };
      
      // Call the list function with parameters
      const { items, total } = await listFn(params, req);
      
      // Create a paginated response
      const response = createPaginatedResponse(
        items,
        normalizedPage,
        normalizedLimit,
        total,
        message,
        200,
        req.id // correlation ID
      );
      
      res.status(200).json(response);
    },
    { wrapErrors, logErrors }
  );
};

/**
 * Creates a resource creation endpoint handler with standardized 201 Created response
 * 
 * @param createFn Function that creates a resource and returns it
 * @param options Configuration options
 * @returns Express route handler
 */
export const createResourceHandler = <T = any>(
  createFn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): (req: Request, res: Response, next: NextFunction) => void => {
  const { 
    message = 'Resource created successfully',
    wrapErrors = true,
    logErrors = true
  } = options;
  
  return asyncHandler(
    async (req, res, next) => {
      const data = await createFn(req, res, next);
      
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      // Format the response using our created response format (201)
      const response = createCreatedResponse(
        data,
        message,
        req.id // correlation ID
      );
      
      res.status(201).json(response);
    },
    { wrapErrors, logErrors }
  );
};

export default asyncHandler;
