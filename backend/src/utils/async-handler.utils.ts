/**
 * @file utils/async-handler.utils.ts
 * @description Advanced utilities for handling asynchronous operations in Express route handlers.
 * Provides wrappers for automatic error handling and standardized response formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './api-error.utils.js';
import { 
  createSuccessResponse, 
  createPaginatedResponse, 
  createCreatedResponse,
  createDeletedResponse,
  HTTP_STATUS_CODES, 
  HttpStatusCode
} from './api-response.utils.js';
import { wrapError } from './error-wrapper.utils.js';
import { 
  PaginationParams, 
  SortOrder, 
  getPaginationFromRequest, 
  getSortParamsFromRequest,
  createPaginatedApiResponse 
} from './pagination.utils.js';
import { TApiSuccessResponse } from '@shared/types/api.types.js';
import { TokenPayload } from './jwt.utils.js';

/**
 * Extended Request interface with user and correlation ID
 * Note: id is required in Express.Request, so we keep it as required here
 */
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  id: string; // Correlation ID - required as per Express.Request interface
}

/**
 * Type definition for an async Express route handler with proper typing
 */
export type AsyncRouteHandler<T = unknown> = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<T>;

/**
 * Options for configuring the async handler with strict typing
 */
export interface AsyncHandlerOptions {
  /** Whether to wrap non-ApiError exceptions using wrapError utility (default: true) */
  readonly wrapErrors?: boolean;
  /** Whether to log errors before passing to middleware (default: true) */
  readonly logErrors?: boolean;
}

/**
 * Type guard to check if request has user property
 * Enhanced with null checking for better safety
 */
const hasUser = (req: Request): req is Request & { user: TokenPayload } => {
  return 'user' in req && req.user !== undefined && req.user !== null;
};

/**
 * Type guard to check if request has correlation ID
 * Enhanced with proper string validation
 */
const hasCorrelationId = (req: Request): req is Request & { id: string } => {
  return 'id' in req && typeof req.id === 'string' && req.id.length > 0;
};

/**
 * Safely extract correlation ID from request
 */
const getCorrelationId = (req: Request): string | undefined => {
  return hasCorrelationId(req) ? req.id : undefined;
};

/**
 * Safely extract user context for logging
 */
const getUserContext = (req: Request): { userId?: number; tenantId?: number } => {
  if (!hasUser(req)) {
    return {};
  }
  
  return {
    userId: req.user.id,
    tenantId: req.user.tenantId
  };
};

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
    Promise.resolve(fn(req as AuthenticatedRequest, res, next))
      .catch((error: unknown) => {
        // Don't process errors if headers already sent
        if (res.headersSent) {
          return next(error);
        }
        
        if (wrapErrors && !(error instanceof ApiError)) {
          const userContext = getUserContext(req);
          const correlationId = getCorrelationId(req);
          
          error = wrapError(error, { 
            context: { 
              path: req.path, 
              method: req.method,
              ...userContext,
              ...(correlationId && { requestId: correlationId })
            },
            logError: logErrors
          });
        }
        next(error);
      });
  };
};

/**
 * Options for routes that send success responses with strict typing
 */
export interface RouteHandlerOptions extends AsyncHandlerOptions {
  /** Default success status code (default: 200) */
  readonly statusCode?: HttpStatusCode;
  /** Default success message (varies by handler type) */
  readonly message?: string;
  /** Use simplified pagination response format (items as data) instead of TListResponse format (default: false) */
  readonly useSimplePagination?: boolean;
}

/**
 * Creates a route handler that automatically formats successful responses
 * using the standard API response format
 * 
 * @param fn Handler function that returns data to include in the response
 * @param options Configuration options
 * @returns Express route handler
 */
export const createRouteHandler = <T = unknown>(
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { 
    statusCode = HTTP_STATUS_CODES.OK, 
    message = 'Success',
    wrapErrors = true,
    logErrors = true
  } = options;
  
  return asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
      // Allow returning null/undefined to indicate "no content"
      const data = await fn(req, res, _next);
      
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      const correlationId = getCorrelationId(req);
      
      // Handle null/undefined as 204 No Content using the proper utility
      if (data === null || data === undefined) {
        const response = createDeletedResponse(message, correlationId);
        res.status(HTTP_STATUS_CODES.NO_CONTENT).json(response);
        return;
      }
      
      // Determine which response utility to use based on status code
      let response: TApiSuccessResponse<T>;
      
      if (statusCode === HTTP_STATUS_CODES.CREATED) {
        response = createCreatedResponse(data, message, correlationId);
      } else {
        response = createSuccessResponse(data, message, statusCode, correlationId);
      }
      
      res.status(statusCode).json(response);
    },
    { wrapErrors, logErrors }
  );
};

/**
 * Extended pagination parameters interface for async handlers with strict typing
 * Extends the base PaginationParams with additional sorting and filtering options
 */
export interface ExtendedPaginationParams extends PaginationParams {
  /** Sort field name from query string */
  readonly sortBy?: string | undefined;
  /** Sort order from query string */
  readonly sortOrder?: SortOrder;
  /** Parsed sorting object for Prisma queries */
  readonly sorting?: Readonly<Record<string, SortOrder>>;
}

/**
 * Safe filter parameters with proper typing
 */
export interface SafeFilterParams {
  readonly [key: string]: string | number | boolean | readonly (string | number | boolean)[];
}

/**
 * Combined parameters interface for type safety
 */
export interface ExtendedPaginationWithFilters extends ExtendedPaginationParams {
  readonly filters: SafeFilterParams;
}

/**
 * Type for a function that returns a list of items with total count
 * Enhanced with proper typing for safety
 */
export type ListFunction<T> = (
  params: ExtendedPaginationWithFilters,
  req: AuthenticatedRequest
) => Promise<{ readonly items: readonly T[]; readonly total: number }>;

/**
 * Safely extract filter parameters from query
 */
const extractSafeFilters = (query: Request['query']): SafeFilterParams => {
  const filters: Record<string, string | number | boolean | readonly (string | number | boolean)[]> = {};
  const excludeKeys = ['page', 'limit', 'sortBy', 'order', 'sortOrder'];
  
  Object.entries(query).forEach(([key, value]) => {
    if (excludeKeys.includes(key) || value === undefined || value === null || value === '') {
      return;
    }
    
    if (typeof value === 'string') {
      // Try to parse as number or boolean
      if (/^\d+$/.test(value)) {
        filters[key] = parseInt(value, 10);
      } else if (value === 'true') {
        filters[key] = true;
      } else if (value === 'false') {
        filters[key] = false;
      } else {
        filters[key] = value;
      }
    } else if (Array.isArray(value)) {
      // Handle array values safely
      filters[key] = value.filter(v => typeof v === 'string').map(v => {
        if (/^\d+$/.test(v)) return parseInt(v, 10);
        if (v === 'true') return true;
        if (v === 'false') return false;
        return v;
      });
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      filters[key] = value;
    }
  });
  
  return filters;
};

/**
 * Creates a paginated list endpoint handler with standardized response format
 * 
 * @param listFn Function that returns paginated data and total count
 * @param options Configuration options
 * @returns Express route handler
 */
export const createListHandler = <T>(
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
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
      // Extract pagination parameters using utility function
      const pagination = getPaginationFromRequest(req, 1, 10, 100);
      
      // Get sort parameters using utility function - default to 'createdAt' desc
      const sorting = getSortParamsFromRequest(req, 'createdAt', 'desc');
      
      // Safely extract query parameters with proper type checking
      const sortBy = typeof req.query['sortBy'] === 'string' ? req.query['sortBy'] : undefined;
      const sortOrderQuery = req.query['sortOrder'];
      const sortOrder: SortOrder = (typeof sortOrderQuery === 'string' && 
        (sortOrderQuery === 'asc' || sortOrderQuery === 'desc')) ? sortOrderQuery : 'desc';
      
      // Extract safe filters
      const filters = extractSafeFilters(req.query);
      
      // Collect all parameters with proper typing
      const params: ExtendedPaginationWithFilters = {
        ...pagination,
        sortBy,
        sortOrder,
        sorting,
        filters
      } as const;
      
      // Call the list function with parameters
      const { items, total } = await listFn(params, req);
      
      const correlationId = getCorrelationId(req);
      
      // Create response using the appropriate utility from api-response.utils.ts
      const response = useSimplePagination
        ? createPaginatedApiResponse(
            [...items], // Convert readonly array to mutable for response
            pagination.page,
            pagination.limit,
            total,
            message,
            HTTP_STATUS_CODES.OK
          )
        : createPaginatedResponse(
            [...items], // Convert readonly array to mutable for response
            pagination.page,
            pagination.limit,
            total,
            message,
            HTTP_STATUS_CODES.OK,
            correlationId
          );
      
      // Add correlation ID to simple pagination response if needed and not already present
      if (useSimplePagination && correlationId && !('correlationId' in response)) {
        (response as any).correlationId = correlationId;
      }
      
      res.status(HTTP_STATUS_CODES.OK).json(response);
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
export const createResourceHandler = <T>(
  createFn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { 
    message = 'Resource created successfully',
    wrapErrors = true,
    logErrors = true
  } = options;
  
  return asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
      const data = await createFn(req, res, _next);
      
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      const correlationId = getCorrelationId(req);
      
      // Use the proper created response utility
      const response = createCreatedResponse(data, message, correlationId);
      
      res.status(HTTP_STATUS_CODES.CREATED).json(response);
    },
    { wrapErrors, logErrors }
  );
};

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
  statusCode: HttpStatusCode = HTTP_STATUS_CODES.OK,
  options: AsyncHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      const correlationId = getCorrelationId(req);
      
      // Use the proper success response utility
      const response = createSuccessResponse(
        null, 
        message, 
        statusCode, 
        correlationId
      );
      
      res.status(statusCode).json(response);
    },
    options
  );
};

/**
 * Creates a handler for delete operations that returns a confirmation message
 * 
 * @param deleteFn Function that performs the deletion
 * @param options Configuration options
 * @returns Express route handler
 */
export const createDeleteHandler = (
  deleteFn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { message = 'Resource deleted successfully', wrapErrors, logErrors } = options;
  
  return asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      await deleteFn(req, res, next);
      
      // If response is already sent, don't do anything
      if (res.headersSent) {
        return;
      }
      
      const correlationId = getCorrelationId(req);
      
      // Use the proper deleted response utility
      const response = createDeletedResponse(message, correlationId);
      
      res.status(HTTP_STATUS_CODES.NO_CONTENT).json(response);
    },
    { 
      wrapErrors: wrapErrors ?? true, 
      logErrors: logErrors ?? true 
    }
  );
};

/**
 * Creates a handler for update operations that returns the updated resource
 * 
 * @param updateFn Function that performs the update and returns the updated resource
 * @param options Configuration options
 * @returns Express route handler
 */
export const createUpdateHandler = <T>(
  updateFn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<T>,
  options: RouteHandlerOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { message = 'Resource updated successfully', ...restOptions } = options;
  
  return createRouteHandler(updateFn, { 
    ...restOptions, 
    message, 
    statusCode: HTTP_STATUS_CODES.OK 
  });
};

// Export type guards for use in other modules
export { hasUser, hasCorrelationId, getCorrelationId, getUserContext };
