/**
 * @file services/tenant.service.ts
 * @description Service for managing tenants, clients, and their associations
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateTenantDto,
  UpdateTenantDto,
  CreateClientDto,
  CreateClientTenantDto
} from '@/dtos/tenant/tenant.dto';
import { ApiError, NotFoundError, ConflictError, ForbiddenError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { 
  toPrismaTenantStatus, 
  toPrismaClientStatus,
  ClientStatus,
  TenantStatus
} from '@/utils/enum-mapper.utils';
import logger from '@/config/logger';

// Initialize Prisma client
const prisma = new PrismaClient();

export class TenantService {
  /**
   * Create a new tenant
   * 
   * @param data Tenant data from validated DTO
   * @param userId System user ID for audit trail
   * @param ip IP address of the request
   * @returns Newly created tenant
   */
  async createTenant(data: CreateTenantDto, userId: number, ip?: string) {
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
      throw new ApiError('Tenant with this name already exists', 409, 'DUPLICATE_TENANT_NAME');
    }    // Create new tenant
    const newTenant = await prisma.tenant.create({
      data: {
        tenant_name: data.tenant_name,
        logo_url_light: data.logo_url_light || null,
        logo_url_dark: data.logo_url_dark || null,
        favicon_url: data.favicon_url || null,        
        ...(data.theme && { theme: data.theme }),
        tenant_status: data.tenant_status ? toPrismaTenantStatus(data.tenant_status) : toPrismaTenantStatus(TenantStatus.ACTIVE),
        is_active: true,
        is_deleted: false,
        created_by: userId,
        updated_by: userId,
        created_ip: ip || null,
        updated_ip: ip || null
      }
    });

    return newTenant;
  }
    /**
   * Get tenant by ID
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the tenant
   * @returns Tenant if found
   */
  async getTenantById(tenantId: number, requestingUser: TokenPayload) {
    logger.debug('Getting tenant by ID', {
      tenantId,
      requestingUserId: requestingUser.id
    });

    // Super Admin can access any tenant
    if (requestingUser.role === 'SUPER_ADMIN') {
      const tenant = await prisma.tenant.findFirst({
        where: {
          tenant_id: tenantId,
          is_deleted: false
        }
      });
      
      if (!tenant) {
        throw new ApiError('Tenant not found', 404, 'TENANT_NOT_FOUND');
      }
      
      return tenant;
    }

    // Regular users can only access their own tenant
    if (requestingUser.tenantId !== tenantId) {
      throw new ApiError('Access denied to this tenant', 403, 'FORBIDDEN');
    }

    return await prisma.tenant.findFirst({
      where: {
        tenant_id: tenantId,
        is_deleted: false
      }
    });
  }
  
  /**
   * Get all tenants with pagination, sorting and filtering
   * 
   * @param options Pagination, sorting, and filtering options
   * @returns List response with tenants and pagination metadata
   */
  async getAllTenants(
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
      search?: string;
      status?: number;
    } = {}
  ) {
    logger.debug('Getting all tenants with options', {
      options
    });

    // Set default pagination options
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      is_deleted: false
    };
    
    // Add optional filters
    if (options.search) {
      where.tenant_name = {
        contains: options.search,
        mode: 'insensitive'
      };
    }

    if (options.status) {
      where.tenant_status = options.status;
    }

    // Determine sort field and direction
    const sortField = options.sortBy || 'created_at';
    const sortOrder = options.order || 'desc';

    // Execute queries using Promise.all for better performance
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.tenant.count({ where })
    ]);

    return {
      items: tenants,
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
   * Update tenant by ID
   * 
   * @param tenantId Tenant identifier
   * @param data Update data from validated DTO
   * @param userId System user ID for audit trail
   * @param ip IP address of the request
   * @returns Updated tenant
   */
  async updateTenant(tenantId: number, data: UpdateTenantDto, userId: number, ip?: string) {
    logger.debug('Updating tenant', {
      tenantId,
      userId
    });    // Verify tenant exists
    await this.getTenantById(tenantId, { id: userId, email: 'system@admin.com', role: 'SUPER_ADMIN', tenantId });    // Update tenant
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
    if (data.tenant_status !== undefined) updateData.tenant_status = toPrismaTenantStatus(data.tenant_status);

    const updatedTenant = await prisma.tenant.update({
      where: {
        tenant_id: tenantId
      },
      data: updateData
    });
    
    return updatedTenant;
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
    logger.debug('Deleting tenant', {
      tenantId,
      userId
    });

    // Verify tenant exists
    await this.getTenantById(tenantId, { id: userId, email: 'system@admin.com', role: 'SUPER_ADMIN', tenantId });

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
    
    return { message: 'Tenant deleted successfully' };
  }
  
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
      requestingUserId: requestingUser.id
    });

    // Check if client with same email exists in this tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        email_address: data.email_address,
        tenant_id: requestingUser.tenantId,
        is_deleted: false
      }
    });

    if (existingClient) {
      throw new ApiError('Client with this email already exists', 409, 'DUPLICATE_CLIENT_EMAIL');
    }

    // Create new client
    const newClient = await prisma.client.create({
      data: {
        full_name: data.full_name,
        email_address: data.email_address,
        dial_code: data.dial_code || null,
        phone_number: data.phone_number || null,
        address: data.address || null,
        client_status: data.client_status ? toPrismaClientStatus(data.client_status) : toPrismaClientStatus(ClientStatus.ACTIVE),
        tenant_id: requestingUser.tenantId,
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
    if (requestingUser.role === 'SUPER_ADMIN') {
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
    }    // Regular users can only access their own client
    if (requestingUser.tenantId !== clientId) {
      throw new ApiError('Access denied to this client', 403, 'FORBIDDEN');
    }

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
  
  /**
   * Get all clients with pagination, sorting and filtering
   * 
   * @param requestingUser User requesting the clients list
   * @param options Pagination, sorting, and filtering options
   * @returns List response with clients and pagination metadata
   */  async getAllClients(
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
      requestingUserRole: requestingUser.role,
      options
    });

    // Set default pagination options
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause with tenant isolation
    let tenantId = requestingUser.tenantId;
    
    // SUPER_ADMIN can override tenant filter with query param
    if (requestingUser.role === 'SUPER_ADMIN' && options.tenantId) {
      tenantId = options.tenantId;
    } else if (requestingUser.role !== 'SUPER_ADMIN') {
      // Non-SUPER_ADMIN can only see clients in their tenant
      tenantId = requestingUser.tenantId;
    }

    const where: any = {
      is_deleted: false
    };
    
    // SUPER_ADMIN can view all clients if no tenantId specified
    if (requestingUser.role !== 'SUPER_ADMIN' || options.tenantId) {
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
   * Create a new client-tenant association
   * 
   * @param data Association data from validated DTO
   * @param requestingUser User creating the association
   * @param ip IP address for audit trail
   * @returns Newly created client-tenant association
   */  async createClientTenantAssociation(
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
    if (requestingUser.role !== 'SUPER_ADMIN') {
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
    });    // Verify client exists and user has access
    await this.getClientById(clientId, requestingUser);    // Get all tenant associations for this client
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
   * Get all clients associated with a tenant
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the associations
   * @returns List of clients associated with the tenant
   */
  async getTenantClients(tenantId: number, requestingUser: TokenPayload) {
    logger.debug('Getting tenant clients', {
      tenantId,
      requestingUserId: requestingUser.id
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);    // Get all client associations for this tenant
    const associations = await prisma.clientTenant.findMany({
      where: {
        tenant_id: tenantId,
        is_deleted: false,
        client: {
          is_deleted: false
        }
      },
      include: {
        client: true
      }
    });

    return associations
      .filter(assoc => assoc.client) // Filter out any null clients
      .map(assoc => assoc.client);
  }

  /**
   * Remove client-tenant association
   * 
   * @param associationId Association identifier
   * @param requestingUser User performing the removal
   * @param ip IP address for audit trail
   * @returns Success message
   */  async removeClientTenantAssociation(
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
    if (requestingUser.role !== 'SUPER_ADMIN') {
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
    if (requestingUser.role !== 'SUPER_ADMIN' && existingClient.tenant_id !== requestingUser.tenantId) {
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
    if (updateData.client_status !== undefined) updatePayload.client_status = toPrismaClientStatus(updateData.client_status);

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
    if (requestingUser.role !== 'SUPER_ADMIN' && existingClient.tenant_id !== requestingUser.tenantId) {
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
   * Create a new tenant phone number
   * 
   * @param tenantId Tenant identifier
   * @param phoneData Phone number data
   * @param requestingUser User creating the phone number
   * @param ip IP address for audit trail
   * @returns Newly created tenant phone number
   */
  async createTenantPhoneNumber(tenantId: number, phoneData: any, requestingUser: TokenPayload, ip?: string) {
    logger.debug('Creating tenant phone number', {
      tenantId,
      requestingUserId: requestingUser.id
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
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

    const newPhoneNumber = await prisma.tenantPhoneNumber.create({
      data: {
        tenant_id: tenantId,
        dial_code: phoneData.dial_code,
        phone_number: phoneData.phone_number,
        contact_type: phoneData.contact_type || 1, // ContactType.PRIMARY
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
  }

  /**
   * Get all tenant phone numbers with pagination and filtering
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the phone numbers
   * @param options Pagination and filtering options
   * @returns List of tenant phone numbers with pagination metadata
   */
  async getAllTenantPhoneNumbers(
    tenantId: number,
    requestingUser: TokenPayload,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
      phoneType?: string;
    } = {}
  ) {
    logger.debug('Getting all tenant phone numbers', {
      tenantId,
      requestingUserId: requestingUser.id,
      options
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
      throw new ForbiddenError('Cannot access phone numbers for another tenant');
    }

    // Set default pagination options
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenant_id: tenantId,
      is_deleted: false
    };

    if (options.phoneType) {
      where.contact_type = options.phoneType;
    }

    // Determine sort field and direction
    const sortField = options.sortBy || 'created_at';
    const sortOrder = options.order || 'desc';

    // Execute queries using Promise.all for better performance
    const [phoneNumbers, total] = await Promise.all([
      prisma.tenantPhoneNumber.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.tenantPhoneNumber.count({ where })
    ]);

    return {
      items: phoneNumbers,
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
    updateData: any,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    logger.debug('Updating tenant phone number', {
      tenantId,
      phoneId,
      requestingUserId: requestingUser.id
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
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

    const updatedPhoneNumber = await prisma.tenantPhoneNumber.update({
      where: {
        tenant_phone_number_id: phoneId
      },
      data: updatePayload
    });

    return updatedPhoneNumber;
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
    logger.debug('Deleting tenant phone number', {
      tenantId,
      phoneId,
      requestingUserId: requestingUser.id
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
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
  async createTenantEmailAddress(tenantId: number, emailData: any, requestingUser: TokenPayload, ip?: string) {
    logger.debug('Creating tenant email address', {
      tenantId,
      requestingUserId: requestingUser.id
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
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

    const newEmailAddress = await prisma.tenantEmailAddress.create({
      data: {
        tenant_id: tenantId,
        email_address: emailData.email_address,
        contact_type: emailData.contact_type || 1, // ContactType.PRIMARY
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
  }

  /**
   * Get all tenant email addresses with pagination and filtering
   * 
   * @param tenantId Tenant identifier
   * @param requestingUser User requesting the email addresses
   * @param options Pagination and filtering options
   * @returns List of tenant email addresses with pagination metadata
   */
  async getAllTenantEmailAddresses(
    tenantId: number,
    requestingUser: TokenPayload,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
      emailType?: string;
    } = {}
  ) {
    logger.debug('Getting all tenant email addresses', {
      tenantId,
      requestingUserId: requestingUser.id,
      options
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
      throw new ForbiddenError('Cannot access email addresses for another tenant');
    }

    // Set default pagination options
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenant_id: tenantId,
      is_deleted: false
    };

    if (options.emailType) {
      where.contact_type = options.emailType;
    }

    // Determine sort field and direction
    const sortField = options.sortBy || 'created_at';
    const sortOrder = options.order || 'desc';

    // Execute queries using Promise.all for better performance
    const [emailAddresses, total] = await Promise.all([
      prisma.tenantEmailAddress.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.tenantEmailAddress.count({ where })
    ]);

    return {
      items: emailAddresses,
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
    updateData: any,
    requestingUser: TokenPayload,
    ip?: string
  ) {
    logger.debug('Updating tenant email address', {
      tenantId,
      emailId,
      requestingUserId: requestingUser.id
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
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

    const updatedEmailAddress = await prisma.tenantEmailAddress.update({
      where: {
        tenant_email_address_id: emailId
      },
      data: updatePayload
    });

    return updatedEmailAddress;
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
    logger.debug('Deleting tenant email address', {
      tenantId,
      emailId,
      requestingUserId: requestingUser.id
    });

    // Verify tenant exists and user has access
    await this.getTenantById(tenantId, requestingUser);

    // Check access permissions for non-SUPER_ADMIN users
    if (requestingUser.role !== 'SUPER_ADMIN' && tenantId !== requestingUser.tenantId) {
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
  }
}

/**
 * Export a singleton instance of TenantService
 */
export const tenantService = new TenantService();
export default tenantService;