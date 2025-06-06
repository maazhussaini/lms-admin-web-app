/**
 * @file utils/async-handler.utils.ts
 * @description Advanced utilities for handling asynchronous operations in Express route handlers.
 * Provides wrappers for automatic error handling and standardized response formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './api-error.utils.js';
import { createSuccessResponse, createPaginatedResponse, createCreatedResponse, HTTP_STATUS_CODES } from './api-response.utils.js';
import { wrapError } from './error-wrapper.utils.js';
import { 
  PaginationParams, 
  SortOrder, 
  getPaginationFromRequest, 
  getSortParamsFromRequest,
  createPaginatedApiResponse 
} from './pagination.utils.js';
import { TApiSuccessResponse } from '@shared/types';

/**
 * Type definition for an async Express route handler
 */
export type AsyncRouteHandler<T = unknown> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

/**
 * Options for configuring the async handler
 */
export interface AsyncHandlerOptions {
  /** Whether to wrap non-ApiError exceptions using wrapError utility (default: true) */
  wrapErrors?: boolean;
  /** Whether to log errors before passing to middleware (default: true) */
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
export const asyncHandler = <T = unknown>(
  fn: AsyncRouteHandler<T>,
  options: AsyncHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { wrapErrors = true, logErrors = true } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use Promise.resolve to handle both synchronous and asynchronous functions
    Promise.resolve(fn(req, res, next))
      .catch((error: unknown) => {
        // Don't process errors if headers already sent
        if (res.headersSent) {
          return next(error);
        }
        
        if (wrapErrors && !(error instanceof ApiError)) {
          error = wrapError(error, { 
            context: { 
              path: req.path, 
              method: req.method, 
              userId: (req as any).user?.id, 
              tenantId: (req as any).user?.tenantId,
              requestId: (req as any).id // Include request/correlation ID if available
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
  /** Default success status code (default: 200) */
  statusCode?: number;
  /** Default success message (varies by handler type) */
  message?: string;
  /** Use simplified pagination response format (items as data) instead of TListResponse format (default: false) */
  useSimplePagination?: boolean;
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
export const createRouteHandler = <T = unknown>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { 
    statusCode = 200, 
    message = 'Success',
    wrapErrors = true,
    logErrors = true
  } = options;
  
  return asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      // Allow returning null/undefined to indicate "no content"
      const data = await fn(req, res, _next);
      
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      // Handle null/undefined as 204 No Content
      if (data === null || data === undefined) {        // Format the response using our standard format but with 204 status
        const response: TApiSuccessResponse<null> = createSuccessResponse(
          null,
          message,
          HTTP_STATUS_CODES.NO_CONTENT,
          undefined, // pagination
          (req as any).id // correlation ID
        );
        
        res.status(204).json(response);
        return;
      }
      
      // Format the response using our standard format
      const response: TApiSuccessResponse<T> = createSuccessResponse(
        data,
        message,
        HTTP_STATUS_CODES.OK,
        undefined, // pagination
        (req as any).id // correlation ID
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
  /** Sort field name from query string */
  sortBy?: string | undefined;
  /** Sort order from query string */
  sortOrder?: SortOrder | undefined;
  /** Parsed sorting object for Prisma queries */
  sorting?: Record<string, SortOrder> | undefined;
  /** Additional filter parameters from query string */
  [key: string]: any;
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
    useSimplePagination = false,
    wrapErrors = true,
    logErrors = true
  } = options;
    return asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      // Extract pagination parameters using utility function
      const pagination = getPaginationFromRequest(req, 1, 10, 100);
      
      // Get sort parameters using utility function - default to 'createdAt' desc
      const sorting = getSortParamsFromRequest(req, 'createdAt', 'desc');
      
      // Safely extract query parameters with proper type checking
      const sortBy = typeof req.query['sortBy'] === 'string' ? req.query['sortBy'] : undefined;
      const sortOrder = (typeof req.query['sortOrder'] === 'string' ? req.query['sortOrder'] as SortOrder : undefined) || 'desc';
      
      // Collect all query params for filtering and build extended params
      const params: ExtendedPaginationParams = {
        ...pagination,
        sortBy,
        sortOrder,
        sorting,
        ...req.query
      };
      
      // Call the list function with parameters
      const { items, total } = await listFn(params, req);
      
      // Create response using either format based on options
      const response = useSimplePagination
        ? createPaginatedApiResponse(
            items,
            pagination.page,
            pagination.limit,
            total,
            message,
            HTTP_STATUS_CODES.OK
          )
        : createPaginatedResponse(
            items,
            pagination.page,
            pagination.limit,
            total,
            message,
            HTTP_STATUS_CODES.OK,
            (req as any).id // correlation ID
          );
      
      // Add correlation ID to simple pagination response if needed
      if (useSimplePagination && (req as any).id) {
        (response as any).correlationId = (req as any).id;
      }
      
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
export const createResourceHandler = <T = unknown>(
  createFn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { 
    message = 'Resource created successfully',
    wrapErrors = true,
    logErrors = true
  } = options;
  
  return asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const data = await createFn(req, res, _next);
      
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      // Format the response using our created response format (201)
      const response = createCreatedResponse(
        data,
        message,
        (req as any).id // correlation ID
      );
      
      res.status(201).json(response);
    },
    { wrapErrors, logErrors }
  );
};

export default asyncHandler;

/**
 * Creates a simple success handler that returns a message without data
 * Useful for operations like delete, update where only confirmation is needed
 * 
 * @param message Success message to return
 * @param statusCode HTTP status code (default: 200)
 * @param options Configuration options
 * @returns Express route handler
 */
export const createMessageHandler = (
  message: string,
  statusCode = 200,
  options: AsyncHandlerOptions = {}
) => {
  return createRouteHandler(
    async () => null,
    { ...options, statusCode, message }
  );
};

/**
 * Creates a handler for update operations that returns the updated resource
 * 
 * @param updateFn Function that performs the update and returns the updated resource
 * @param options Configuration options
 * @returns Express route handler
 */
export const createUpdateHandler = <T = unknown>(
  updateFn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { message = 'Resource updated successfully', ...restOptions } = options;
  
  return createRouteHandler(updateFn, { 
    ...restOptions, 
    message, 
    statusCode: 200 
  });
};

/**
 * Creates a handler for delete operations that returns a confirmation message
 * 
 * @param deleteFn Function that performs the deletion
 * @param options Configuration options
 * @returns Express route handler
 */
export const createDeleteHandler = (
  deleteFn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { message = 'Resource deleted successfully', ...restOptions } = options;
  
  return createRouteHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<null> => {
      await deleteFn(req, res, next);
      return null; // This will result in 204 No Content
    },
    { ...restOptions, message }
  );
};
