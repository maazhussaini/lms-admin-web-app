import { PrismaClient } from '@prisma/client';
import { Specialization } from '@shared/types/course.types';
import { CreateSpecializationDto, UpdateSpecializationDto, SpecializationFilterDto } from '@/dtos/course/specialization.dto';
import { ActiveSpecializationsByProgramResponse } from '@/dtos/course/active-specializations-by-program.dto';
import { ApiError } from '@/utils/api-error.utils';
import { TListResponse } from '@shared/types';
import { TokenPayload } from '@/utils/jwt.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { BaseListService } from '@/utils/base-list.service';
import { BaseServiceConfig } from '@/utils/service.types';
import { SPECIALIZATION_FIELD_MAPPINGS } from '@/utils/field-mapping.utils';
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
const prisma = new PrismaClient();

/**
 * Service for managing specializations with modern utility classes
 */
export class SpecializationService extends BaseListService<any, SpecializationFilterDto> {
  private static instance: SpecializationService;

  private constructor() {
    // Configuration for the base service
    const config: BaseServiceConfig<SpecializationFilterDto> = {
      entityName: 'specialization',
      primaryKeyField: 'specialization_id',
      fieldMapping: SPECIALIZATION_FIELD_MAPPINGS,
      filterConversion: {
        stringFields: ['specializationName', 'search'],
        booleanFields: ['isActive'],
        numberFields: ['programId'],
        enumFields: {}
      },
      defaultSortField: 'created_at',
      defaultSortOrder: 'desc'
    };

    super(prisma, config);
  }

  /**
   * Get singleton instance of SpecializationService
   */
  static getInstance(): SpecializationService {
    if (!SpecializationService.instance) {
      SpecializationService.instance = new SpecializationService();
    }
    return SpecializationService.instance;
  }

  /**
   * Get Prisma table name
   */
  protected getTableName(): string {
    return 'specialization';
  }

  /**
   * Build entity-specific filters for specializations
   */
  protected buildEntitySpecificFilters(
    filterDto: SpecializationFilterDto,
    baseFilters: Record<string, any>
  ): Record<string, any> {
    // Start with base filters (includes tenant isolation and soft delete protection)
    let filters = { ...baseFilters };

    // Build search filters using utility
    const searchFilters = buildSearchFilters(
      filterDto.search,
      ['specialization_name', 'specialization_description', 'specialization_code']
    );
    if (searchFilters) {
      mergeFilters(filters, searchFilters);
    }

    // Program ID filter for specializations
    if (filterDto.program_id) {
      filters['specialization_program'] = {
        some: {
          program_id: filterDto.program_id,
          is_active: true,
          is_deleted: false
        }
      };
    }

    // Active status filter
    if (filterDto.is_active !== undefined) {
      filters['is_active'] = filterDto.is_active;
    }

    // Date range filters
    if (filterDto.createdAtRange?.start || filterDto.createdAtRange?.end) {
      const createdAtFilter = buildDateRangeFilter(
        filterDto.createdAtRange.start,
        filterDto.createdAtRange.end,
        'created_at'
      );
      if (createdAtFilter) {
        mergeFilters(filters, createdAtFilter);
      }
    }

    if (filterDto.updatedAtRange?.start || filterDto.updatedAtRange?.end) {
      const updatedAtFilter = buildDateRangeFilter(
        filterDto.updatedAtRange.start,
        filterDto.updatedAtRange.end,
        'updated_at'
      );
      if (updatedAtFilter) {
        mergeFilters(filters, updatedAtFilter);
      }
    }

    return filters;
  }

  /**
   * Get all specializations with pagination, sorting and filtering (modernized)
   */
  async getAllSpecializations(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ): Promise<TListResponse<any>> {
    logger.debug('Getting all specializations with params', {
      requestingUserId: requestingUser.id,
      tenantId: requestingUser.tenantId,
      params: {
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }
    });

    const result = await this.getAllEntities(requestingUser, params);
    
    return {
      items: result.items,
      pagination: result.pagination
    };
  }
  
  /**
   * Create a new specialization with tenant isolation
   * 
   * @param data Specialization data from validated DTO
   * @param requestingUser User making the request
   * @returns Newly created specialization
   */
  async createSpecialization(
    data: CreateSpecializationDto,
    requestingUser: TokenPayload,
    ip?: string
  ): Promise<Specialization> {
    logger.debug('Creating specialization', {
      specializationName: data.specializationName,
      programId: data.programId,
      tenantId: requestingUser.tenantId,
      userId: requestingUser.id
    });

    // Validate program exists and belongs to tenant using modern utility
    const programAccessFilters = buildEntityAccessFilters(data.programId, requestingUser, 'program_id');
    const program = await prisma.program.findFirst({
      where: {
        ...programAccessFilters,
        is_deleted: false
      }
    });
    
    if (!program) {
      throw new ApiError('Program not found or not accessible', 404, 'PROGRAM_NOT_FOUND');
    }

    // Prepare audit fields using utility
    const auditData = updateAuditFields(requestingUser, ip);

    // Create specialization first
    const specialization = await prisma.specialization.create({
      data: {
        tenant_id: requestingUser.tenantId,
        specialization_name: data.specializationName,
        ...(data.specializationDescription ? { specialization_description: data.specializationDescription } : {}),
        ...(data.specializationCode ? { specialization_code: data.specializationCode } : {}),
        is_active: true,
        is_deleted: false,
        created_by: requestingUser.id,
        created_ip: ip || null,
        ...auditData
      }
    });

    // Create the relationship in the junction table
    await prisma.specializationProgram.create({
      data: {
        specialization_id: specialization.specialization_id,
        program_id: data.programId,
        is_active: true,
        is_deleted: false,
        created_by: requestingUser.id,
        created_ip: ip || null,
        ...auditData
      }
    });

    logger.debug('Specialization created successfully', {
      specializationId: specialization.specialization_id,
      specializationName: specialization.specialization_name
    });

    return specialization as unknown as Specialization;
  }



  /**
   * Get specialization by ID with tenant isolation
   * 
   * @param specializationId Specialization identifier
   * @param requestingUser User making the request
   * @returns Specialization if found and belongs to tenant
   */
  async getSpecializationById(
    specializationId: number,
    requestingUser: TokenPayload
  ): Promise<Specialization> {
    logger.debug('Getting specialization by ID', {
      specializationId,
      tenantId: requestingUser.tenantId
    });

    // Build tenant-specific filter using utility
    const accessFilters = buildEntityAccessFilters(specializationId, requestingUser, 'specialization_id');

    const specialization = await prisma.specialization.findFirst({
      where: {
        ...accessFilters,
        is_deleted: false
      }
    });
    
    if (!specialization) {
      throw new ApiError('Specialization not found', 404, 'SPECIALIZATION_NOT_FOUND');
    }
    
    return specialization as unknown as Specialization;
  }

  /**
   * Update specialization by ID with tenant isolation
   * 
   * @param specializationId Specialization identifier
   * @param data Update data from validated DTO
   * @param requestingUser User making the request
   * @returns Updated specialization
   */
  async updateSpecialization(
    specializationId: number,
    data: UpdateSpecializationDto,
    requestingUser: TokenPayload,
    ip?: string
  ): Promise<Specialization> {
    // Verify specialization exists and belongs to tenant
    await this.getSpecializationById(specializationId, requestingUser);

    // Prepare audit fields using utility
    const auditData = updateAuditFields(requestingUser, ip);

    // Update specialization
    const updated = await prisma.specialization.update({
      where: {
        specialization_id: specializationId
      },
      data: {
        ...('specializationName' in data ? { specialization_name: data.specializationName } : {}),
        ...('specializationDescription' in data ? { specialization_description: data.specializationDescription } : {}),
        ...('specializationCode' in data ? { specialization_code: data.specializationCode } : {}),
        ...auditData
      }
    });

    logger.debug('Specialization updated successfully', {
      specializationId: updated.specialization_id,
      specializationName: updated.specialization_name
    });
    
    return updated as unknown as Specialization;
  }

  /**
   * Soft delete specialization by ID with tenant isolation
   * 
   * @param specializationId Specialization identifier
   * @param requestingUser User making the request
   * @returns Success message
   */
  async deleteSpecialization(
    specializationId: number,
    requestingUser: TokenPayload,
    ip?: string
  ): Promise<void> {
    // Verify specialization exists and belongs to tenant
    const specialization = await this.getSpecializationById(specializationId, requestingUser);

    // Prepare delete audit fields using utility
    const deleteData = deleteAuditFields(requestingUser, ip);

    // Soft delete by updating is_deleted flag
    await prisma.specialization.update({
      where: {
        specialization_id: specializationId
      },
      data: {
        is_deleted: true,
        is_active: false,
        ...deleteData
      }
    });

    logger.debug('Specialization deleted successfully', {
      specializationId,
      specializationName: specialization.specialization_name
    });
  }

  /**
   * Get active specializations by program
   * Converts PostgreSQL function: get_active_specializations_by_program
   */
  async getActiveSpecializationsByProgram(
    programId: number,
    requestingUser: TokenPayload,
    params?: ExtendedPaginationWithFilters
  ): Promise<{ items: ActiveSpecializationsByProgramResponse[]; total: number }> {
    logger.debug('Getting active specializations by program', {
      programId,
      tenantId: requestingUser.tenantId,
      params: params ? {
        page: params.page,
        limit: params.limit,
        search: params.filters?.['search']
      } : {}
    });

    // Build tenant filter for the query
    const tenantFilter = requestingUser.tenantId === 0 ? {} : { tenant_id: requestingUser.tenantId };

    // Build where clause with search support
    const whereClause = {
      is_active: true,
      is_deleted: false,
      ...tenantFilter,
      specialization_program: {
        some: {
          program_id: programId,
          is_active: true,
          is_deleted: false
        }
      },
      ...(params?.filters?.['search'] ? {
        specialization_name: {
          contains: params.filters['search'] as string,
          mode: 'insensitive' as const
        }
      } : {})
    };

    // Get total count
    const total = await prisma.specialization.count({
      where: whereClause
    });

    // Apply pagination if provided
    const skip = params ? (params.page - 1) * params.limit : undefined;
    const take = params?.limit;

    const specializations = await prisma.specialization.findMany({
      where: whereClause,
      include: {
        specialization_program: {
          where: {
            program_id: programId,
            is_active: true,
            is_deleted: false
          },
          select: {
            program_id: true
          }
        }
      },
      orderBy: {
        specialization_name: 'asc'
      },
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {})
    });

    // Transform the results to match the expected response format
    const items = specializations.map(specialization => ({
      specialization_id: specialization.specialization_id,
      program_id: programId, // We know this from the query parameter
      specialization_name: specialization.specialization_name,
      specialization_thumbnail_url: specialization.specialization_thumbnail_url
    }));

    logger.debug('Active specializations retrieved successfully', {
      programId,
      count: items.length,
      total
    });

    return { items, total };
  }
}
