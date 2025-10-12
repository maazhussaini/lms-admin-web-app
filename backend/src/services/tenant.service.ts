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
import { getPrismaQueryOptions } from '@/utils/pagination.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { 
  TenantStatus,
  ContactType,
  UserType
} from '@/types/enums.types';
import logger from '@/config/logger';
import { BaseListService } from '@/utils/base-list.service';
import { BaseServiceConfig } from '@/utils/service.types';
import { 
  TENANT_FIELD_MAPPINGS, 
  CLIENT_FIELD_MAPPINGS,
  TENANT_PHONE_FIELD_MAPPINGS,
  TENANT_EMAIL_FIELD_MAPPINGS
} from '@/utils/field-mapping.utils';
import {
  convertFiltersToDto,
  buildSearchFilters,
  mergeFilters
} from '@/utils/filter-builders.utils';
import { buildSorting } from '@/utils/field-mapping.utils';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Configuration for Tenant service operations
 */
const TENANT_SERVICE_CONFIG: BaseServiceConfig = {
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
    return 'tenant';
  }

  /**
   * Include primary contact information for tenants
   */
  protected override getIncludeOptions(): Record<string, any> {
    return {
      include: {
        tenant_phone_numbers: {
          where: {
            is_active: true,
            is_deleted: false
          },
          orderBy: [
            { is_primary: 'desc' },
            { created_at: 'asc' }
          ],
          take: 1
        },
        tenant_email_addresses: {
          where: {
            is_active: true,
            is_deleted: false
          },
          orderBy: [
            { is_primary: 'desc' },
            { created_at: 'asc' }
          ],
          take: 1
        }
      }
    };
  }

  /**
   * Flatten primary contact info for easier consumption
   */
  protected override formatEntities(entities: any[]): any[] {
    return entities.map((tenant: any) => {
      const [primaryPhone] = tenant.tenant_phone_numbers ?? [];
      const [primaryEmail] = tenant.tenant_email_addresses ?? [];

      return {
        ...tenant,
        primary_phone_number: primaryPhone ?? null,
        primary_email_address: primaryEmail ?? null
      };
    });
  }

  /**
   * Build entity-specific filters
   */
  protected buildEntitySpecificFilters(_filters: TenantFilterDto): any {
    const whereClause: any = {
      // Only show non-deleted tenants by default
      is_deleted: false
    };

    // Add tenant-specific filters here if needed
    // For now, return base filter with is_deleted check
    
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

      // Build filters using modern utilities
      const filters = this.buildTenantClientFilters(tenantId, params);
      
      // Use modern sorting utilities
      const sorting = buildSorting(params, CLIENT_FIELD_MAPPINGS);
      
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

      // Use transaction for atomic operation
      const result = await prisma.$transaction(async (tx) => {
        // Update tenant basic information
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

        const updatedTenant = await tx.tenant.update({
          where: {
            tenant_id: tenantId
          },
          data: updateData
        });

        // Handle phone numbers with soft delete strategy
        if (data.phoneNumbers !== undefined) {
          // Soft delete all existing phone numbers
          await tx.tenantPhoneNumber.updateMany({
            where: {
              tenant_id: tenantId,
              deleted_at: null
            },
            data: {
              deleted_at: new Date(),
              deleted_by: userId
            }
          });

          // Insert new phone numbers
          if (data.phoneNumbers.length > 0) {
            await tx.tenantPhoneNumber.createMany({
              data: data.phoneNumbers.map(phone => ({
                tenant_id: tenantId,
                dial_code: phone.dial_code,
                phone_number: phone.phone_number,
                iso_country_code: phone.iso_country_code || null,
                is_primary: phone.is_primary,
                contact_type: phone.contact_type,
                created_by: userId,
                created_at: new Date(),
                created_ip: ip || null
              }))
            });
          }
        }

        // Handle email addresses with soft delete strategy
        if (data.emailAddresses !== undefined) {
          // Soft delete all existing email addresses
          await tx.tenantEmailAddress.updateMany({
            where: {
              tenant_id: tenantId,
              deleted_at: null
            },
            data: {
              deleted_at: new Date(),
              deleted_by: userId
            }
          });

          // Insert new email addresses
          if (data.emailAddresses.length > 0) {
            await tx.tenantEmailAddress.createMany({
              data: data.emailAddresses.map(email => ({
                tenant_id: tenantId,
                email_address: email.email_address,
                is_primary: email.is_primary,
                contact_type: email.contact_type,
                created_by: userId,
                created_at: new Date(),
                created_ip: ip || null
              }))
            });
          }
        }

        return updatedTenant;
      });
      
      return result;
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

      // Check if tenant exists (including soft-deleted ones)
      const existingTenant = await prisma.tenant.findUnique({
        where: {
          tenant_id: tenantId
        }
      });

      if (!existingTenant) {
        throw new NotFoundError('Tenant', tenantId.toString());
      }

      // If already deleted, return success (idempotent operation)
      if (existingTenant.is_deleted) {
        logger.info('Tenant is already deleted', { tenantId });
        return {
          message: 'Tenant is already deleted',
          tenantId
        };
      }

      // Soft delete by updating is_deleted flag
      const deletedTenant = await prisma.tenant.update({
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
      
      logger.info('Tenant deleted successfully', { tenantId });
      
      return deletedTenant;
      
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
      const filters = this.buildTenantPhoneFilters(tenantId, params);
      
      // Use modern sorting utilities
      const sorting = buildSorting(params, TENANT_PHONE_FIELD_MAPPINGS);
      
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
      const filters = this.buildTenantEmailFilters(tenantId, params);
      
      // Use modern sorting utilities
      const sorting = buildSorting(params, TENANT_EMAIL_FIELD_MAPPINGS);
      
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

  // ==================== MODERN UTILITY METHODS ====================
  
  /**
   * Build filters for tenant clients using modern utilities
   */
  private buildTenantClientFilters(
    tenantId: number,
    params: ExtendedPaginationWithFilters
  ): Record<string, any> {
    // Convert raw filter params to structured DTO
    const filterDto = convertFiltersToDto(params.filters, {
      stringFields: ['search'],
      booleanFields: [],
      numberFields: [],
      enumFields: {}
    });

    // Build base filters
    const baseFilters = {
      tenant_id: tenantId,
      is_deleted: false
    };

    // Build search filters
    const searchFilters = filterDto.search ? 
      buildSearchFilters(filterDto.search, ['full_name', 'email_address']) : {};

    // Build enum filters
    const enumFilters: Record<string, any> = {};
    const rawFilters = params.filters as any;
    if (rawFilters?.status) {
      enumFilters['client_status'] = rawFilters.status;
    }

    // Merge all filters
    return mergeFilters([baseFilters, searchFilters, enumFilters]);
  }

  /**
   * Build filters for tenant phone numbers using modern utilities
   */
  private buildTenantPhoneFilters(
    tenantId: number,
    params: ExtendedPaginationWithFilters
  ): Record<string, any> {
    // Build base filters
    const baseFilters = {
      tenant_id: tenantId,
      is_deleted: false
    };

    // Build specific filters
    const specificFilters: Record<string, any> = {};
    const rawFilters = params.filters as any;
    if (rawFilters?.contactType) {
      specificFilters['contact_type'] = rawFilters.contactType;
    }
    if (rawFilters?.isPrimary !== undefined) {
      specificFilters['is_primary'] = rawFilters.isPrimary;
    }

    // Merge all filters (spread the arguments, not pass as array)
    return mergeFilters(baseFilters, specificFilters);
  }

  /**
   * Build filters for tenant email addresses using modern utilities
   */
  private buildTenantEmailFilters(
    tenantId: number,
    params: ExtendedPaginationWithFilters
  ): Record<string, any> {
    // Build base filters
    const baseFilters = {
      tenant_id: tenantId,
      is_deleted: false
    };

    // Build specific filters
    const specificFilters: Record<string, any> = {};
    const rawFilters = params.filters as any;
    if (rawFilters?.contactType) {
      specificFilters['contact_type'] = rawFilters.contactType;
    }
    if (rawFilters?.isPrimary !== undefined) {
      specificFilters['is_primary'] = rawFilters.isPrimary;
    }

    // Merge all filters (spread the arguments, not pass as array)
    return mergeFilters(baseFilters, specificFilters);
  }

  // ==================== FILE UPLOAD METHODS ====================

  /**
   * Upload tenant light logo
   */
  async uploadLightLogo(
    tenantId: number,
    file: Express.Multer.File,
    requestingUser: TokenPayload
  ): Promise<string> {
    // Check tenant existence
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: tenantId, is_deleted: false }
    });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    // Authorization check
    if (requestingUser.role !== UserType.SUPER_ADMIN && 
        requestingUser.tenantId !== tenantId) {
      throw new ForbiddenError('Insufficient permissions to upload logo for this tenant');
    }

    // Import dynamically to avoid circular dependency
    const { uploadTenantLogo } = await import('@/utils/file-upload.utils');
    
    // Upload file to network share
    const logoPath = await uploadTenantLogo(file, tenantId, 'light');

    if (!logoPath) {
      throw new Error('Failed to upload logo');
    }

    // Update tenant record
    await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { logo_url_light: logoPath }
    });

    logger.info('Tenant light logo uploaded', {
      tenantId,
      logoPath,
      uploadedBy: requestingUser.id
    });

    return logoPath;
  }

  /**
   * Upload tenant dark logo
   */
  async uploadDarkLogo(
    tenantId: number,
    file: Express.Multer.File,
    requestingUser: TokenPayload
  ): Promise<string> {
    // Check tenant existence
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: tenantId, is_deleted: false }
    });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    // Authorization check
    if (requestingUser.role !== UserType.SUPER_ADMIN && 
        requestingUser.tenantId !== tenantId) {
      throw new ForbiddenError('Insufficient permissions to upload logo for this tenant');
    }

    // Import dynamically to avoid circular dependency
    const { uploadTenantLogo } = await import('@/utils/file-upload.utils');
    
    // Upload file to network share
    const logoPath = await uploadTenantLogo(file, tenantId, 'dark');

    if (!logoPath) {
      throw new Error('Failed to upload logo');
    }

    // Update tenant record
    await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { logo_url_dark: logoPath }
    });

    logger.info('Tenant dark logo uploaded', {
      tenantId,
      logoPath,
      uploadedBy: requestingUser.id
    });

    return logoPath;
  }

  /**
   * Upload tenant favicon
   */
  async uploadFavicon(
    tenantId: number,
    file: Express.Multer.File,
    requestingUser: TokenPayload
  ): Promise<string> {
    // Check tenant existence
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: tenantId, is_deleted: false }
    });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    // Authorization check
    if (requestingUser.role !== UserType.SUPER_ADMIN && 
        requestingUser.tenantId !== tenantId) {
      throw new ForbiddenError('Insufficient permissions to upload favicon for this tenant');
    }

    // Import dynamically to avoid circular dependency
    const { uploadTenantFavicon } = await import('@/utils/file-upload.utils');
    
    // Upload file to network share
    const faviconPath = await uploadTenantFavicon(file, tenantId);

    if (!faviconPath) {
      throw new Error('Failed to upload favicon');
    }

    // Update tenant record
    await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { favicon_url: faviconPath }
    });

    logger.info('Tenant favicon uploaded', {
      tenantId,
      faviconPath,
      uploadedBy: requestingUser.id
    });

    return faviconPath;
  }
}

/**
 * Export a singleton instance of TenantService
 */
export const tenantService = TenantService.getInstance();
export default tenantService;