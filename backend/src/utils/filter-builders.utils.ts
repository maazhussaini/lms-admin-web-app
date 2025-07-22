/**
 * @file Filter Builders Utilities
 * @description Common utilities for building database filters from DTOs
 */

import { TokenPayload } from '@/utils/jwt.utils';
import { SafeFilterParams } from '@/utils/async-handler.utils';
import { BaseFilterDto, FilterConversionConfig } from './service.types';
import { buildBaseFilters, TenantIsolationOptions } from './tenant-isolation.utils';

/**
 * Convert SafeFilterParams to a structured DTO based on configuration
 * 
 * @param filterParams Raw filter parameters from request
 * @param config Configuration for field conversion
 * @returns Structured DTO with typed fields
 */
export function convertFiltersToDto<T extends BaseFilterDto>(
  filterParams: SafeFilterParams,
  config: FilterConversionConfig
): T {
  const dto: any = {};
  
  // Handle string fields
  if (config.stringFields) {
    config.stringFields.forEach(field => {
      if (filterParams[field] && typeof filterParams[field] === 'string') {
        dto[field] = filterParams[field];
      }
    });
  }
  
  // Handle number fields
  if (config.numberFields) {
    config.numberFields.forEach(field => {
      if (filterParams[field]) {
        const value = typeof filterParams[field] === 'number' 
          ? filterParams[field] 
          : parseInt(filterParams[field] as string, 10);
        
        if (!isNaN(value)) {
          dto[field] = value;
        }
      }
    });
  }
  
  // Handle enum fields
  if (config.enumFields) {
    Object.entries(config.enumFields).forEach(([field, enumObject]) => {
      if (filterParams[field] && typeof filterParams[field] === 'string') {
        const enumValue = filterParams[field] as string;
        if (Object.values(enumObject).includes(enumValue)) {
          dto[field] = enumValue;
        }
      }
    });
  }
  
  // Handle boolean fields
  if (config.booleanFields) {
    config.booleanFields.forEach(field => {
      if (filterParams[field] !== undefined) {
        const value = filterParams[field];
        if (typeof value === 'boolean') {
          dto[field] = value;
        } else if (typeof value === 'string') {
          dto[field] = value.toLowerCase() === 'true';
        }
      }
    });
  }
  
  return dto as T;
}

/**
 * Build Prisma filters from structured DTO with tenant isolation
 * 
 * @param filterDto Structured filter DTO
 * @param requestingUser User making the request
 * @param filterBuilder Function to build entity-specific filters
 * @param tenantOptions Tenant isolation options
 * @returns Complete Prisma where clause
 */
export function buildFiltersFromDto<T extends BaseFilterDto>(
  filterDto: T,
  requestingUser: TokenPayload,
  filterBuilder: (dto: T, baseFilters: Record<string, any>) => Record<string, any>,
  tenantOptions: TenantIsolationOptions = {}
): Record<string, any> {
  // Start with base filters (tenant isolation + soft delete protection)
  const baseFilters = buildBaseFilters(requestingUser, tenantOptions);
  
  // Apply entity-specific filters
  const entityFilters = filterBuilder(filterDto, baseFilters);
  
  return entityFilters;
}

/**
 * Build search filters for common text search patterns
 * 
 * @param searchTerm Search term from DTO
 * @param searchFields Array of database fields to search in
 * @param options Search options
 * @returns Prisma OR clause for text search
 */
export function buildSearchFilters(
  searchTerm: string | undefined,
  searchFields: string[],
  options: {
    caseSensitive?: boolean;
    exactMatch?: boolean;
    includeRelations?: { [relation: string]: string[] };
  } = {}
): Record<string, any> | undefined {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return undefined;
  }
  
  const trimmedTerm = searchTerm.trim();
  const searchMode = options.caseSensitive ? 'default' : 'insensitive';
  const searchCondition = options.exactMatch ? trimmedTerm : { contains: trimmedTerm, mode: searchMode };
  
  const orConditions: Record<string, any>[] = [];
  
  // Add direct field searches
  searchFields.forEach(field => {
    orConditions.push({ [field]: searchCondition });
  });
  
  // Add relation searches if specified
  if (options.includeRelations) {
    Object.entries(options.includeRelations).forEach(([relation, relationFields]) => {
      relationFields.forEach(field => {
        orConditions.push({
          [relation]: {
            some: {
              [field]: searchCondition,
              is_deleted: false
            }
          }
        });
      });
    });
  }
  
  return orConditions.length > 0 ? { OR: orConditions } : undefined;
}

/**
 * Build range filters for numeric fields
 * 
 * @param minValue Minimum value
 * @param maxValue Maximum value
 * @param fieldName Database field name
 * @returns Prisma range filter
 */
export function buildRangeFilter(
  minValue: number | undefined,
  maxValue: number | undefined,
  fieldName: string
): Record<string, any> | undefined {
  if (minValue === undefined && maxValue === undefined) {
    return undefined;
  }
  
  const rangeFilter: Record<string, any> = {};
  
  if (minValue !== undefined) {
    rangeFilter['gte'] = minValue;
  }
  
  if (maxValue !== undefined) {
    rangeFilter['lte'] = maxValue;
  }
  
  return Object.keys(rangeFilter).length > 0 ? { [fieldName]: rangeFilter } : undefined;
}

/**
 * Build date range filters
 * 
 * @param startDate Start date
 * @param endDate End date
 * @param fieldName Database field name
 * @returns Prisma date range filter
 */
export function buildDateRangeFilter(
  startDate: Date | string | undefined,
  endDate: Date | string | undefined,
  fieldName: string
): Record<string, any> | undefined {
  if (!startDate && !endDate) {
    return undefined;
  }
  
  const dateFilter: Record<string, any> = {};
  
  if (startDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    dateFilter['gte'] = start;
  }
  
  if (endDate) {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    // Set to end of day if no time is specified
    if (typeof endDate === 'string' && !endDate.includes('T')) {
      end.setHours(23, 59, 59, 999);
    }
    dateFilter['lte'] = end;
  }
  
  return Object.keys(dateFilter).length > 0 ? { [fieldName]: dateFilter } : undefined;
}

/**
 * Build enum filters with validation
 * 
 * @param enumValue Enum value from DTO
 * @param enumObject Enum object for validation
 * @param fieldName Database field name
 * @returns Prisma enum filter
 */
export function buildEnumFilter(
  enumValue: string | undefined,
  enumObject: Record<string, any>,
  fieldName: string
): Record<string, any> | undefined {
  if (!enumValue) {
    return undefined;
  }
  
  // Validate enum value
  if (!Object.values(enumObject).includes(enumValue)) {
    return undefined;
  }
  
  return { [fieldName]: enumValue };
}

/**
 * Build boolean filters
 * 
 * @param boolValue Boolean value from DTO
 * @param fieldName Database field name
 * @returns Prisma boolean filter
 */
export function buildBooleanFilter(
  boolValue: boolean | undefined,
  fieldName: string
): Record<string, any> | undefined {
  if (boolValue === undefined) {
    return undefined;
  }
  
  return { [fieldName]: boolValue };
}

/**
 * Merge multiple filter conditions into a single where clause
 * 
 * @param baseFilters Base filters (tenant isolation, soft delete, etc.)
 * @param additionalFilters Additional filter conditions
 * @returns Merged Prisma where clause
 */
export function mergeFilters(
  baseFilters: Record<string, any>,
  ...additionalFilters: (Record<string, any> | undefined)[]
): Record<string, any> {
  const mergedFilters = { ...baseFilters };
  
  additionalFilters.forEach(filter => {
    if (filter) {
      Object.assign(mergedFilters, filter);
    }
  });
  
  return mergedFilters;
}
