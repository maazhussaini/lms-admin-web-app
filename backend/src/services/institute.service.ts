/**
 * @file services/institute.service.ts
 * @description Service for managing institutes with modern BaseListService pattern
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateInstituteDto,
  UpdateInstituteDto,
  InstituteFilterDto
} from '@/dtos/institute/institute.dto';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { UserType } from '@/types/enums.types';
import logger from '@/config/logger';
import { BaseListService, BaseListServiceConfig } from '@/utils/base-list.service';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Configuration for Institute service operations
 */
const INSTITUTE_SERVICE_CONFIG: BaseListServiceConfig = {
  entityName: 'institute',
  primaryKeyField: 'institute_id',
  fieldMapping: {
    'instituteId': 'institute_id',
    'instituteName': 'institute_name',
    'tenantId': 'tenant_id',
    'isActive': 'is_active',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  filterConversion: {
    stringFields: ['search'],
    booleanFields: [],
    numberFields: ['tenantId'],
    enumFields: {}
  },
  defaultSortField: 'created_at',
  defaultSortOrder: 'desc',
  searchFields: ['institute_name']
};

export class InstituteService extends BaseListService<any, InstituteFilterDto> {
  private static instance: InstituteService;

  private constructor() {
    super(prisma, INSTITUTE_SERVICE_CONFIG);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): InstituteService {
    if (!InstituteService.instance) {
      InstituteService.instance = new InstituteService();
    }
    return InstituteService.instance;
  }

  /**
   * Get table name for queries
   */
  protected getTableName(): string {
    return 'institute';
  }

  /**
   * Get include options for queries
   */
  protected override getIncludeOptions(): any {
    return {
      include: {
        tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      }
    };
  }

  /**
   * Build entity-specific filters
   */
  protected buildEntitySpecificFilters(filters: InstituteFilterDto): any {
    const whereClause: any = {
      // Always exclude soft-deleted institutes
      is_deleted: false
    };

    // Tenant filter
    if (filters.tenantId !== undefined) {
      whereClause.tenant_id = filters.tenantId;
    }

    return whereClause;
  }

  /**
   * Format entity response
   */
  protected formatEntityResponse(entity: any): any {
    return {
      ...entity,
      tenant_name: entity.tenant?.tenant_name || null
    };
  }

  /**
   * Create a new institute
   * 
   * @param data Institute data from validated DTO
   * @param requestingUser User requesting the institute creation
   * @param clientIp IP address of the request
   * @returns Newly created institute
   */
  async createInstitute(
    data: CreateInstituteDto,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      // Determine tenant ID based on user type
      let tenantId: number;
      
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        // SUPER_ADMIN must provide tenant_id in request body
        if (!data.tenant_id) {
          throw new BadRequestError('Tenant ID is required when creating an institute as SUPER_ADMIN', 'MISSING_TENANT_ID');
        }
        tenantId = data.tenant_id;
      } 
      else {
        // Regular admins use their own tenant
        if (!requestingUser.tenantId) {
          throw new BadRequestError('Tenant ID is required', 'MISSING_TENANT_ID');
        }
        tenantId = requestingUser.tenantId;
      }

      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { 
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
      }

      // Check for duplicate institute name within tenant
      const existingInstitute = await prisma.institute.findFirst({
        where: {
          tenant_id: tenantId,
          institute_name: data.institute_name,
          is_deleted: false
        }
      });

      if (existingInstitute) {
        throw new ConflictError(
          'An institute with this name already exists in this tenant',
          'DUPLICATE_INSTITUTE_NAME'
        );
      }

      // Create the institute
      const newInstitute = await prisma.institute.create({
        data: {
          tenant_id: tenantId,
          institute_name: data.institute_name,
          created_by: requestingUser.id,
          created_ip: clientIp || null,
          is_active: true,
          is_deleted: false
        },
        include: {
          tenant: {
            select: {
              tenant_id: true,
              tenant_name: true
            }
          }
        }
      });

      logger.info('Institute created successfully', {
        instituteId: newInstitute.institute_id,
        instituteName: newInstitute.institute_name,
        tenantId: newInstitute.tenant_id,
        createdBy: requestingUser.id
      });

      return this.formatEntityResponse(newInstitute);
    });
  }

  /**
   * Get all institutes with pagination, sorting, and filtering
   * 
   * @param requestingUser User requesting the institutes
   * @param params Pagination and filter parameters
   * @returns Paginated list of institutes
   */
  async getAllInstitutes(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return this.getAllEntities(requestingUser, params);
  }

  /**
   * Get institute by ID
   * 
   * @param instituteId Institute ID
   * @param requestingUser User requesting the institute
   * @returns Institute details
   */
  async getInstituteById(
    instituteId: number,
    requestingUser: TokenPayload
  ) {
    return tryCatch(async () => {
      const institute = await prisma.institute.findFirst({
        where: {
          institute_id: instituteId,
          is_deleted: false
        },
        include: {
          tenant: {
            select: {
              tenant_id: true,
              tenant_name: true
            }
          }
        }
      });

      if (!institute) {
        throw new NotFoundError('Institute not found', 'INSTITUTE_NOT_FOUND');
      }

      // Authorization check: SUPER_ADMIN can access all, others only their tenant
      if (
        requestingUser.user_type !== UserType.SUPER_ADMIN &&
        institute.tenant_id !== requestingUser.tenantId
      ) {
        throw new ForbiddenError(
          'You do not have permission to access this institute',
          'FORBIDDEN'
        );
      }

      return this.formatEntityResponse(institute);
    });
  }

  /**
   * Update institute by ID
   * 
   * @param instituteId Institute ID
   * @param data Update data from validated DTO
   * @param requestingUser User requesting the update
   * @param clientIp IP address of the request
   * @returns Updated institute
   */
  async updateInstitute(
    instituteId: number,
    data: UpdateInstituteDto,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      // Fetch existing institute
      const existingInstitute = await prisma.institute.findFirst({
        where: {
          institute_id: instituteId,
          is_deleted: false
        }
      });

      if (!existingInstitute) {
        throw new NotFoundError('Institute not found', 'INSTITUTE_NOT_FOUND');
      }

      // Authorization check: SUPER_ADMIN can update all, others only their tenant
      if (
        requestingUser.user_type !== UserType.SUPER_ADMIN &&
        existingInstitute.tenant_id !== requestingUser.tenantId
      ) {
        throw new ForbiddenError(
          'You do not have permission to update this institute',
          'FORBIDDEN'
        );
      }

      // Check for duplicate institute name if name is being changed
      if (data.institute_name && data.institute_name !== existingInstitute.institute_name) {
        const duplicateInstitute = await prisma.institute.findFirst({
          where: {
            tenant_id: existingInstitute.tenant_id,
            institute_name: data.institute_name,
            is_deleted: false,
            institute_id: { not: instituteId }
          }
        });

        if (duplicateInstitute) {
          throw new ConflictError(
            'An institute with this name already exists in this tenant',
            'DUPLICATE_INSTITUTE_NAME'
          );
        }
      }

      // Update the institute
      const updatedInstitute = await prisma.institute.update({
        where: { institute_id: instituteId },
        data: {
          ...data,
          updated_by: requestingUser.id,
          updated_ip: clientIp || null,
          updated_at: new Date()
        },
        include: {
          tenant: {
            select: {
              tenant_id: true,
              tenant_name: true
            }
          }
        }
      });

      logger.info('Institute updated successfully', {
        instituteId: updatedInstitute.institute_id,
        updatedBy: requestingUser.id
      });

      return this.formatEntityResponse(updatedInstitute);
    });
  }

  /**
   * Delete institute by ID (soft delete)
   * 
   * @param instituteId Institute ID
   * @param requestingUser User requesting the deletion
   * @param clientIp IP address of the request
   */
  async deleteInstitute(
    instituteId: number,
    requestingUser: TokenPayload,
    clientIp?: string
  ): Promise<void> {
    return tryCatch(async () => {
      // Fetch existing institute
      const existingInstitute = await prisma.institute.findFirst({
        where: {
          institute_id: instituteId,
          is_deleted: false
        }
      });

      if (!existingInstitute) {
        throw new NotFoundError('Institute not found', 'INSTITUTE_NOT_FOUND');
      }

      // Authorization check: SUPER_ADMIN can delete all, others only their tenant
      if (
        requestingUser.user_type !== UserType.SUPER_ADMIN &&
        existingInstitute.tenant_id !== requestingUser.tenantId
      ) {
        throw new ForbiddenError(
          'You do not have permission to delete this institute',
          'FORBIDDEN'
        );
      }

      // Soft delete the institute
      await prisma.institute.update({
        where: { institute_id: instituteId },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: requestingUser.id,
          updated_ip: clientIp || null
        }
      });

      logger.info('Institute deleted successfully', {
        instituteId,
        deletedBy: requestingUser.id
      });
    });
  }

  /**
   * Get tenant from domain helper method
   * 
   * @param req Request object with hostname
   * @returns Tenant object
   */
  async getTenantFromDomain(req: any): Promise<any> {
    const originalHost = req?.headers['x-original-host'] as string || 
                        req?.headers['x-forwarded-host'] as string || 
                        req?.headers.host as string;

    if (!originalHost) {
      throw new BadRequestError('Unable to determine tenant from request', 'INVALID_HOSTNAME');
    }

    const domain = originalHost;
    
    try {
      // Use raw query to find tenant by domain
      const tenants = await prisma.$queryRaw`
        SELECT * FROM tenants 
        WHERE tenant_domain = ${domain} 
        AND tenant_status IN ('ACTIVE', 'TRIAL')
        AND is_active = true 
        AND is_deleted = false 
        LIMIT 1
      ` as any[];
      
      const tenant = tenants.length > 0 ? tenants[0] : null;

      if (!tenant) {
        throw new NotFoundError('Tenant not found for this domain', 'TENANT_NOT_FOUND');
      }

      logger.info(`Found tenant: ${tenant.tenant_name} (ID: ${tenant.tenant_id}) for domain: ${domain}`);
      return tenant;
    } catch (error) {
      logger.error('Error fetching tenant by domain:', { error, domain });
      throw new BadRequestError('Unable to determine tenant from request', 'INVALID_HOSTNAME');
    }
  }
}

export const instituteService = InstituteService.getInstance();
