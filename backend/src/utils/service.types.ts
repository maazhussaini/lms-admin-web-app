/**
 * @file Service Types
 * @description Shared interfaces and types for service layer patterns
 */

import { TokenPayload } from '@/utils/jwt.utils';
import { ExtendedPaginationWithFilters, SafeFilterParams } from '@/utils/async-handler.utils';
import { SortOrder } from '@/utils/pagination.utils';

/**
 * Base interface for all filter DTOs
 */
export interface BaseFilterDto {
  search?: string;
}

/**
 * Base interface for services that support tenant isolation
 */
export interface TenantIsolationService {
  /**
   * Check if user can access data across tenants
   */
  canAccessAllTenants(requestingUser: TokenPayload): boolean;
  
  /**
   * Get tenant constraint for database queries
   */
  getTenantConstraint(requestingUser: TokenPayload): Record<string, any>;
}

/**
 * Base interface for services that support pagination and filtering
 */
export interface PaginatedListService<TItem, TFilterDto extends BaseFilterDto> {
  /**
   * Convert filter parameters to structured DTO
   */
  convertFiltersToDto(filterParams: SafeFilterParams): TFilterDto;
  
  /**
   * Build Prisma filters from structured DTO
   */
  buildFiltersFromDto(filterDto: TFilterDto, requestingUser: TokenPayload): Record<string, any>;
  
  /**
   * Build Prisma sorting from pagination parameters
   */
  buildSorting(params: ExtendedPaginationWithFilters): Record<string, SortOrder>;
  
  /**
   * Get all items with pagination and filtering
   */
  getAllItems(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ): Promise<{ items: TItem[]; total: number }>;
}

/**
 * Configuration for field mapping between API and database
 */
export interface FieldMappingConfig {
  [apiFieldName: string]: string; // Database column name
}

/**
 * Configuration for filter conversion
 */
export interface FilterConversionConfig {
  stringFields?: string[];
  numberFields?: string[];
  enumFields?: { [fieldName: string]: Record<string, any> };
  booleanFields?: string[];
}

/**
 * Base service configuration
 */
export interface BaseServiceConfig<TFilterDto extends BaseFilterDto> {
  entityName: string;
  primaryKeyField: string;
  fieldMapping: FieldMappingConfig;
  filterConversion: FilterConversionConfig;
  defaultSortField: string;
  defaultSortOrder: SortOrder;
}

/**
 * Result type for paginated queries
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Context for error logging in services
 */
export interface ServiceContext {
  requestingUser: {
    id: number;
    role: string;
    tenantId?: number | null;
  };
  params?: {
    page?: number;
    limit?: number;
    filters?: string[];
  };
  entityId?: number | string;
}

/**
 * Base service interface with common CRUD operations
 */
export interface BaseEntityService<TEntity, TCreateDto, TUpdateDto, TFilterDto extends BaseFilterDto> 
  extends TenantIsolationService, PaginatedListService<TEntity, TFilterDto> {
  
  /**
   * Create a new entity
   */
  createEntity(data: TCreateDto, requestingUser: TokenPayload): Promise<TEntity>;
  
  /**
   * Get entity by ID
   */
  getEntityById(id: number, requestingUser: TokenPayload): Promise<TEntity>;
  
  /**
   * Update entity by ID
   */
  updateEntity(id: number, data: TUpdateDto, requestingUser: TokenPayload): Promise<TEntity>;
  
  /**
   * Soft delete entity by ID
   */
  deleteEntity(id: number, requestingUser: TokenPayload): Promise<void>;
}

/**
 * Options for tenant isolation in database queries
 */
export interface TenantIsolationOptions {
  /**
   * Field name for tenant ID in the database
   */
  tenantField?: string;
  
  /**
   * Whether to apply tenant isolation for super admins
   */
  applyToSuperAdmin?: boolean;
  
  /**
   * Custom tenant ID to use (for super admin operations)
   */
  forceTenantId?: number | null;
}

/**
 * Helper type for ensuring type safety in filter DTOs
 */
export type FilterDtoKeys<T extends BaseFilterDto> = keyof T;

/**
 * Helper type for service method context logging
 */
export type LogContext = {
  [key: string]: any;
  requestingUser: { id: number; role: string; tenantId?: number | null };
};
