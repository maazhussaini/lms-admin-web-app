/**
 * @file services/program.service.ts
 * @description Service for managing academic programs with tenant isolation
 */

import prisma from '@/config/database';
import { CreateProgramDto, UpdateProgramDto, ProgramResponseDto, ProgramFilterDto } from '@/dtos/course/program.dto';
import { ProgramsByTenantResponse } from '@/dtos/course/programs-by-tenant.dto';
import { ApiError } from '@/utils/api-error.utils';
import { TListResponse } from '@shared/types';
import { TokenPayload } from '@/utils/jwt.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { BaseListService } from '@/utils/base-list.service';
import { BaseServiceConfig } from '@/utils/service.types';
import { PROGRAM_FIELD_MAPPINGS } from '@/utils/field-mapping.utils';
import { 
  buildSearchFilters,
  buildDateRangeFilter,
  mergeFilters
} from '@/utils/filter-builders.utils';
import { 
  buildEntityAccessFilters,
  updateAuditFields,
  deleteAuditFields
} from '@/utils/tenant-isolation.utils';
import logger from '@/config/logger';

// Initialize Prisma client


export class ProgramService extends BaseListService<any, ProgramFilterDto> {
  private static instance: ProgramService;

  private constructor() {
    // Configuration for the base service
    const config: BaseServiceConfig = {
      entityName: 'program',
      primaryKeyField: 'program_id',
      fieldMapping: PROGRAM_FIELD_MAPPINGS,
      filterConversion: {
        stringFields: ['programName', 'search'],
        booleanFields: ['isActive'],
        numberFields: [],
        enumFields: {}
      },
      defaultSortField: 'created_at',
      defaultSortOrder: 'desc'
    };

    super(prisma, config);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProgramService {
    if (!ProgramService.instance) {
      ProgramService.instance = new ProgramService();
    }
    return ProgramService.instance;
  }

  /**
   * Get Prisma table name
   */
  protected getTableName(): string {
    return 'program';
  }

  /**
   * Build entity-specific filters using utility functions
   */
  protected buildEntitySpecificFilters(
    filterDto: ProgramFilterDto,
    baseFilters: Record<string, any>
  ): Record<string, any> {
    // Start with base filters (includes tenant isolation and soft delete protection)
    let filters = { ...baseFilters };

    // Build search filters using utility
    const searchFilters = this.buildSearchFilters(filterDto.search);
    if (searchFilters) {
      filters = mergeFilters(filters, searchFilters);
    }

    // Build individual field search filters
    filters = mergeFilters(filters, buildSearchFilters(filterDto.programName, ['program_name']));
    
    // Apply individual field filters
    if (filterDto.isActive !== undefined) filters['is_active'] = filterDto.isActive;

    // Handle date range filters
    if (filterDto.dateRange) {
      const field = filterDto.dateRange.field === 'updatedAt' ? 'updated_at' : 'created_at';
      filters = mergeFilters(filters, buildDateRangeFilter(
        filterDto.dateRange.startDate,
        filterDto.dateRange.endDate,
        field
      ));
    }

    // Handle legacy createdAtRange filter
    if (filterDto.createdAtRange) {
      filters = mergeFilters(filters, buildDateRangeFilter(
        filterDto.createdAtRange.from,
        filterDto.createdAtRange.to,
        'created_at'
      ));
    }

    // Handle legacy updatedAtRange filter
    if (filterDto.updatedAtRange) {
      filters = mergeFilters(filters, buildDateRangeFilter(
        filterDto.updatedAtRange.from,
        filterDto.updatedAtRange.to,
        'updated_at'
      ));
    }

    return filters;
  }
  /**
   * Create a new academic program with tenant isolation
   * 
   * @param data Program data from validated DTO
   * @param requestingUser User making the request
   * @returns Newly created program
   */
  async createProgram(data: CreateProgramDto, requestingUser: TokenPayload, ip?: string): Promise<ProgramResponseDto> {
    // Log the tenant context for debugging
    logger.debug('Creating program with tenant context', {
      tenantId: requestingUser.tenantId,
      userId: requestingUser.id,
      programName: data.program_name
    });

    // Build tenant filter for uniqueness check
    const tenantFilter = requestingUser.tenantId === 0 ? {} : { tenant_id: requestingUser.tenantId };

    // Check if program with same name exists in this tenant
    const existingProgram = await prisma.program.findFirst({
      where: {
        program_name: data.program_name,
        is_deleted: false,
        ...tenantFilter
      }
    });

    if (existingProgram) {
      throw new ApiError('Program with this name already exists', 409, 'DUPLICATE_PROGRAM_NAME');
    }

    // Prepare audit fields using utility
    const auditData = updateAuditFields(requestingUser, ip);

    // Create new program with audit fields
    const newProgram = await prisma.program.create({
      data: {
        program_name: data.program_name,
        tenant_id: requestingUser.tenantId,
        is_active: true,
        is_deleted: false,
        created_by: requestingUser.id,
        created_ip: ip || null,
        ...auditData
      }
    });

    return this.mapProgramToDto(newProgram);
  }
  
  /**
   * Get program by ID with tenant isolation
   * 
   * @param programId Program identifier
   * @param requestingUser User making the request
   * @returns Program if found and belongs to tenant
   */
  async getProgramById(programId: number, requestingUser: TokenPayload): Promise<ProgramResponseDto> {
    // Log the tenant context for debugging
    logger.debug('Getting program by ID with tenant context', {
      programId,
      tenantId: requestingUser.tenantId
    });

    // Build tenant-specific filter using utility
    const accessFilters = buildEntityAccessFilters(programId, requestingUser, 'program_id');
    
    const program = await prisma.program.findFirst({
      where: {
        program_id: programId,
        is_deleted: false,
        ...accessFilters
      }
    });
    
    if (!program) {
      throw new ApiError(
        'Program not found', 
        404, 
        'PROGRAM_NOT_FOUND',
        { context: { programId, tenantId: requestingUser.tenantId } }
      );
    }
    
    return this.mapProgramToDto(program);
  }
  
  /**
   * Get all programs with pagination, sorting and filtering (modernized)
   * 
   * @param requestingUser Authenticated user (TokenPayload) 
   * @param params ExtendedPaginationWithFilters
   * @returns List response with programs and pagination metadata
   */
  async getAllPrograms(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ): Promise<TListResponse<ProgramResponseDto>> {
    const result = await this.getAllEntities(requestingUser, params);
    return {
      items: result.items.map(program => this.mapProgramToDto(program)),
      pagination: result.pagination
    };
  }
  
  /**
   * Update program by ID with tenant isolation
   * 
   * @param programId Program identifier
   * @param data Update data from validated DTO
   * @param requestingUser User making the request
   * @returns Updated program
   */
  async updateProgram(
    programId: number, 
    data: UpdateProgramDto, 
    requestingUser: TokenPayload,
    ip?: string
  ): Promise<ProgramResponseDto> {
    // Verify program exists and belongs to tenant
    await this.getProgramById(programId, requestingUser);
    
    // Check name uniqueness if updating name
    if (data.program_name) {
      // Build tenant filter for uniqueness check
      const tenantFilter = requestingUser.tenantId === 0 ? {} : { tenant_id: requestingUser.tenantId };
      
      const existingProgram = await prisma.program.findFirst({
        where: {
          program_name: data.program_name,
          is_deleted: false,
          program_id: {
            not: programId
          },
          ...tenantFilter
        }
      });
      
      if (existingProgram) {
        throw new ApiError('Program with this name already exists', 409, 'DUPLICATE_PROGRAM_NAME');
      }
    }
    
    // Prepare audit fields using utility
    const auditData = updateAuditFields(requestingUser, ip);
    
    // Update program
    const updatedProgram = await prisma.program.update({
      where: {
        program_id: programId
      },
      data: {
        ...data,
        ...auditData
      }
    });
    
    return this.mapProgramToDto(updatedProgram);
  }
  
  /**
   * Soft delete program by ID with tenant isolation
   * 
   * @param programId Program identifier
   * @param requestingUser User making the request
   * @returns Success message
   */
  async deleteProgram(programId: number, requestingUser: TokenPayload, ip?: string): Promise<{ message: string }> {
    // Verify program exists and belongs to tenant
    await this.getProgramById(programId, requestingUser);
    
    // Check if specializations exist for this program  
    const specializationsCount = await prisma.specializationProgram.count({
      where: {
        program_id: programId,
        is_deleted: false
      }
    });
    
    if (specializationsCount > 0) {
      throw new ApiError(
        'Cannot delete program with existing specializations',
        422,
        'PROGRAM_HAS_SPECIALIZATIONS',
        { context: { specializationsCount } }
      );
    }
    
    // Prepare delete audit fields using utility
    const deleteData = deleteAuditFields(requestingUser, ip);
    
    // Soft delete by updating is_deleted flag
    await prisma.program.update({
      where: {
        program_id: programId
      },
      data: {
        is_deleted: true,
        is_active: false,
        ...deleteData
      }
    });
    
    return { message: 'Program deleted successfully' };
  }

  /**
   * Get all programs for the specified tenant with optional filtering and pagination
   * @param tenantId Tenant identifier for filtering programs (0 for SUPER_ADMIN means all tenants)
   * @param filters Optional filters for active status
   * @param paginationParams Optional pagination parameters
   * @returns List of programs for the specified tenant with pagination metadata
   */
  async getProgramsByTenant(
    tenantId: number, 
    filters?: { is_active?: boolean },
    paginationParams?: ExtendedPaginationWithFilters
  ): Promise<{ items: ProgramsByTenantResponse[]; total: number }> {
    // Log the tenant context for debugging
    logger.debug('Getting programs by tenant', {
      tenantId,
      filters,
      paginationParams
    });

    // Build where clause
    const whereClause: any = {
      is_deleted: false
    };

    // For SUPER_ADMIN (tenantId = 0), don't filter by tenant
    // For other users, filter by specific tenant
    if (tenantId !== 0) {
      whereClause.tenant_id = tenantId;
    }

    // Add is_active filter if provided
    if (filters?.is_active !== undefined) {
      whereClause.is_active = filters.is_active;
    } else {
      // Default to active programs if no filter specified
      whereClause.is_active = true;
    }

    // Add search filter if provided
    if (paginationParams?.filters?.['search']) {
      whereClause.program_name = {
        contains: paginationParams.filters['search'] as string,
        mode: 'insensitive' as const
      };
    }

    // Get total count for pagination
    const total = await prisma.program.count({
      where: whereClause
    });

    // Calculate pagination
    const page = paginationParams?.page || 1;
    const limit = paginationParams?.limit || 10;
    const skip = paginationParams?.skip ?? (page - 1) * limit;

    // Get programs for the specified tenant with pagination
    const programs = await prisma.program.findMany({
      where: whereClause,
      orderBy: {
        program_name: 'asc'
      },
      skip,
      take: limit
    });

    // Debug logging
    logger.debug('Database query results', {
      tenantId,
      filters,
      whereClause,
      paginationParams,
      resultCount: programs.length,
      total,
      results: programs.map(p => ({
        program_id: p.program_id,
        program_name: p.program_name,
        tenant_id: p.tenant_id,
        is_active: p.is_active,
        is_deleted: p.is_deleted
      }))
    });

    // Map to response DTO format
    const items = programs.map((program: any) => ({
      program_id: program.program_id,
      program_name: program.program_name,
      program_thumbnail_url: program.program_thumbnail_url,
      tenant_id: program.tenant_id,
      is_active: program.is_active,
      is_deleted: program.is_deleted,
      created_at: program.created_at,
      updated_at: program.updated_at
    }));

    return {
      items,
      total
    };
  }
  
  /**
   * Map Prisma program entity to DTO for client response
   * @param program Program entity from database
   * @returns Program DTO for API response
   */
  private mapProgramToDto(program: any): ProgramResponseDto {
    return {
      program_id: program.program_id,
      program_name: program.program_name,
      is_active: program.is_active,
      created_at: program.created_at,
      updated_at: program.updated_at
    };
  }
}
