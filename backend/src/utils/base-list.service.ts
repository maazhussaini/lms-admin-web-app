/**
 * @file Base List Service
 * @description Base class providing common list operation patterns for services
 */

import { PrismaClient } from '@prisma/client';
import { TokenPayload } from '@/utils/jwt.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { getPrismaQueryOptions } from '@/utils/pagination.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import {
  BaseFilterDto,
  FieldMappingConfig,
  FilterConversionConfig,
  PaginatedResult,
  ServiceContext
} from './service.types';
import {
  convertFiltersToDto,
  buildFiltersFromDto,
  buildSearchFilters,
  mergeFilters
} from './filter-builders.utils';
import {
  buildBaseFilters,
  canAccessAllTenants,
  getTenantConstraint,
  TenantIsolationOptions
} from './tenant-isolation.utils';
import { buildSorting, mapApiToDbField } from './field-mapping.utils';
import logger from '@/config/logger';

/**
 * Configuration for base list service
 */
export interface BaseListServiceConfig<TFilterDto extends BaseFilterDto> {
  entityName: string;
  primaryKeyField: string;
  fieldMapping: FieldMappingConfig;
  filterConversion: FilterConversionConfig;
  defaultSortField: string;
  defaultSortOrder: 'asc' | 'desc';
  tenantOptions?: TenantIsolationOptions;
  searchFields?: string[];
  searchRelations?: { [relation: string]: string[] };
}

/**
 * Base service class providing common list operation patterns
 */
export abstract class BaseListService<TEntity, TFilterDto extends BaseFilterDto> {
  protected prisma: PrismaClient;
  protected config: BaseListServiceConfig<TFilterDto>;

  constructor(prisma: PrismaClient, config: BaseListServiceConfig<TFilterDto>) {
    this.prisma = prisma;
    this.config = config;
  }

  /**
   * Get all entities with pagination, filtering, and sorting
   * This method implements the common list pattern used across all services
   */
  async getAllEntities(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ): Promise<PaginatedResult<TEntity>> {
    return tryCatch(async () => {
      logger.debug(`Getting all ${this.config.entityName}s with params`, {
        requestingUserId: requestingUser.id,
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      });

      // Step 1: Convert filter params to structured DTO
      const filterDto = this.convertFiltersToDto(params.filters);
      
      // Step 2: Build filters using the structured DTO with tenant isolation
      const filters = this.buildFiltersFromDto(filterDto, requestingUser);
      
      // Step 3: Build sorting using field mapping
      const sorting = this.buildSorting(params);
      
      // Step 4: Get query options using pagination utilities
      const queryOptions = getPrismaQueryOptions(
        { page: params.page, limit: params.limit, skip: params.skip },
        sorting
      );

      // Step 5: Execute queries with include/select options
      const includeOptions = this.getIncludeOptions() || {};
      const tableName = this.getTableName();
      const [entities, total] = await Promise.all([
        (this.prisma as any)[tableName].findMany({
          where: filters,
          ...queryOptions,
          ...includeOptions
        }),
        (this.prisma as any)[tableName].count({ where: filters })
      ]);

      // Step 6: Format response (allow custom formatting)
      const formattedEntities = this.formatEntities ? 
        this.formatEntities(entities as TEntity[]) : 
        entities as TEntity[];

      logger.debug(`${this.config.entityName}s retrieved successfully`, {
        count: formattedEntities.length,
        total,
        page: params.page
      });

      return {
        items: formattedEntities,
        total,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
          hasNext: params.page < Math.ceil(total / params.limit),
          hasPrev: params.page > 1
        }
      };
    }, {
      context: this.createLogContext(requestingUser, { 
        page: params.page, 
        limit: params.limit, 
        filters: Object.keys(params.filters) 
      })
    });
  }

  /**
   * Convert filter parameters to structured DTO
   */
  protected convertFiltersToDto(filterParams: any): TFilterDto {
    return convertFiltersToDto<TFilterDto>(filterParams, this.config.filterConversion);
  }

  /**
   * Build Prisma filters from structured DTO with tenant isolation
   */
  protected buildFiltersFromDto(filterDto: TFilterDto, requestingUser: TokenPayload): Record<string, any> {
    return buildFiltersFromDto(
      filterDto,
      requestingUser,
      (dto, baseFilters) => this.buildEntitySpecificFilters(dto, baseFilters),
      this.config.tenantOptions
    );
  }

  /**
   * Build entity-specific filters (to be implemented by subclasses)
   */
  protected abstract buildEntitySpecificFilters(
    filterDto: TFilterDto, 
    baseFilters: Record<string, any>
  ): Record<string, any>;

  /**
   * Build sorting using field mapping
   */
  protected buildSorting(params: ExtendedPaginationWithFilters): Record<string, any> {
    return buildSorting(
      params,
      this.config.fieldMapping,
      this.config.defaultSortField,
      this.config.defaultSortOrder
    );
  }

  /**
   * Helper method to build search filters for the entity
   */
  protected buildSearchFilters(searchTerm: string | undefined): Record<string, any> | undefined {
    if (!searchTerm || !this.config.searchFields) {
      return undefined;
    }

    const options: any = {};
    if (this.config.searchRelations) {
      options.includeRelations = this.config.searchRelations;
    }

    return buildSearchFilters(searchTerm, this.config.searchFields, options);
  }

  /**
   * Get the Prisma table name for this entity
   */
  protected abstract getTableName(): string;

  /**
   * Get include options for Prisma queries (optional - can be overridden)
   */
  protected getIncludeOptions(): Record<string, any> | undefined {
    return undefined;
  }

  /**
   * Format entities before returning (optional - can be overridden)
   */
  protected formatEntities(entities: TEntity[]): TEntity[] {
    return entities;
  }

  /**
   * Create log context for error handling
   */
  protected createLogContext(requestingUser: TokenPayload, additionalContext?: any): ServiceContext {
    return {
      requestingUser: {
        id: requestingUser.id,
        role: requestingUser.user_type,
        tenantId: requestingUser.tenantId
      },
      ...additionalContext
    };
  }

  /**
   * Check if user can access all tenants
   */
  protected canAccessAllTenants(requestingUser: TokenPayload): boolean {
    return canAccessAllTenants(requestingUser, this.config.tenantOptions);
  }

  /**
   * Get tenant constraint for queries
   */
  protected getTenantConstraint(requestingUser: TokenPayload): Record<string, any> {
    return getTenantConstraint(requestingUser, this.config.tenantOptions);
  }

  /**
   * Build base filters with tenant isolation
   */
  protected buildBaseFilters(requestingUser: TokenPayload): Record<string, any> {
    return buildBaseFilters(requestingUser, this.config.tenantOptions);
  }

  /**
   * Map API field to database field
   */
  protected mapApiToDbField(apiField: string): string {
    return mapApiToDbField(apiField, this.config.fieldMapping);
  }

  /**
   * Utility method to merge filters
   */
  protected mergeFilters(
    baseFilters: Record<string, any>,
    ...additionalFilters: (Record<string, any> | undefined)[]
  ): Record<string, any> {
    return mergeFilters(baseFilters, ...additionalFilters);
  }
}
