/**
 * @file services/tenant.service.ts
 * @description Service for managing tenants and their contact information
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateTenantDto,
  UpdateTenantDto,
  CreateTenantPhoneNumberDto,
  CreateTenantEmailAddressDto,
  UpdateTenantPhoneNumberDto,
  UpdateTenantEmailAddressDto,
  TenantFilterDto
} from '@/dtos/tenant/tenant.dto';
import { NotFoundError, ConflictError, ForbiddenError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { getPrismaQueryOptions, SortOrder } from '@/utils/pagination.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters, SafeFilterParams } from '@/utils/async-handler.utils';
import { 
  TenantStatus,
  ContactType,
  UserType
} from '@/types/enums.types';
import logger from '@/config/logger';
import { BaseListService } from '@/utils/base-list.service';
import { BaseServiceConfig } from '@/utils/service.types';
import { TENANT_FIELD_MAPPINGS } from '@/utils/field-mapping.utils';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Filter DTO for tenant phone number queries
 */
interface TenantPhoneFilterDto {
  contactType?: ContactType;
  isPrimary?: boolean;
}

/**
 * Filter DTO for tenant email address queries
 */
interface TenantEmailFilterDto {
  contactType?: ContactType;
  isPrimary?: boolean;
}

/**
 * Filter DTO for tenant client queries
 */
interface TenantClientFilterDto {
  search?: string;
  status?: string;
}

/**
 * Configuration for Tenant service operations
 */
const TENANT_SERVICE_CONFIG: BaseServiceConfig<TenantFilterDto> = {
  entityName: 'tenant',
  primaryKeyField: 'tenant_id',
  fieldMapping: TENANT_FIELD_MAPPINGS,
  filterConversion: {
    stringFields: ['tenantName', 'search'],
    booleanFields: [],
    numberFields: [],
    enumFields: {}
  },
  defaultSortField: 'created_at',
  defaultSortOrder: 'desc'
};

export class TenantService extends BaseListService<any, TenantFilterDto> {
  private static instance: TenantService;

  private constructor() {
    super(prisma, TENANT_SERVICE_CONFIG);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  /**
   * Get table name for queries
   */
  protected getTableName(): string {
    return 'tenants';
  }

  /**
   * Build entity-specific filters
   */
  protected buildEntitySpecificFilters(_filters: TenantFilterDto): any {
    const whereClause: any = {};

    // Add tenant-specific filters here if needed
    // For now, return empty object as base filters handle common cases
    
    return whereClause;
  }
  /**
   * Create a new tenant
   * 
   * @param data Tenant data from validated DTO
   * @param userId System user ID for audit trail
   * @param ip IP address of the request
   * @returns Newly created tenant
   */
  async createTenant(data: CreateTenantDto, userId: number, ip?: string) {
    return tryCatch(async () => {
      logger.debug('Creating tenant', {
        tenantName: data.tenant_name,
        userId
      });

      // Check if tenant with same name exists
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          tenant_name: data.tenant_name,
          is_deleted: false
        }
      });

      if (existingTenant) {
        throw new ConflictError('Tenant with this name already exists', 'DUPLICATE_TENANT_NAME');
      }

      // Create new tenant
      const newTenant = await prisma.tenant.create({
        data: {
          tenant_name: data.tenant_name,
          logo_url_light: data.logo_url_light || null,
          logo_url_dark: data.logo_url_dark || null,
          favicon_url: data.favicon_url || null,        
          ...(data.theme && { theme: data.theme }),
          tenant_status: data.tenant_status || TenantStatus.ACTIVE,
          is_active: true,
          is_deleted: false,
          created_by: userId,
          updated_by: userId,
          created_ip: ip || null,
          updated_ip: ip || null
        }
      });

      return newTenant;
    }, {
      context: {
        tenantName: data.tenant_name,
        userId
      }
    });
  }

  /**
   * Get tenant by ID
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the tenant
   * @returns Tenant if found
   */
  async getTenantById(tenantId: number, requestingUser: TokenPayload) {
    return tryCatch(async () => {
      logger.debug('Getting tenant by ID', {
        tenantId,
        requestingUserId: requestingUser.id
      });

      // Super Admin can access any tenant
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        const tenant = await prisma.tenant.findFirst({
          where: {
            tenant_id: tenantId,
            is_deleted: false
          }
        });
        
        if (!tenant) {
          throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
        }
        
        return tenant;
      }

      // Regular users can only access their own tenant
      if (requestingUser.tenantId !== tenantId) {
        throw new ForbiddenError('Access denied to this tenant');
      }

      const tenant = await prisma.tenant.findFirst({
        where: {
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
      }

      return tenant;
    }, {
      context: {
        tenantId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }
  
  /**
   * Get all tenants with pagination, sorting and filtering
   * 
   * @param requestingUser Token payload with user info
   * @param params Extended pagination with filters
   * @returns List response with tenants and pagination metadata
   */
  async getAllTenants(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return this.getAllEntities(requestingUser, params);
  }

  /**
   * Get all clients for a specific tenant
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the clients
   * @param params Extended pagination with filters
   * @returns List of clients associated with the tenant
   */
  async getTenantClients(
    tenantId: number,
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return tryCatch(async () => {
      logger.debug('Getting tenant clients', {
        tenantId,
        requestingUserId: requestingUser.id,
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot access clients for another tenant');
      }

      // Convert filter params to structured DTO
      const filterDto = this.convertTenantClientFiltersToDto(params.filters);
      
      // Build filters using the structured DTO
      const filters = this.buildTenantClientFiltersFromDto(filterDto, tenantId);
      
      // Use pagination utilities to build sorting
      const sorting = this.buildTenantClientSorting(params);
      
      // Get query options using pagination utilities
      const queryOptions = getPrismaQueryOptions(
        { page: params.page, limit: params.limit, skip: params.skip },
        sorting
      );

      // Execute queries using Promise.all for better performance
      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where: filters,
          ...queryOptions,
          select: {
            client_id: true,
            full_name: true,
            email_address: true,
            dial_code: true,
            phone_number: true,
            address: true,
            client_status: true,
            tenant_id: true,
            is_active: true,
            created_at: true,
            updated_at: true
          }
        }),
        prisma.client.count({ where: filters })
      ]);

      return {
        items: clients,
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
      context: {
        tenantId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId },
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      }
    });
  }
  
  /**
   * Update tenant by ID
   * 
   * @param tenantId Tenant identifier
   * @param data Update data from validated DTO
   * @param userId System user ID for audit trail
   * @param ip IP address of the request
   * @returns Updated tenant
   */
  async updateTenant(tenantId: number, data: UpdateTenantDto, userId: number, ip?: string) {
    return tryCatch(async () => {
      logger.debug('Updating tenant', {
        tenantId,
        userId
      });

      // Verify tenant exists
      await this.getTenantById(tenantId, {
        id: userId, 
        email: 'system@admin.com', 
        role: 'SUPER_ADMIN', 
        tenantId,
        user_type: UserType.SUPER_ADMIN
      } as TokenPayload);

      // Update tenant
      const updateData: any = {
        updated_by: userId,
        updated_at: new Date(),
        updated_ip: ip || null
      };

      // Only include fields that are provided in the update data
      if (data.tenant_name !== undefined) updateData.tenant_name = data.tenant_name;
      if (data.logo_url_light !== undefined) updateData.logo_url_light = data.logo_url_light;
      if (data.logo_url_dark !== undefined) updateData.logo_url_dark = data.logo_url_dark;
      if (data.favicon_url !== undefined) updateData.favicon_url = data.favicon_url;
      if (data.theme !== undefined) updateData.theme = data.theme;
      if (data.tenant_status !== undefined) updateData.tenant_status = data.tenant_status;

      const updatedTenant = await prisma.tenant.update({
        where: {
          tenant_id: tenantId
        },
        data: updateData
      });
      
      return updatedTenant;
    }, {
      context: {
        tenantId,
        userId
      }
    });
  }
  
  /**
   * Soft delete tenant by ID
   * 
   * @param tenantId Tenant identifier
   * @param userId System user ID for audit trail
   * @param ip IP address of the request
   * @returns Success message
   */
  async deleteTenant(tenantId: number, userId: number, ip?: string) {
    return tryCatch(async () => {
      logger.debug('Deleting tenant', {
        tenantId,
        userId
      });

      // Verify tenant exists
      await this.getTenantById(tenantId, {
        id: userId, 
        email: 'system@admin.com', 
        role: 'SUPER_ADMIN', 
        tenantId,
        user_type: UserType.SUPER_ADMIN
      } as TokenPayload);

      // Soft delete by updating is_deleted flag
      await prisma.tenant.update({
        where: {
          tenant_id: tenantId
        },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: userId,
          updated_by: userId,
          updated_at: new Date(),
          updated_ip: ip || null
        }
      });
      
    }, {
      context: {
        tenantId,
        userId
      }
    });
  }

  /**
   * Create a new tenant phone number
   * 
   * @param tenantId Tenant identifier
   * @param phoneData Phone number data
   * @param requestingUser User creating the phone number
   * @param ip IP address for audit trail
   * @returns Newly created tenant phone number
   */
  async createTenantPhoneNumber(
    tenantId: number, 
    phoneData: CreateTenantPhoneNumberDto, 
    requestingUser: TokenPayload, 
    ip?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Creating tenant phone number', {
        tenantId,
        requestingUserId: requestingUser.id
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot create phone number for another tenant');
      }

      // Check for duplicate phone number in this tenant
      const existingPhone = await prisma.tenantPhoneNumber.findFirst({
        where: {
          tenant_id: tenantId,
          dial_code: phoneData.dial_code,
          phone_number: phoneData.phone_number,
          is_deleted: false
        }
      });

      if (existingPhone) {
        throw new ConflictError('Phone number already exists for this tenant');
      }

      // If this is being set as primary, unset other primary phones for the same contact type
      if (phoneData.is_primary) {
        await prisma.tenantPhoneNumber.updateMany({
          where: {
            tenant_id: tenantId,
            contact_type: phoneData.contact_type,
            is_primary: true,
            is_deleted: false
          },
          data: {
            is_primary: false,
            updated_by: requestingUser.id,
            updated_at: new Date(),
            updated_ip: ip || null
          }
        });
      }

      const newPhoneNumber = await prisma.tenantPhoneNumber.create({
        data: {
          tenant_id: tenantId,
          dial_code: phoneData.dial_code,
          phone_number: phoneData.phone_number,
          iso_country_code: phoneData.iso_country_code || null,
          contact_type: phoneData.contact_type || ContactType.PRIMARY,
          is_primary: phoneData.is_primary || false,
          is_active: true,
          is_deleted: false,
          created_by: requestingUser.id,
          updated_by: requestingUser.id,
          created_ip: ip || null,
          updated_ip: ip || null
        }
      });

      return newPhoneNumber;
    }, {
      context: {
        tenantId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Get all tenant phone numbers with pagination and filtering
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the phone numbers
   * @param params Extended pagination with filters
   * @returns List of tenant phone numbers with pagination metadata
   */
  async getAllTenantPhoneNumbers(
    tenantId: number,
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return tryCatch(async () => {
      logger.debug('Getting all tenant phone numbers', {
        tenantId,
        requestingUserId: requestingUser.id,
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot access phone numbers for another tenant');
      }

      // Convert filter params to structured DTO
      const filterDto = this.convertTenantPhoneFiltersToDto(params.filters);
      
      // Build filters using the structured DTO
      const filters = this.buildTenantPhoneFiltersFromDto(filterDto, tenantId);
      
      // Use pagination utilities to build sorting
      const sorting = this.buildTenantPhoneSorting(params);
      
      // Get query options using pagination utilities
      const queryOptions = getPrismaQueryOptions(
        { page: params.page, limit: params.limit, skip: params.skip },
        sorting
      );

      // Execute queries using Promise.all for better performance
      const [phoneNumbers, total] = await Promise.all([
        prisma.tenantPhoneNumber.findMany({
          where: filters,
          ...queryOptions
        }),
        prisma.tenantPhoneNumber.count({ where: filters })
      ]);

      return {
        items: phoneNumbers,
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
      context: {
        tenantId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId },
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      }
    });
  }

  /**
   * Update tenant phone number by ID
   * 
   * @param tenantId Tenant identifier
   * @param phoneId Phone number identifier
   * @param updateData Update data for the phone number
   * @param requestingUser User requesting the update
   * @param ip IP address for audit trail
   * @returns Updated tenant phone number
   */
  async updateTenantPhoneNumber(
    tenantId: number,
    phoneId: number,
    updateData: UpdateTenantPhoneNumberDto,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Updating tenant phone number', {
        tenantId,
        phoneId,
        requestingUserId: requestingUser.id
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot update phone number for another tenant');
      }

      // Verify phone number exists and belongs to the tenant
      const existingPhone = await prisma.tenantPhoneNumber.findFirst({
        where: {
          tenant_phone_number_id: phoneId,
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (!existingPhone) {
        throw new NotFoundError('Tenant phone number not found', 'TENANT_PHONE_NOT_FOUND');
      }

      // Build update data
      const updatePayload: any = {
        updated_by: requestingUser.id,
        updated_at: new Date(),
        updated_ip: ip || null
      };

      // Only include fields that are provided in the update data
      if (updateData.dial_code !== undefined) updatePayload.dial_code = updateData.dial_code;
      if (updateData.phone_number !== undefined) updatePayload.phone_number = updateData.phone_number;
      if (updateData.iso_country_code !== undefined) updatePayload.iso_country_code = updateData.iso_country_code;
      if (updateData.contact_type !== undefined) updatePayload.contact_type = updateData.contact_type;
      if (updateData.is_primary !== undefined) updatePayload.is_primary = updateData.is_primary;

      // Check for duplicate phone number if phone details are being updated
      if ((updateData.dial_code || updateData.phone_number) && 
          (updateData.dial_code !== existingPhone.dial_code || updateData.phone_number !== existingPhone.phone_number)) {
        const duplicatePhone = await prisma.tenantPhoneNumber.findFirst({
          where: {
            tenant_id: tenantId,
            dial_code: updateData.dial_code || existingPhone.dial_code,
            phone_number: updateData.phone_number || existingPhone.phone_number,
            tenant_phone_number_id: { not: phoneId },
            is_deleted: false
          }
        });

        if (duplicatePhone) {
          throw new ConflictError('Phone number already exists for this tenant');
        }
      }

      // If this is being set as primary, unset other primary phones for the same contact type
      if (updateData.is_primary === true) {
        const contactType = updateData.contact_type || existingPhone.contact_type;
        await prisma.tenantPhoneNumber.updateMany({
          where: {
            tenant_id: tenantId,
            contact_type: contactType,
            is_primary: true,
            tenant_phone_number_id: { not: phoneId },
            is_deleted: false
          },
          data: {
            is_primary: false,
            updated_by: requestingUser.id,
            updated_at: new Date(),
            updated_ip: ip || null
          }
        });
      }

      const updatedPhoneNumber = await prisma.tenantPhoneNumber.update({
        where: {
          tenant_phone_number_id: phoneId
        },
        data: updatePayload
      });

      return updatedPhoneNumber;
    }, {
      context: {
        tenantId,
        phoneId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Soft delete tenant phone number by ID
   * 
   * @param tenantId Tenant identifier
   * @param phoneId Phone number identifier
   * @param requestingUser User requesting the deletion
   * @param ip IP address for audit trail
   * @returns Success message
   */
  async deleteTenantPhoneNumber(
    tenantId: number,
    phoneId: number,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Deleting tenant phone number', {
        tenantId,
        phoneId,
        requestingUserId: requestingUser.id
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot delete phone number for another tenant');
      }

      // Verify phone number exists and belongs to the tenant
      const existingPhone = await prisma.tenantPhoneNumber.findFirst({
        where: {
          tenant_phone_number_id: phoneId,
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (!existingPhone) {
        throw new NotFoundError('Tenant phone number not found', 'TENANT_PHONE_NOT_FOUND');
      }

      // Soft delete by updating is_deleted flag
      await prisma.tenantPhoneNumber.update({
        where: {
          tenant_phone_number_id: phoneId
        },
        data: {
          is_deleted: true,
          is_active: false,
          deleted_at: new Date(),
          deleted_by: requestingUser.id,
          updated_by: requestingUser.id,
          updated_at: new Date(),
          updated_ip: ip || null
        }
      });

      return { message: 'Tenant phone number deleted successfully' };
    }, {
      context: {
        tenantId,
        phoneId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Create a new tenant email address
   * 
   * @param tenantId Tenant identifier
   * @param emailData Email address data
   * @param requestingUser User creating the email address
   * @param ip IP address for audit trail
   * @returns Newly created tenant email address
   */
  async createTenantEmailAddress(
    tenantId: number, 
    emailData: CreateTenantEmailAddressDto, 
    requestingUser: TokenPayload, 
    ip?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Creating tenant email address', {
        tenantId,
        requestingUserId: requestingUser.id
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot create email address for another tenant');
      }

      // Check for duplicate email address in this tenant
      const existingEmail = await prisma.tenantEmailAddress.findFirst({
        where: {
          tenant_id: tenantId,
          email_address: emailData.email_address,
          is_deleted: false
        }
      });

      if (existingEmail) {
        throw new ConflictError('Email address already exists for this tenant');
      }

      // If this is being set as primary, unset other primary emails for the same contact type
      if (emailData.is_primary) {
        await prisma.tenantEmailAddress.updateMany({
          where: {
            tenant_id: tenantId,
            contact_type: emailData.contact_type,
            is_primary: true,
            is_deleted: false
          },
          data: {
            is_primary: false,
            updated_by: requestingUser.id,
            updated_at: new Date(),
            updated_ip: ip || null
          }
        });
      }

      const newEmailAddress = await prisma.tenantEmailAddress.create({
        data: {
          tenant_id: tenantId,
          email_address: emailData.email_address,
          contact_type: emailData.contact_type || ContactType.PRIMARY,
          is_primary: emailData.is_primary || false,
          is_active: true,
          is_deleted: false,
          created_by: requestingUser.id,
          updated_by: requestingUser.id,
          created_ip: ip || null,
          updated_ip: ip || null
        }
      });

      return newEmailAddress;
    }, {
      context: {
        tenantId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Get all tenant email addresses with pagination and filtering
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the email addresses
   * @param params Extended pagination with filters
   * @returns List of tenant email addresses with pagination metadata
   */
  async getAllTenantEmailAddresses(
    tenantId: number,
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return tryCatch(async () => {
      logger.debug('Getting all tenant email addresses', {
        tenantId,
        requestingUserId: requestingUser.id,
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot access email addresses for another tenant');
      }

      // Convert filter params to structured DTO
      const filterDto = this.convertTenantEmailFiltersToDto(params.filters);
      
      // Build filters using the structured DTO
      const filters = this.buildTenantEmailFiltersFromDto(filterDto, tenantId);
      
      // Use pagination utilities to build sorting
      const sorting = this.buildTenantEmailSorting(params);
      
      // Get query options using pagination utilities
      const queryOptions = getPrismaQueryOptions(
        { page: params.page, limit: params.limit, skip: params.skip },
        sorting
      );

      // Execute queries using Promise.all for better performance
      const [emailAddresses, total] = await Promise.all([
        prisma.tenantEmailAddress.findMany({
          where: filters,
          ...queryOptions
        }),
        prisma.tenantEmailAddress.count({ where: filters })
      ]);

      return {
        items: emailAddresses,
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
      context: {
        tenantId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId },
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      }
    });
  }

  /**
   * Update tenant email address by ID
   * 
   * @param tenantId Tenant identifier
   * @param emailId Email address identifier
   * @param updateData Update data for the email address
   * @param requestingUser User requesting the update
   * @param ip IP address for audit trail
   * @returns Updated tenant email address
   */
  async updateTenantEmailAddress(
    tenantId: number,
    emailId: number,
    updateData: UpdateTenantEmailAddressDto,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Updating tenant email address', {
        tenantId,
        emailId,
        requestingUserId: requestingUser.id
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot update email address for another tenant');
      }

      // Verify email address exists and belongs to the tenant
      const existingEmail = await prisma.tenantEmailAddress.findFirst({
        where: {
          tenant_email_address_id: emailId,
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (!existingEmail) {
        throw new NotFoundError('Tenant email address not found', 'TENANT_EMAIL_NOT_FOUND');
      }

      // Build update data
      const updatePayload: any = {
        updated_by: requestingUser.id,
        updated_at: new Date(),
        updated_ip: ip || null
      };

      // Only include fields that are provided in the update data
      if (updateData.email_address !== undefined) updatePayload.email_address = updateData.email_address;
      if (updateData.contact_type !== undefined) updatePayload.contact_type = updateData.contact_type;
      if (updateData.is_primary !== undefined) updatePayload.is_primary = updateData.is_primary;

      // Check for duplicate email address if email is being updated
      if (updateData.email_address && updateData.email_address !== existingEmail.email_address) {
        const duplicateEmail = await prisma.tenantEmailAddress.findFirst({
          where: {
            tenant_id: tenantId,
            email_address: updateData.email_address,
            tenant_email_address_id: { not: emailId },
            is_deleted: false
          }
        });

        if (duplicateEmail) {
          throw new ConflictError('Email address already exists for this tenant');
        }
      }

      // If this is being set as primary, unset other primary emails for the same contact type
      if (updateData.is_primary === true) {
        const contactType = updateData.contact_type || existingEmail.contact_type;
        await prisma.tenantEmailAddress.updateMany({
          where: {
            tenant_id: tenantId,
            contact_type: contactType,
            is_primary: true,
            tenant_email_address_id: { not: emailId },
            is_deleted: false
          },
          data: {
            is_primary: false,
            updated_by: requestingUser.id,
            updated_at: new Date(),
            updated_ip: ip || null
          }
        });
      }

      const updatedEmailAddress = await prisma.tenantEmailAddress.update({
        where: {
          tenant_email_address_id: emailId
        },
        data: updatePayload
      });

      return updatedEmailAddress;
    }, {
      context: {
        tenantId,
        emailId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Soft delete tenant email address by ID
   * 
   * @param tenantId Tenant identifier
   * @param emailId Email address identifier
   * @param requestingUser User requesting the deletion
   * @param ip IP address for audit trail
   * @returns Success message
   */
  async deleteTenantEmailAddress(
    tenantId: number,
    emailId: number,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Deleting tenant email address', {
        tenantId,
        emailId,
        requestingUserId: requestingUser.id
      });

      // Verify tenant exists and user has access
      await this.getTenantById(tenantId, requestingUser);

      // Check access permissions for non-SUPER_ADMIN users
      if (requestingUser.user_type !== UserType.SUPER_ADMIN && tenantId !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot delete email address for another tenant');
      }

      // Verify email address exists and belongs to the tenant
      const existingEmail = await prisma.tenantEmailAddress.findFirst({
        where: {
          tenant_email_address_id: emailId,
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (!existingEmail) {
        throw new NotFoundError('Tenant email address not found', 'TENANT_EMAIL_NOT_FOUND');
      }

      // Soft delete by updating is_deleted flag
      await prisma.tenantEmailAddress.update({
        where: {
          tenant_email_address_id: emailId
        },
        data: {
          is_deleted: true,
          is_active: false,
          deleted_at: new Date(),
          deleted_by: requestingUser.id,
          updated_by: requestingUser.id,
          updated_at: new Date(),
          updated_ip: ip || null
        }
      });

      return { message: 'Tenant email address deleted successfully' };
    }, {
      context: {
        tenantId,
        emailId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Convert SafeFilterParams to structured tenant client DTO
   */
  private convertTenantClientFiltersToDto(filterParams: SafeFilterParams): TenantClientFilterDto {
    const dto: TenantClientFilterDto = {};
    
    if (filterParams['search'] && typeof filterParams['search'] === 'string') {
      dto.search = filterParams['search'];
    }
    
    if (filterParams['status'] && typeof filterParams['status'] === 'string') {
      dto.status = filterParams['status'];
    }
    
    return dto;
  }

  /**
   * Convert SafeFilterParams to structured tenant phone DTO
   */
  private convertTenantPhoneFiltersToDto(filterParams: SafeFilterParams): TenantPhoneFilterDto {
    const dto: TenantPhoneFilterDto = {};
    
    if (filterParams['contactType']) {
      dto.contactType = filterParams['contactType'] as ContactType;
    }

    if (filterParams['isPrimary'] !== undefined) {
      dto.isPrimary = filterParams['isPrimary'] === 'true' || filterParams['isPrimary'] === true;
    }
    
    return dto;
  }

  /**
   * Convert SafeFilterParams to structured tenant email DTO
   */
  private convertTenantEmailFiltersToDto(filterParams: SafeFilterParams): TenantEmailFilterDto {
    const dto: TenantEmailFilterDto = {};
    
    if (filterParams['contactType']) {
      dto.contactType = filterParams['contactType'] as ContactType;
    }

    if (filterParams['isPrimary'] !== undefined) {
      dto.isPrimary = filterParams['isPrimary'] === 'true' || filterParams['isPrimary'] === true;
    }
    
    return dto;
  }

  /**
   * Build Prisma filters from structured tenant client DTO
   */
  private buildTenantClientFiltersFromDto(filterDto: TenantClientFilterDto, tenantId: number): Record<string, any> {
    const where: Record<string, any> = {
      tenant_id: tenantId,
      is_deleted: false
    };

    if (filterDto.search) {
      where['OR'] = [
        {
          full_name: {
            contains: filterDto.search,
            mode: 'insensitive'
          }
        },
        {
          email_address: {
            contains: filterDto.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (filterDto.status) {
      where['client_status'] = filterDto.status;
    }

    return where;
  }

  /**
   * Build Prisma filters from structured tenant phone DTO
   */
  private buildTenantPhoneFiltersFromDto(filterDto: TenantPhoneFilterDto, tenantId: number): Record<string, any> {
    const where: Record<string, any> = {
      tenant_id: tenantId,
      is_deleted: false
    };

    if (filterDto.contactType) {
      where['contact_type'] = filterDto.contactType;
    }

    if (filterDto.isPrimary !== undefined) {
      where['is_primary'] = filterDto.isPrimary;
    }

    return where;
  }

  /**
   * Build Prisma filters from structured tenant email DTO
   */
  private buildTenantEmailFiltersFromDto(filterDto: TenantEmailFilterDto, tenantId: number): Record<string, any> {
    const where: Record<string, any> = {
      tenant_id: tenantId,
      is_deleted: false
    };

    if (filterDto.contactType) {
      where['contact_type'] = filterDto.contactType;
    }

    if (filterDto.isPrimary !== undefined) {
      where['is_primary'] = filterDto.isPrimary;
    }

    return where;
  }

  /**
   * Build Prisma sorting from pagination parameters for tenant clients
   */
  private buildTenantClientSorting(params: ExtendedPaginationWithFilters): Record<string, SortOrder> {
    const fieldMapping: Record<string, string> = {
      'clientId': 'client_id',
      'fullName': 'full_name',
      'emailAddress': 'email_address',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };

    if (params.sorting && Object.keys(params.sorting).length > 0) {
      const mappedSorting: Record<string, SortOrder> = {};
      Object.entries(params.sorting).forEach(([field, order]) => {
        const dbField = fieldMapping[field] || field;
        mappedSorting[dbField] = order;
      });
      return mappedSorting;
    }

    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    const dbField = fieldMapping[sortBy] || sortBy;
    
    return { [dbField]: sortOrder };
  }

  /**
   * Build Prisma sorting from pagination parameters for tenant phone numbers
   */
  private buildTenantPhoneSorting(params: ExtendedPaginationWithFilters): Record<string, SortOrder> {
    const fieldMapping: Record<string, string> = {
      'tenantPhoneNumberId': 'tenant_phone_number_id',
      'phoneNumber': 'phone_number',
      'contactType': 'contact_type',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };

    if (params.sorting && Object.keys(params.sorting).length > 0) {
      const mappedSorting: Record<string, SortOrder> = {};
      Object.entries(params.sorting).forEach(([field, order]) => {
        const dbField = fieldMapping[field] || field;
        mappedSorting[dbField] = order;
      });
      return mappedSorting;
    }

    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    const dbField = fieldMapping[sortBy] || sortBy;
    
    return { [dbField]: sortOrder };
  }

  /**
   * Build Prisma sorting from pagination parameters for tenant email addresses
   */
  private buildTenantEmailSorting(params: ExtendedPaginationWithFilters): Record<string, SortOrder> {
    const fieldMapping: Record<string, string> = {
      'tenantEmailAddressId': 'tenant_email_address_id',
      'emailAddress': 'email_address',
      'contactType': 'contact_type',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };

    if (params.sorting && Object.keys(params.sorting).length > 0) {
      const mappedSorting: Record<string, SortOrder> = {};
      Object.entries(params.sorting).forEach(([field, order]) => {
        const dbField = fieldMapping[field] || field;
        mappedSorting[dbField] = order;
      });
      return mappedSorting;
    }

    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    const dbField = fieldMapping[sortBy] || sortBy;
    
    return { [dbField]: sortOrder };
  }
}

/**
 * Export a singleton instance of TenantService
 */
export const tenantService = TenantService.getInstance();
export default tenantService;