/**
 * @file System User Service
 * @description Service for managing system users with tenant isolation and proper authorization
 */

import { PrismaClient } from '@prisma/client';
import { CreateSystemUserDto, UpdateSystemUserDto, SystemUserFilterDto } from '@/dtos/user/system-user.dto.js';
import { SystemUser } from '@shared/types/system-users.types';
import { TokenPayload } from '@/utils/jwt.utils.js';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '@/utils/api-error.utils.js';
import { hashPassword } from '@/utils/password.utils.js';
import { getPrismaQueryOptions, SortOrder } from '@/utils/pagination.utils.js';
import { tryCatch } from '@/utils/error-wrapper.utils.js';
import { ExtendedPaginationWithFilters, SafeFilterParams } from '@/utils/async-handler.utils.js';
import { UserType, SystemUserStatus } from '@/types/enums.js';

/**
 * System user service for managing system-level users
 */
export class SystemUserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new system user with proper authorization checks
   */
  async createSystemUser(
    data: CreateSystemUserDto,
    requestingUser: TokenPayload
  ): Promise<SystemUser> {
    return tryCatch(async () => {
      // Validate that we have a requesting user
      if (!requestingUser || !requestingUser.user_type) {
        throw new BadRequestError('Invalid requesting user context');
      }

      // Authorization checks
      if (requestingUser.user_type === UserType.TENANT_ADMIN) {
        // Tenant admins can only create users within their own tenant
        if (data.tenantId !== requestingUser.tenantId) {
          throw new ForbiddenError('You can only create users within your own tenant');
        }

        // Tenant admins cannot create SUPER_ADMIN users
        if (data.roleType === UserType.SUPER_ADMIN) {
          throw new ForbiddenError('Tenant administrators cannot create super admin users');
        }
      }

      // Validate role and tenant relationship
      if (data.roleType === UserType.SUPER_ADMIN && data.tenantId !== undefined && data.tenantId !== null) {
        throw new BadRequestError('SUPER_ADMIN users cannot be associated with a tenant');
      }

      if (data.roleType === UserType.TENANT_ADMIN && (!data.tenantId || data.tenantId === null)) {
        throw new BadRequestError('TENANT_ADMIN users must be associated with a tenant');
      }

      // Check uniqueness based on role
      const existingUser = await this.findExistingUser(
        data.username, 
        data.email, 
        data.roleType === UserType.SUPER_ADMIN ? null : data.tenantId || null
      );
      
      if (existingUser) {
        if (existingUser.username === data.username) {
          throw new ConflictError('Username already exists', 'USERNAME_EXISTS');
        } else {
          throw new ConflictError('Email already exists', 'EMAIL_EXISTS');
        }
      }

      // Hash the password
      const passwordHash = await hashPassword(data.password);

      // Create the system user
      const newUser = await this.prisma.systemUser.create({
        data: {
          username: data.username,
          full_name: data.fullName,
          email_address: data.email,
          password_hash: passwordHash,
          role_type: data.roleType,
          tenant_id: data.roleType === UserType.SUPER_ADMIN ? null : (data.tenantId || null),
          system_user_status: data.status || SystemUserStatus.ACTIVE,
          
          // Audit fields
          created_by: requestingUser.id,
          created_ip: '127.0.0.1', // This should be passed from the controller
          is_active: true,
          is_deleted: false
        }
      });

      return newUser as SystemUser;
    }, {
      context: {
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Get a system user by ID with proper authorization checks
   */
  async getSystemUserById(
    userId: number,
    requestingUser: TokenPayload
  ): Promise<SystemUser> {
    return tryCatch(async () => {
      const user = await this.prisma.systemUser.findUnique({
        where: {
          system_user_id: userId,
          is_deleted: false
        }
      });

      if (!user) {
        throw new NotFoundError(`System user with ID ${userId} not found`);
      }

      // Authorization check - TENANT_ADMIN can only view users in their own tenant
      if (
        requestingUser.user_type === UserType.TENANT_ADMIN &&
        user.tenant_id !== requestingUser.tenantId
      ) {
        throw new ForbiddenError('You cannot access users from another tenant');
      }

      return user as SystemUser;
    }, {
      context: {
        userId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Get all system users with pagination and filtering (updated to use DTOs properly)
   */
  async getAllSystemUsers(
    params: ExtendedPaginationWithFilters,
    requestingUser: TokenPayload
  ): Promise<{ users: SystemUser[]; total: number }> {
    return tryCatch(async () => {
      // Convert filter params to structured DTO
      const filterDto = this.convertFiltersToDto(params.filters);
      
      // Build filters using the structured DTO
      const filters = this.buildSystemUserFiltersFromDto(filterDto, requestingUser);
      
      // Use pagination utilities to build sorting
      const sorting = this.buildSystemUserSorting(params);
      
      // Get query options using pagination utilities
      const queryOptions = getPrismaQueryOptions(
        { page: params.page, limit: params.limit, skip: params.skip },
        sorting
      );

      // Execute queries
      const [users, total] = await Promise.all([
        this.prisma.systemUser.findMany({
          where: filters,
          ...queryOptions
        }),
        this.prisma.systemUser.count({ where: filters })
      ]);

      return { users: users as SystemUser[], total };
    }, {
      context: {
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        },
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Convert SafeFilterParams to structured DTO
   * This bridges the gap between async handler extraction and service layer
   */
  private convertFiltersToDto(filterParams: SafeFilterParams): SystemUserFilterDto {
    const dto: SystemUserFilterDto = {};
    
    // Only include validated filter properties
    if (filterParams['roleType'] && typeof filterParams['roleType'] === 'string') {
      dto.roleType = filterParams['roleType'] as UserType;
    }
    
    if (filterParams['status'] && typeof filterParams['status'] === 'string') {
      dto.status = filterParams['status'] as SystemUserStatus;
    }
    
    if (filterParams['tenantId']) {
      dto.tenantId = typeof filterParams['tenantId'] === 'number' 
        ? filterParams['tenantId'] 
        : parseInt(filterParams['tenantId'] as string, 10);
    }
    
    if (filterParams['search'] && typeof filterParams['search'] === 'string') {
      dto.search = filterParams['search'];
    }
    
    return dto;
  }

  /**
   * Build Prisma filters from structured DTO with proper validation
   * Centralizes filter logic and tenant isolation using DTOs
   * 
   * @future Extract to shared QueryBuilder utility when similar 
   * filtering logic appears in 3+ services
   */
  private buildSystemUserFiltersFromDto(
    filterDto: SystemUserFilterDto,
    requestingUser: TokenPayload
  ): Record<string, any> {
    // Base filter condition
    const where: Record<string, any> = {
      is_deleted: false
    };

    // Apply tenant isolation for TENANT_ADMIN
    if (requestingUser.user_type === UserType.TENANT_ADMIN) {
      where['tenant_id'] = requestingUser.tenantId;
    } 
    // SUPER_ADMIN can filter by tenant if specified
    else if (filterDto.tenantId !== undefined) {
      where['tenant_id'] = filterDto.tenantId;
    }

    // Apply filters using validated DTO properties
    if (filterDto.roleType !== undefined) {
      where['role_type'] = filterDto.roleType;
    }

    if (filterDto.status !== undefined) {
      where['system_user_status'] = filterDto.status;
    }

    // Apply search filter
    if (filterDto.search !== undefined && filterDto.search.trim().length > 0) {
      const searchTerm = filterDto.search.trim();
      where['OR'] = [
        { username: { contains: searchTerm, mode: 'insensitive' } },
        { full_name: { contains: searchTerm, mode: 'insensitive' } },
        { email_address: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    return where;
  }

  /**
   * Build Prisma sorting from pagination parameters
   * Centralizes field mapping logic
   * 
   * @future Extract field mappings to constants/field-mappings.ts
   * when supporting multiple entity types
   */
  private buildSystemUserSorting(params: ExtendedPaginationWithFilters): Record<string, SortOrder> {
    // Field mapping from API names to database column names
    const fieldMapping: Record<string, string> = {
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'fullName': 'full_name',
      'email': 'email_address',
      'roleType': 'role_type',
      'status': 'system_user_status',
      'tenantId': 'tenant_id',
      'username': 'username'
    };

    // Use existing sorting if available
    if (params.sorting && Object.keys(params.sorting).length > 0) {
      const mappedSorting: Record<string, SortOrder> = {};
      Object.entries(params.sorting).forEach(([field, order]) => {
        const dbField = fieldMapping[field] || field;
        mappedSorting[dbField] = order;
      });
      return mappedSorting;
    }

    // Fallback to individual sort parameters
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    const dbField = fieldMapping[sortBy] || sortBy;
    
    return { [dbField]: sortOrder };
  }

  /**
   * Update a system user with proper authorization checks
   */
  async updateSystemUser(
    userId: number,
    data: UpdateSystemUserDto,
    requestingUser: TokenPayload
  ): Promise<SystemUser> {
    return tryCatch(async () => {
      // Find the user to update
      const existingUser = await this.prisma.systemUser.findUnique({
        where: {
          system_user_id: userId,
          is_deleted: false
        }
      });

      if (!existingUser) {
        throw new NotFoundError(`System user with ID ${userId} not found`);
      }

      // Authorization checks
      if (requestingUser.user_type === UserType.TENANT_ADMIN) {
        // Tenant admin can only update users in their own tenant
        if (existingUser.tenant_id !== requestingUser.tenantId) {
          throw new ForbiddenError('You cannot update users from another tenant');
        }

        // Tenant admin cannot update SUPER_ADMIN users
        if (existingUser.role_type === UserType.SUPER_ADMIN) {
          throw new ForbiddenError('Tenant administrators cannot update super admin users');
        }

        // Tenant admin cannot change a user's role to SUPER_ADMIN
        if (data.roleType === UserType.SUPER_ADMIN) {
          throw new ForbiddenError('Tenant administrators cannot assign super admin role');
        }
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existingUser.email_address) {
        const emailExists = await this.prisma.systemUser.findFirst({
          where: {
            email_address: data.email,
            tenant_id: existingUser.tenant_id,
            is_deleted: false,
            system_user_id: { not: userId }
          }
        });

        if (emailExists) {
          throw new ConflictError('Email already exists', 'EMAIL_EXISTS');
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.email !== undefined) updateData.email_address = data.email;
      if (data.status !== undefined) updateData.system_user_status = data.status;
      
      // Handle password update if provided
      if (data.password) {
        updateData.password_hash = await hashPassword(data.password);
      }

      // Special handling for role changes (SUPER_ADMIN only)
      if (data.roleType !== undefined && requestingUser.user_type === UserType.SUPER_ADMIN) {
        updateData.role_type = data.roleType;
        
        // Handle tenant implications of role change
        if (data.roleType === UserType.SUPER_ADMIN && existingUser.tenant_id !== null) {
          // Changing to SUPER_ADMIN requires removing tenant association
          updateData.tenant_id = null;
        } 
        // Cannot change to TENANT_ADMIN without specifying a tenant (outside scope of this DTO)
        else if (data.roleType === UserType.TENANT_ADMIN && existingUser.tenant_id === null) {
          throw new BadRequestError('Cannot change to TENANT_ADMIN without specifying a tenant');
        }
      }

      // Update audit fields
      updateData.updated_by = requestingUser.id;
      updateData.updated_at = new Date();
      updateData.updated_ip = '127.0.0.1'; // This should be passed from the controller

      // Perform the update
      const updatedUser = await this.prisma.systemUser.update({
        where: { system_user_id: userId },
        data: updateData
      });

      return updatedUser as SystemUser;
    }, {
      context: {
        userId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Delete (soft-delete) a system user with proper authorization checks
   */
  async deleteSystemUser(
    userId: number,
    requestingUser: TokenPayload
  ): Promise<void> {
    return tryCatch(async () => {
      // Find the user to delete
      const existingUser = await this.prisma.systemUser.findUnique({
        where: {
          system_user_id: userId,
          is_deleted: false
        }
      });

      if (!existingUser) {
        throw new NotFoundError(`System user with ID ${userId} not found`);
      }

      // Authorization checks
      if (requestingUser.user_type === UserType.TENANT_ADMIN) {
        // Tenant admin can only delete users in their own tenant
        if (existingUser.tenant_id !== requestingUser.tenantId) {
          throw new ForbiddenError('You cannot delete users from another tenant');
        }

        // Tenant admin cannot delete SUPER_ADMIN users
        if (existingUser.role_type === UserType.SUPER_ADMIN) {
          throw new ForbiddenError('Tenant administrators cannot delete super admin users');
        }
      }

      // Prevent users from deleting themselves
      if (existingUser.system_user_id === requestingUser.id) {
        throw new BadRequestError('Users cannot delete their own account');
      }

      // Soft delete the user
      await this.prisma.systemUser.update({
        where: { system_user_id: userId },
        data: {
          is_deleted: true,
          is_active: false,
          deleted_at: new Date(),
          deleted_by: requestingUser.id
        }
      });
    }, {
      context: {
        userId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Helper method to check for existing users with the same username or email
   * Scope is global for SUPER_ADMIN, tenant-specific for TENANT_ADMIN
   */
  private async findExistingUser(
    username: string,
    email: string,
    tenantId: number | null
  ): Promise<SystemUser | null> {
    // For SUPER_ADMIN (global uniqueness)
    if (tenantId === null) {
      const user = await this.prisma.systemUser.findFirst({
        where: {
          OR: [
            { username, tenant_id: null },
            { email_address: email, tenant_id: null }
          ],
          is_deleted: false
        }
      });
      return user as SystemUser | null;
    } 
    // For TenantAdmin (tenant-scoped uniqueness)
    else {
      const user = await this.prisma.systemUser.findFirst({
        where: {
          OR: [
            { username, tenant_id: tenantId },
            { email_address: email, tenant_id: tenantId }
          ],
          is_deleted: false
        }
      });
      return user as SystemUser | null;
    }
  }
}

export default SystemUserService;
