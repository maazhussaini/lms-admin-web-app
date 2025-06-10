/**
 * @file services/client.service.ts
 * @description Service for managing clients and their tenant associations
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateClientDto,
  CreateClientTenantDto
} from '@/dtos/client/client.dto';
import { ApiError, NotFoundError, ConflictError, ForbiddenError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { 
  ClientStatus,
  UserType
} from '@/types/enums.js';
import logger from '@/config/logger';

// Initialize Prisma client
const prisma = new PrismaClient();

export class ClientService {
  /**
   * Create a new client
   * 
   * @param data Client data from validated DTO
   * @param requestingUser User requesting the client creation
   * @param ip IP address for audit trail
   * @returns Newly created client
   */
  async createClient(data: CreateClientDto, requestingUser: TokenPayload, ip?: string) {
    logger.debug('Creating client', {
      clientData: data,
      requestingUserId: requestingUser.id,
      requestingUserRole: requestingUser.user_type,
      requestingUserTenantId: requestingUser.tenantId
    });

    // Determine the target tenant ID
    let targetTenantId: number;
    
    if (requestingUser.user_type === UserType.SUPER_ADMIN) {
      // SUPER_ADMIN can create clients for any tenant using the provided tenant_id
      targetTenantId = data.tenant_id;
      
      // Verify the target tenant exists
      const targetTenant = await prisma.tenant.findFirst({
        where: {
          tenant_id: targetTenantId,
          is_deleted: false
        }
      });
      
      if (!targetTenant) {
        throw new ApiError('Target tenant not found', 404, 'TENANT_NOT_FOUND');
      }
    } else {
      // Non-SUPER_ADMIN users can only create clients for their own tenant
      if (data.tenant_id !== requestingUser.tenantId) {
        throw new ApiError('Cannot create client for another tenant', 403, 'FORBIDDEN');
      }
      targetTenantId = requestingUser.tenantId;
    }

    // Check if client with same email exists in the target tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        email_address: data.email_address,
        tenant_id: targetTenantId,
        is_deleted: false
      }
    });

    if (existingClient) {
      throw new ApiError('Client with this email already exists in this tenant', 409, 'DUPLICATE_CLIENT_EMAIL');
    }

    // Create new client
    const newClient = await prisma.client.create({
      data: {
        full_name: data.full_name,
        email_address: data.email_address,
        dial_code: data.dial_code || null,
        phone_number: data.phone_number || null,
        address: data.address || null,
        client_status: data.client_status || ClientStatus.ACTIVE,
        tenant_id: targetTenantId,
        is_active: true,
        is_deleted: false,
        created_by: requestingUser.id,
        updated_by: requestingUser.id,
        created_ip: ip || null,
        updated_ip: ip || null
      }
    });

    return newClient;
  }

  /**
   * Get client by ID
   * 
   * @param clientId Client identifier
   * @param requestingUser User requesting the client
   * @returns Client if found
   */
  async getClientById(clientId: number, requestingUser: TokenPayload) {
    logger.debug('Getting client by ID', {
      clientId,
      requestingUserId: requestingUser.id
    });

    // Super Admin can access any client
    if (requestingUser.user_type === UserType.SUPER_ADMIN) {
      const client = await prisma.client.findFirst({
        where: {
          client_id: clientId,
          is_deleted: false
        }
      });
      
      if (!client) {
        throw new ApiError('Client not found', 404, 'CLIENT_NOT_FOUND');
      }
      
      return client;
    }

    // Regular users can only access clients in their tenant
    const client = await prisma.client.findFirst({
      where: {
        client_id: clientId,
        tenant_id: requestingUser.tenantId,
        is_deleted: false
      }
    });

    if (!client) {
      throw new ApiError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    return client;
  }

  /**
   * Get all clients with pagination, sorting and filtering
   * 
   * @param requestingUser User requesting the clients list
   * @param options Pagination, sorting, and filtering options
   * @returns List response with clients and pagination metadata
   */
  async getAllClients(
    requestingUser: TokenPayload,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
      search?: string;
      tenantId?: number;
      status?: ClientStatus;
    } = {}
  ) {
    logger.debug('Getting all clients with options', {
      requestingUserId: requestingUser.id,
      requestingUserRole: requestingUser.user_type,
      options
    });

    // Set default pagination options
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause with tenant isolation
    let tenantId = requestingUser.tenantId;
    
    // SUPER_ADMIN can override tenant filter with query param
    if (requestingUser.user_type === UserType.SUPER_ADMIN && options.tenantId) {
      tenantId = options.tenantId;
    } else if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
      // Non-SUPER_ADMIN can only see clients in their tenant
      tenantId = requestingUser.tenantId;
    }

    const where: any = {
      is_deleted: false
    };
    
    // SUPER_ADMIN can view all clients if no tenantId specified
    if (requestingUser.user_type !== UserType.SUPER_ADMIN || options.tenantId) {
      where.tenant_id = tenantId;
    }

    // Add optional filters
    if (options.search) {
      where.OR = [
        {
          full_name: {
            contains: options.search,
            mode: 'insensitive'
          }
        },
        {
          email_address: {
            contains: options.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (options.status) {
      where.client_status = options.status;
    }

    // Determine sort field and direction
    const sortField = options.sortBy || 'created_at';
    const sortOrder = options.order || 'desc';

    // Execute queries using Promise.all for better performance
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.client.count({ where })
    ]);

    return {
      items: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Update client by ID
   * 
   * @param clientId Client identifier
   * @param updateData Update data for the client
   * @param requestingUser User requesting the update
   * @param ip IP address for audit trail
   * @returns Updated client
   */
  async updateClient(clientId: number, updateData: any, requestingUser: TokenPayload, ip?: string) {
    logger.debug('Updating client', {
      clientId,
      requestingUserId: requestingUser.id
    });

    // Verify client exists and user has access
    const existingClient = await this.getClientById(clientId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.user_type !== UserType.SUPER_ADMIN && existingClient.tenant_id !== requestingUser.tenantId) {
      throw new ForbiddenError('Cannot update client from another tenant');
    }

    // Build update data
    const updatePayload: any = {
      updated_by: requestingUser.id,
      updated_at: new Date(),
      updated_ip: ip || null
    };

    // Only include fields that are provided in the update data
    if (updateData.full_name !== undefined) updatePayload.full_name = updateData.full_name;
    if (updateData.email_address !== undefined) updatePayload.email_address = updateData.email_address;
    if (updateData.dial_code !== undefined) updatePayload.dial_code = updateData.dial_code;
    if (updateData.phone_number !== undefined) updatePayload.phone_number = updateData.phone_number;
    if (updateData.address !== undefined) updatePayload.address = updateData.address;
    if (updateData.client_status !== undefined) updatePayload.client_status = updateData.client_status;

    // Check for duplicate email if email is being updated
    if (updateData.email_address && updateData.email_address !== existingClient.email_address) {
      const duplicateClient = await prisma.client.findFirst({
        where: {
          email_address: updateData.email_address,
          tenant_id: existingClient.tenant_id,
          client_id: { not: clientId },
          is_deleted: false
        }
      });

      if (duplicateClient) {
        throw new ConflictError('Client with this email already exists in this tenant');
      }
    }

    const updatedClient = await prisma.client.update({
      where: {
        client_id: clientId
      },
      data: updatePayload
    });

    return updatedClient;
  }

  /**
   * Soft delete client by ID
   * 
   * @param clientId Client identifier
   * @param requestingUser User requesting the deletion
   * @param ip IP address for audit trail
   * @returns Success message
   */
  async deleteClient(clientId: number, requestingUser: TokenPayload, ip?: string) {
    logger.debug('Deleting client', {
      clientId,
      requestingUserId: requestingUser.id
    });

    // Verify client exists and user has access
    const existingClient = await this.getClientById(clientId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.user_type !== UserType.SUPER_ADMIN && existingClient.tenant_id !== requestingUser.tenantId) {
      throw new ForbiddenError('Cannot delete client from another tenant');
    }

    // Soft delete by updating is_deleted flag
    await prisma.client.update({
      where: {
        client_id: clientId
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

    return { message: 'Client deleted successfully' };
  }

  /**
   * Create a new client-tenant association
   * 
   * @param data Association data from validated DTO
   * @param requestingUser User creating the association
   * @param ip IP address for audit trail
   * @returns Newly created client-tenant association
   */
  async createClientTenantAssociation(
    data: CreateClientTenantDto,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    logger.debug('Creating client-tenant association', {
      clientId: data.client_id,
      tenantId: data.tenant_id,
      requestingUserId: requestingUser.id
    });

    // Verify client exists
    const client = await prisma.client.findFirst({
      where: {
        client_id: data.client_id,
        is_deleted: false
      }
    });

    if (!client) {
      throw new NotFoundError('Client not found', 'CLIENT_NOT_FOUND');
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findFirst({
      where: {
        tenant_id: data.tenant_id,
        is_deleted: false
      }
    });

    if (!tenant) {
      throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
    }

    // Check if association already exists
    const existingAssociation = await prisma.clientTenant.findFirst({
      where: {
        client_id: data.client_id,
        tenant_id: data.tenant_id,
        is_deleted: false
      }
    });

    if (existingAssociation) {
      throw new ConflictError(
        'Client-tenant association already exists',
        'DUPLICATE_CLIENT_TENANT_ASSOCIATION'
      );
    }

    // Check access permissions
    if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
      // Non-SUPER_ADMIN can only create associations for their own tenant
      if (client.tenant_id !== requestingUser.tenantId || data.tenant_id !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot create association for another tenant');
      }
    }

    // Create new association
    const newAssociation = await prisma.clientTenant.create({
      data: {
        client_id: data.client_id,
        tenant_id: data.tenant_id,
        is_active: true,
        is_deleted: false,
        created_by: requestingUser.id,
        updated_by: requestingUser.id,
        created_ip: ip || null,
        updated_ip: ip || null
      }
    });

    return newAssociation;
  }

  /**
   * Get all tenants associated with a client
   * 
   * @param clientId Client identifier
   * @param requestingUser User requesting the associations
   * @returns List of tenants associated with the client
   */
  async getClientTenants(clientId: number, requestingUser: TokenPayload) {
    logger.debug('Getting client tenants', {
      clientId,
      requestingUserId: requestingUser.id
    });

    // Verify client exists and user has access
    await this.getClientById(clientId, requestingUser);

    // Get all tenant associations for this client
    const associations = await prisma.clientTenant.findMany({
      where: {
        client_id: clientId,
        is_deleted: false,
        tenant: {
          is_deleted: false
        }
      },
      include: {
        tenant: true
      }
    });

    return associations
      .filter(assoc => assoc.tenant) // Filter out any null tenants
      .map(assoc => assoc.tenant);
  }

  /**
   * Remove client-tenant association
   * 
   * @param associationId Association identifier
   * @param requestingUser User performing the removal
   * @param ip IP address for audit trail
   * @returns Success message
   */
  async removeClientTenantAssociation(
    associationId: number,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    logger.debug('Removing client-tenant association', {
      associationId,
      requestingUserId: requestingUser.id
    });

    // Find the association
    const association = await prisma.clientTenant.findFirst({
      where: {
        client_tenant_id: associationId,
        is_deleted: false
      },
      include: {
        client: true,
        tenant: true
      }
    });

    if (!association) {
      throw new NotFoundError('Client-tenant association not found', 'ASSOCIATION_NOT_FOUND');
    }

    // Check access permissions
    if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
      // Non-SUPER_ADMIN can only remove associations for their own tenant
      if (association.tenant_id !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot remove association from another tenant');
      }
    }

    // Soft delete the association
    await prisma.clientTenant.update({
      where: {
        client_tenant_id: associationId
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

    return { message: 'Client-tenant association removed successfully' };
  }
}

/**
 * Export a singleton instance of ClientService
 */
export const clientService = new ClientService();
export default clientService;
