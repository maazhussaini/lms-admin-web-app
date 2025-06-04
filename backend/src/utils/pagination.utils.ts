/**
 * @file utils/pagination.utils.ts
 * @description Utilities for handling pagination in API requests and responses.
 */

/**
 * Parse pagination parameters from request query
 * @param query Express request query object
 * @param defaultPage Default page number (1-based)
 * @param defaultLimit Default page size
 * @param maxLimit Maximum allowed page size
 * @returns Parsed pagination parameters
 */
export const parsePaginationParams = (
  query: any,
  defaultPage = 1,
  defaultLimit = 10,
  maxLimit = 100
): { page: number; limit: number; skip: number } => {
  // Parse page and limit from query
  let page = parseInt(query.page as string, 10) || defaultPage;
  let limit = parseInt(query.limit as string, 10) || defaultLimit;
  
  // Validate and normalize
  page = page < 1 ? 1 : page;
  limit = limit < 1 ? defaultLimit : limit;
  limit = limit > maxLimit ? maxLimit : limit;
  
  // Calculate skip for database query
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Parse sorting parameters from request query
 * @param query Express request query object
 * @param defaultSortBy Default field to sort by
 * @param defaultOrder Default sort order ('asc' or 'desc')
 * @param allowedFields Array of fields allowed for sorting
 * @returns Prisma-compatible OrderBy object
 */
export const parseSortParams = (
  query: any,
  defaultSortBy = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc',
  allowedFields: string[] = []
): Record<string, 'asc' | 'desc'> => {
  let sortBy = (query.sortBy as string) || defaultSortBy;
  const orderInput = (query.order as string)?.toLowerCase() || defaultOrder;
  let order: 'asc' | 'desc' = orderInput === 'asc' ? 'asc' : 'desc';
  
  // Extract field and direction if in format "field:direction"
  if (sortBy.includes(':')) {
    const [field, direction] = sortBy.split(':');
    sortBy = field;
    const d = direction?.toLowerCase() || defaultOrder;
    order = d === 'asc' ? 'asc' : 'desc';
  }
  
  // Validate field is allowed
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    sortBy = defaultSortBy;
  }
  
  // Return Prisma-compatible OrderBy object
  return { [sortBy]: order };
};

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
) => {
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
