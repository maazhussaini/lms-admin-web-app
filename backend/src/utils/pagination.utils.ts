/**
 * @file utils/pagination.utils.ts
 * @description Utilities for handling pagination in API requests and responses.
 * Provides standardized functions for parsing and formatting pagination parameters
 * that integrate with Prisma ORM and follow REST API best practices.
 */

import { Request } from 'express';
import { TListResponse } from '@shared/types';

/**
 * Pagination parameters interface for consistent typing
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parse pagination parameters from request query
 * @param query Express request query object or any object with page/limit properties
 * @param defaultPage Default page number (1-based)
 * @param defaultLimit Default page size
 * @param maxLimit Maximum allowed page size
 * @returns Parsed pagination parameters with calculated skip value for Prisma
 */
export const parsePaginationParams = (
  query: Record<string, any>,
  defaultPage = 1,
  defaultLimit = 10,
  maxLimit = 100
): PaginationParams => {
  // Parse page and limit from query
  let page = Number.isInteger(query.page) ? query.page : parseInt(query.page as string, 10) || defaultPage;
  let limit = Number.isInteger(query.limit) ? query.limit : parseInt(query.limit as string, 10) || defaultLimit;
  
  // Validate and normalize
  page = page < 1 ? 1 : page;
  limit = limit < 1 ? defaultLimit : limit;
  limit = limit > maxLimit ? maxLimit : limit;
  
  // Calculate skip for database query
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Parse pagination parameters directly from Express Request
 * @param req Express Request object
 * @param defaultPage Default page number (1-based)
 * @param defaultLimit Default page size
 * @param maxLimit Maximum allowed page size
 * @returns Parsed pagination parameters
 */
export const getPaginationFromRequest = (
  req: Request,
  defaultPage = 1,
  defaultLimit = 10,
  maxLimit = 100
): PaginationParams => {
  return parsePaginationParams(req.query, defaultPage, defaultLimit, maxLimit);
};

/**
 * Sort order type for type safety
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort parameter interface for consistent typing
 */
export interface SortParams {
  sortBy: string;
  order: SortOrder;
}

/**
 * Parse sorting parameters from request query
 * @param query Express request query object
 * @param defaultSortBy Default field to sort by
 * @param defaultOrder Default sort order ('asc' or 'desc')
 * @param allowedFields Array of fields allowed for sorting
 * @returns Prisma-compatible OrderBy object
 */
export const parseSortParams = (
  query: Record<string, any>,
  defaultSortBy = 'createdAt',
  defaultOrder: SortOrder = 'desc',
  allowedFields: string[] = []
): Record<string, SortOrder> => {
  let sortBy = typeof query.sortBy === 'string' ? query.sortBy : defaultSortBy;
  let orderInput = typeof query.order === 'string' ? query.order.toLowerCase() : defaultOrder;
  let order: SortOrder = orderInput === 'asc' ? 'asc' : 'desc';
  
  // Extract field and direction if in format "field:direction"
  if (sortBy.includes(':')) {
    const parts = sortBy.split(':');
    if (parts.length === 2) {
      sortBy = parts[0];
      const direction = parts[1]?.toLowerCase();
      order = direction === 'asc' ? 'asc' : 'desc';
    }
  }
  
  // Validate field is allowed
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    sortBy = defaultSortBy;
  }
  
  // Return Prisma-compatible OrderBy object
  return { [sortBy]: order };
};

/**
 * Parse sorting parameters directly from Express Request
 * @param req Express Request object
 * @param defaultSortBy Default field to sort by
 * @param defaultOrder Default sort order ('asc' or 'desc')
 * @param allowedFields Array of fields allowed for sorting
 * @returns Prisma-compatible OrderBy object
 */
export const getSortParamsFromRequest = (
  req: Request,
  defaultSortBy = 'createdAt',
  defaultOrder: SortOrder = 'desc',
  allowedFields: string[] = []
): Record<string, SortOrder> => {
  return parseSortParams(req.query, defaultSortBy, defaultOrder, allowedFields);
};

/**
 * Pagination metadata interface aligned with TApiSuccessResponse
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Create pagination metadata for response
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @returns Pagination metadata object
 */
export const createPaginationMetadata = (
  page: number,
  limit: number,
  total: number
): PaginationMetadata => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Create a paginated list response following the project's standard response format
 * @param items Array of items for the current page
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items across all pages
 * @returns List response with pagination metadata
 */
export const createPaginatedList = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): TListResponse<T> => {
  return {
    items,
    pagination: createPaginationMetadata(page, limit, total)
  };
};

/**
 * Create a standardized API success response with pagination metadata
 * Integrates with the project's TApiSuccessResponse type
 * 
 * @param items Array of items for the current page
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items across all pages
 * @param message Success message
 * @param statusCode HTTP status code
 * @returns Formatted API success response with pagination
 */
export const createPaginatedApiResponse = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message = 'Items retrieved successfully',
  statusCode = 200
) => {
  return {
    success: true,
    statusCode,
    message,
    data: items,
    pagination: createPaginationMetadata(page, limit, total),
    timestamp: new Date().toISOString()
  };
};

/**
 * Create empty pagination metadata for cases when no results are found
 * @param defaultPage Optional default page to show
 * @returns Empty pagination metadata
 */
export const createEmptyPaginationMetadata = (defaultPage = 1): PaginationMetadata => {
  return {
    page: defaultPage,
    limit: 0,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  };
};

/**
 * Helper to extract cursor-based pagination from query params
 * Useful for very large datasets where offset-based pagination is inefficient
 * 
 * @param query Request query object
 * @param defaultLimit Default number of items per page
 * @param maxLimit Maximum allowed items per page
 * @returns Cursor pagination parameters
 */
export const extractCursorPagination = (
  query: Record<string, any>,
  defaultLimit = 10,
  maxLimit = 100
) => {
  let limit = Number.isInteger(query.limit) ? query.limit : parseInt(query.limit as string, 10) || defaultLimit;
  limit = limit < 1 ? defaultLimit : limit;
  limit = limit > maxLimit ? maxLimit : limit;
  
  return {
    cursor: query.cursor ? { id: query.cursor } : undefined,
    take: limit,
    skip: query.cursor ? 1 : 0 // Skip the cursor item when using cursor pagination
  };
};

/**
 * Apply pagination to a Prisma query
 * Builds the take/skip parameters for Prisma queries based on page/limit
 * 
 * @param pagination Pagination parameters
 * @returns Prisma-compatible pagination object
 */
export const getPrismaPagination = (pagination: PaginationParams) => {
  return {
    take: pagination.limit,
    skip: pagination.skip
  };
};

/**
 * Combine pagination and sorting utilities for Prisma queries
 * @param pagination Pagination parameters
 * @param sorting Sorting parameters
 * @returns Combined Prisma query options
 */
export const getPrismaQueryOptions = <T extends Record<string, any>>(
  pagination: PaginationParams,
  sorting: Record<string, SortOrder>,
  extraOptions: T = {} as T
) => {
  return {
    ...getPrismaPagination(pagination),
    orderBy: sorting,
    ...extraOptions
  };
};

/**
 * Advanced filter builder for query parameters
 * Convert query string parameters to Prisma-compatible filters
 * 
 * @param query Request query object
 * @param filterMap Mapping of query parameters to database fields
 * @param excludeKeys Keys to exclude from filtering (e.g., pagination params)
 * @returns Prisma-compatible where clause
 */
export const buildPrismaFilters = (
  query: Record<string, any>,
  filterMap: Record<string, string> = {},
  excludeKeys: string[] = ['page', 'limit', 'sortBy', 'order']
): Record<string, any> => {
  const filters: Record<string, any> = {};
  const whereConditions: Array<Record<string, any>> = [];
  
  // Process each query parameter
  Object.entries(query).forEach(([key, value]) => {
    // Skip excluded keys and empty values
    if (excludeKeys.includes(key) || value === undefined || value === null || value === '') {
      return;
    }
    
    // Get the database field name (use the original key if not mapped)
    const fieldName = filterMap[key] || key;
    
    // Handle different types of filter operations
    if (typeof value === 'string') {
      if (value.startsWith('gt:')) {
        // Greater than
        whereConditions.push({ 
          [fieldName]: { gt: parseFilterValue(value.substring(3)) } 
        });
      } else if (value.startsWith('gte:')) {
        // Greater than or equal
        whereConditions.push({ 
          [fieldName]: { gte: parseFilterValue(value.substring(4)) } 
        });
      } else if (value.startsWith('lt:')) {
        // Less than
        whereConditions.push({ 
          [fieldName]: { lt: parseFilterValue(value.substring(3)) } 
        });
      } else if (value.startsWith('lte:')) {
        // Less than or equal
        whereConditions.push({ 
          [fieldName]: { lte: parseFilterValue(value.substring(4)) } 
        });
      } else if (value.startsWith('contains:')) {
        // Contains (string)
        whereConditions.push({ 
          [fieldName]: { contains: value.substring(9), mode: 'insensitive' } 
        });
      } else if (value.startsWith('in:')) {
        // In array of values
        const values = value.substring(3).split(',').map(v => parseFilterValue(v.trim()));
        whereConditions.push({ 
          [fieldName]: { in: values } 
        });
      } else if (value === 'null') {
        // Is null
        whereConditions.push({ 
          [fieldName]: null 
        });
      } else if (value === 'true') {
        // Boolean true
        whereConditions.push({ 
          [fieldName]: true 
        });
      } else if (value === 'false') {
        // Boolean false
        whereConditions.push({ 
          [fieldName]: false 
        });
      } else {
        // Exact match (or convert to appropriate type)
        whereConditions.push({ 
          [fieldName]: parseFilterValue(value) 
        });
      }
    } else if (Array.isArray(value)) {
      // Handle array values (e.g., multiple status values)
      whereConditions.push({ 
        [fieldName]: { in: value.map(v => parseFilterValue(v)) } 
      });
    } else {
      // Handle other types (numbers, booleans, etc.)
      whereConditions.push({ 
        [fieldName]: value 
      });
    }
  });
  
  // Combine all conditions with AND logic
  if (whereConditions.length > 0) {
    filters.AND = whereConditions;
  }
  
  return filters;
};

/**
 * Helper to parse filter values into appropriate types
 * @param value String value from query parameter
 * @returns Parsed value in appropriate type
 */
const parseFilterValue = (value: string): any => {
  // Try to parse as number
  if (/^-?\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  
  // Try to parse as float
  if (/^-?\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }
  
  // Try to parse as date
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Return as string
  return value;
};

/**
 * Example usage of pagination utilities in a controller:
 * 
 * ```typescript
 * // In a controller method:
 * const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
 *   try {
 *     // Get pagination and sorting parameters from request
 *     const pagination = getPaginationFromRequest(req);
 *     const sorting = getSortParamsFromRequest(req, 'createdAt', 'desc', 
 *       ['createdAt', 'courseName', 'enrollmentCount']);
 *     
 *     // Build filters from query parameters
 *     const filters = buildPrismaFilters(req.query, {
 *       // Map query param names to database field names
 *       'name': 'courseName',
 *       'status': 'courseStatus'
 *     });
 *     
 *     // Ensure tenant isolation (multi-tenancy)
 *     filters.tenantId = req.user.tenantId;
 *     
 *     // Get courses with count
 *     const [courses, total] = await Promise.all([
 *       prisma.course.findMany({
 *         where: filters,
 *         ...getPrismaQueryOptions(pagination, sorting, {
 *           // Additional Prisma options
 *           include: { 
 *             teacher: true,
 *             category: true
 *           }
 *         })
 *       }),
 *       prisma.course.count({ where: filters })
 *     ]);
 *     
 *     // Return paginated response
 *     return res.status(200).json(
 *       createPaginatedApiResponse(
 *         courses,
 *         pagination.page,
 *         pagination.limit,
 *         total,
 *         'Courses retrieved successfully'
 *       )
 *     );
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 * ```
 */
