/**
 * @file System User Service
 * @description Service for managing system users with tenant isolation and proper authorization
 */

import { PrismaClient } from '@prisma/client';
import { CreateSystemUserDto, UpdateSystemUserDto, SystemUserFilterDto } from '@/dtos/user/systemUser.dto.js';
import { SystemUser } from '@shared/types/system-users.types';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '@/utils/api-error.utils.js';
import { hashPassword } from '@/utils/password.utils.js';
import { getPrismaPagination } from '@/utils/pagination.utils.js';
import { tryCatch } from '@/utils/error-wrapper.utils.js';
import { SystemUserStatus } from '@shared/types/system-users.types';
import { 
  toPrismaSystemUserStatus,
  fromPrismaSystemUser,
} from '@/utils/enum-mapper.utils.js';

/**
 * System user role enumeration
 * @description Defines system-level roles with proper hierarchy
 */
export enum SystemUserRole {
  SUPERADMIN = 1,     // Global system administrator (no tenant)
  TENANT_ADMIN = 2,   // Tenant administrator
}

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
    requestingUser: SystemUser
  ): Promise<SystemUser> {
    return tryCatch(async () => {
      // Authorization checks
      if (requestingUser.role_id === SystemUserRole.TENANT_ADMIN) {
        // Tenant admins can only create users within their own tenant
        if (data.tenantId !== requestingUser.tenant_id) {
          throw new ForbiddenError('You can only create users within your own tenant');
        }

        // Tenant admins cannot create SUPER_ADMIN users
        if (data.role === SystemUserRole.SUPERADMIN) {
          throw new ForbiddenError('Tenant administrators cannot create super admin users');
        }
      }

      // Check uniqueness based on role
      const existingUser = await this.findExistingUser(data.username, data.email, data.role === SystemUserRole.SUPERADMIN ? null : data.tenantId || null);
      
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
          role_id: data.role,
          tenant_id: data.role === SystemUserRole.SUPERADMIN ? null : (data.tenantId || null),
          system_user_status: toPrismaSystemUserStatus(data.status || SystemUserStatus.ACTIVE),
          
          // Audit fields
          created_by: requestingUser.system_user_id,
          created_ip: '127.0.0.1', // This should be passed from the controller
          is_active: true,
          is_deleted: false
        }
      });

      return fromPrismaSystemUser(newUser);
    }, {
      context: {
        requestingUser: { id: requestingUser.system_user_id, role: requestingUser.role_id, tenantId: requestingUser.tenant_id }
      }
    });
  }

  /**
   * Get a system user by ID with proper authorization checks
   */
  async getSystemUserById(
    userId: number,
    requestingUser: SystemUser
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

      // Authorization check - TENANT_ADMIN can only view users in their tenant
      if (
        requestingUser.role_id === SystemUserRole.TENANT_ADMIN &&
        user.tenant_id !== requestingUser.tenant_id
      ) {
        throw new ForbiddenError('You cannot access users from another tenant');
      }

      return fromPrismaSystemUser(user);
    }, {
      context: {
        userId,
        requestingUser: { id: requestingUser.system_user_id, role: requestingUser.role_id, tenantId: requestingUser.tenant_id }
      }
    });
  }

  /**
   * Get all system users with pagination and filtering
   */
  async getAllSystemUsers(
    filter: SystemUserFilterDto = {},
    page = 1,
    limit = 10,
    requestingUser: SystemUser
  ): Promise<{ users: SystemUser[]; total: number }> {
    return tryCatch(async () => {
      // Base filter condition
      const where: any = {
        is_deleted: false
      };

      // Apply tenant isolation for TENANT_ADMIN
      if (requestingUser.role_id === SystemUserRole.TENANT_ADMIN) {
        where.tenant_id = requestingUser.tenant_id;
      } 
      // SuperAdmin can filter by tenant if they want
      else if (filter.tenantId !== undefined) {
        where.tenant_id = filter.tenantId;
      }

      // Apply additional filters
      if (filter.role !== undefined) {
        where.role_id = filter.role;
      }

      if (filter.status !== undefined) {
        where.system_user_status = toPrismaSystemUserStatus(filter.status);
      }

      // Apply search if provided
      if (filter.search) {
        where.OR = [
          { username: { contains: filter.search, mode: 'insensitive' } },
          { full_name: { contains: filter.search, mode: 'insensitive' } },
          { email_address: { contains: filter.search, mode: 'insensitive' } }
        ];
      }

      // Get pagination params
      const pagination = getPrismaPagination({ page, limit, skip: (page - 1) * limit });

      // Execute queries
      const [users, total] = await Promise.all([
        this.prisma.systemUser.findMany({
          where,
          ...pagination,
          orderBy: { created_at: 'desc' }
        }),
        this.prisma.systemUser.count({ where })
      ]);

      return { users: users.map(fromPrismaSystemUser), total };
    }, {
      context: {
        filter,
        page,
        limit,
        requestingUser: { id: requestingUser.system_user_id, role: requestingUser.role_id, tenantId: requestingUser.tenant_id }
      }
    });
  }

  /**
   * Update a system user with proper authorization checks
   */
  async updateSystemUser(
    userId: number,
    data: UpdateSystemUserDto,
    requestingUser: SystemUser
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
      if (requestingUser.role_id === SystemUserRole.TENANT_ADMIN) {
        // Tenant admin can only update users in their own tenant
        if (existingUser.tenant_id !== requestingUser.tenant_id) {
          throw new ForbiddenError('You cannot update users from another tenant');
        }

        // Tenant admin cannot update SUPER_ADMIN users
        if (existingUser.role_id === SystemUserRole.SUPERADMIN) {
          throw new ForbiddenError('Tenant administrators cannot update super admin users');
        }

        // Tenant admin cannot change a user's role to SUPER_ADMIN
        if (data.role === SystemUserRole.SUPERADMIN) {
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
      if (data.status !== undefined) updateData.system_user_status = toPrismaSystemUserStatus(data.status);
      
      // Handle password update if provided
      if (data.password) {
        updateData.password_hash = await hashPassword(data.password);
      }

      // Special handling for role changes (SUPER_ADMIN only)
      if (data.role !== undefined && requestingUser.role_id === SystemUserRole.SUPERADMIN) {
        updateData.role_id = data.role;
        
        // Handle tenant implications of role change
        if (data.role === SystemUserRole.SUPERADMIN && existingUser.tenant_id !== null) {
          // Changing to SUPER_ADMIN requires removing tenant association
          updateData.tenant_id = null;
        } 
        // Cannot change to TENANT_ADMIN without specifying a tenant (outside scope of this DTO)
        else if (data.role === SystemUserRole.TENANT_ADMIN && existingUser.tenant_id === null) {
          throw new BadRequestError('Cannot change to TENANT_ADMIN without specifying a tenant');
        }
      }

      // Update audit fields
      updateData.updated_by = requestingUser.system_user_id;
      updateData.updated_at = new Date();
      updateData.updated_ip = '127.0.0.1'; // This should be passed from the controller

      // Perform the update
      const updatedUser = await this.prisma.systemUser.update({
        where: { system_user_id: userId },
        data: updateData
      });

      return fromPrismaSystemUser(updatedUser);
    }, {
      context: {
        userId,
        requestingUser: { id: requestingUser.system_user_id, role: requestingUser.role_id, tenantId: requestingUser.tenant_id }
      }
    });
  }

  /**
   * Delete (soft-delete) a system user with proper authorization checks
   */
  async deleteSystemUser(
    userId: number,
    requestingUser: SystemUser
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
      if (requestingUser.role_id === SystemUserRole.TENANT_ADMIN) {
        // Tenant admin can only delete users in their own tenant
        if (existingUser.tenant_id !== requestingUser.tenant_id) {
          throw new ForbiddenError('You cannot delete users from another tenant');
        }

        // Tenant admin cannot delete SUPER_ADMIN users
        if (existingUser.role_id === SystemUserRole.SUPERADMIN) {
          throw new ForbiddenError('Tenant administrators cannot delete super admin users');
        }
      }

      // Prevent users from deleting themselves
      if (existingUser.system_user_id === requestingUser.system_user_id) {
        throw new BadRequestError('Users cannot delete their own account');
      }

      // Soft delete the user
      await this.prisma.systemUser.update({
        where: { system_user_id: userId },
        data: {
          is_deleted: true,
          is_active: false,
          deleted_at: new Date(),
          deleted_by: requestingUser.system_user_id
        }
      });
    }, {
      context: {
        userId,
        requestingUser: { id: requestingUser.system_user_id, role: requestingUser.role_id, tenantId: requestingUser.tenant_id }
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
    // For SuperAdmin (global uniqueness)
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
      return user ? fromPrismaSystemUser(user) : null;
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
      return user ? fromPrismaSystemUser(user) : null;
    }
  }
}

export default SystemUserService;
