/**
 * @file controllers/client.controller.ts
 * @description Controller for handling client management HTTP requests
 */

import { Request, Response } from 'express';
import { ClientService } from '@/services/client.service';
import { 
  CreateClientDto,
  UpdateClientDto,
  CreateClientTenantDto
} from '@/dtos/client/client.dto';
import { asyncHandler } from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import { getPaginationFromRequest, getSortParamsFromRequest } from '@/utils/pagination.utils';
import { TApiSuccessResponse } from '@shared/types/api.types';
import { TokenPayload } from '@/utils/jwt.utils';
import { ClientStatus } from '@/types/enums';

// Initialize client service
const clientService = new ClientService();

export class ClientController {
  // ==================== CLIENT MANAGEMENT ====================

  /**
   * Create a new client
   * 
   * @route POST /api/v1/clients
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createClientHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const clientData = req.body as CreateClientDto;
        
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;
      
      const client = await clientService.createClient(
        clientData, 
        requestingUser, 
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 201,
        message: 'Client created successfully',
        data: client,
        timestamp: new Date().toISOString()
      };
      
      return res.status(201).json(response);
    }
  );

  /**
   * Get client by ID
   * 
   * @route GET /api/v1/clients/:clientId
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getClientByIdHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const clientIdParam = req.params['clientId'];
      if (!clientIdParam) {
        throw new ApiError('Client ID is required', 400, 'MISSING_CLIENT_ID');
      }
      
      const clientId = parseInt(clientIdParam, 10);
      if (isNaN(clientId)) {
        throw new ApiError('Invalid client ID', 400, 'INVALID_CLIENT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;

      const client = await clientService.getClientById(clientId, requestingUser);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Client retrieved successfully',
        data: client,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Get all clients with pagination, sorting and filtering
   * 
   * @route GET /api/v1/clients
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getAllClientsHandler = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;

      const pagination = getPaginationFromRequest(req);
      const sortParams = getSortParamsFromRequest(
        req, 
        'created_at', 
        'desc', 
        ['client_id', 'full_name', 'email_address', 'client_status', 'created_at', 'updated_at']
      );
      const sortBy = Object.keys(sortParams)[0] || undefined;
      const order = Object.values(sortParams)[0] || undefined;
      
      const search = req.query['search'] as string | undefined;
      const tenantId = req.query['tenantId'] ? parseInt(req.query['tenantId'] as string, 10) : undefined;
      const statusParam = req.query['status'] as string | undefined;
      
      // Validate status parameter against ClientStatus enum values
      let status: ClientStatus | undefined;
      if (statusParam && Object.values(ClientStatus).includes(statusParam as ClientStatus)) {
        status = statusParam as ClientStatus;
      }
      
      const serviceParams: {
        page: number;
        limit: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
        search?: string;
        tenantId?: number;
        status?: ClientStatus;
      } = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (sortBy) serviceParams.sortBy = sortBy;
      if (order) serviceParams.order = order;
      if (search) serviceParams.search = search;
      if (tenantId !== undefined) serviceParams.tenantId = tenantId;
      if (status !== undefined) serviceParams.status = status;
      
      const result = await clientService.getAllClients(requestingUser, serviceParams);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Clients retrieved successfully',
        data: result.items,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json({
        ...response,
        pagination: result.pagination
      });
    }
  );

  /**
   * Update client by ID
   * 
   * @route PATCH /api/v1/clients/:clientId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static updateClientHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const clientIdParam = req.params['clientId'];
      if (!clientIdParam) {
        throw new ApiError('Client ID is required', 400, 'MISSING_CLIENT_ID');
      }
      
      const clientId = parseInt(clientIdParam, 10);
      if (isNaN(clientId)) {
        throw new ApiError('Invalid client ID', 400, 'INVALID_CLIENT_ID');
      }

      const updateData = req.body as UpdateClientDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;
      
      const updatedClient = await clientService.updateClient(
        clientId, 
        updateData, 
        requestingUser,
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Client updated successfully',
        data: updatedClient,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Delete client by ID (soft delete)
   * 
   * @route DELETE /api/v1/clients/:clientId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static deleteClientHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const clientIdParam = req.params['clientId'];
      if (!clientIdParam) {
        throw new ApiError('Client ID is required', 400, 'MISSING_CLIENT_ID');
      }
      
      const clientId = parseInt(clientIdParam, 10);
      if (isNaN(clientId)) {
        throw new ApiError('Invalid client ID', 400, 'INVALID_CLIENT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;

      const result = await clientService.deleteClient(
        clientId, 
        requestingUser, 
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: result.message,
        data: null,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  // ==================== CLIENT-TENANT ASSOCIATION MANAGEMENT ====================

  /**
   * Create a new client-tenant association
   * 
   * @route POST /api/v1/client-tenants
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createClientTenantAssociationHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const associationData = req.body as CreateClientTenantDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;
      
      const association = await clientService.createClientTenantAssociation(
        associationData, 
        requestingUser, 
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 201,
        message: 'Client-tenant association created successfully',
        data: association,
        timestamp: new Date().toISOString()
      };
      
      return res.status(201).json(response);
    }
  );

  /**
   * Get all tenants for a client
   * 
   * @route GET /api/v1/clients/:clientId/tenants
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getClientTenantsHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const clientIdParam = req.params['clientId'];
      if (!clientIdParam) {
        throw new ApiError('Client ID is required', 400, 'MISSING_CLIENT_ID');
      }
      
      const clientId = parseInt(clientIdParam, 10);
      if (isNaN(clientId)) {
        throw new ApiError('Invalid client ID', 400, 'INVALID_CLIENT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;

      const tenants = await clientService.getClientTenants(clientId, requestingUser);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Client tenants retrieved successfully',
        data: tenants,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Remove client-tenant association
   * 
   * @route DELETE /api/v1/client-tenants/:associationId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static removeClientTenantAssociationHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const associationIdParam = req.params['associationId'];
      if (!associationIdParam) {
        throw new ApiError('Association ID is required', 400, 'MISSING_ASSOCIATION_ID');
      }
      
      const associationId = parseInt(associationIdParam, 10);
      if (isNaN(associationId)) {
        throw new ApiError('Invalid association ID', 400, 'INVALID_ASSOCIATION_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user as TokenPayload;

      const result = await clientService.removeClientTenantAssociation(
        associationId, 
        requestingUser, 
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: result.message,
        data: null,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );
}
