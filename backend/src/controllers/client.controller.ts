/**
 * @file controllers/client.controller.ts
 * @description Controller for handling client management HTTP requests
 */

import { ClientService } from '@/services/client.service';
import { 
  CreateClientDto,
  UpdateClientDto,
  CreateClientTenantDto
} from '@/dtos/client/client.dto';
import { 
  createRouteHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler,
  ExtendedPaginationWithFilters,
  AuthenticatedRequest
} from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';

// Use singleton client service
const clientService = ClientService.getInstance();

export class ClientController {
  // ==================== CLIENT MANAGEMENT ====================

  /**
   * Create a new client
   * 
   * @route POST /api/v1/clients
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createClientHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const clientData = req.validatedData as CreateClientDto;
      const requestingUser = req.user;
      
      return await clientService.createClient(
        clientData, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Client created successfully'
    }
  );

  /**
   * Get client by ID
   * 
   * @route GET /api/v1/clients/:clientId
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getClientByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
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

      const requestingUser = req.user;

      return await clientService.getClientById(clientId, requestingUser);
    },
    {
      message: 'Client retrieved successfully'
    }
  );

  /**
   * Get all clients with pagination, sorting and filtering
   * 
   * @route GET /api/v1/clients
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getAllClientsHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Call the service with the params directly - service now handles ExtendedPaginationWithFilters
      const result = await clientService.getAllClients(requestingUser, params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Clients retrieved successfully'
    }
  );

  /**
   * Update client by ID
   * 
   * @route PATCH /api/v1/clients/:clientId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static updateClientHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const clientIdParam = req.params['clientId'];
      if (!clientIdParam) {
        throw new ApiError('Client ID is required', 400, 'MISSING_CLIENT_ID');
      }
      
      const clientId = parseInt(clientIdParam, 10);
      if (isNaN(clientId)) {
        throw new ApiError('Invalid client ID', 400, 'INVALID_CLIENT_ID');
      }

      const updateData = req.validatedData as UpdateClientDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      return await clientService.updateClient(
        clientId, 
        updateData, 
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Client updated successfully'
    }
  );

  /**
   * Delete client by ID (soft delete)
   * 
   * @route DELETE /api/v1/clients/:clientId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static deleteClientHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
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

      const requestingUser = req.user;

      await clientService.deleteClient(
        clientId, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      message: 'Client deleted successfully'
    }
  );

  // ==================== CLIENT-TENANT ASSOCIATION MANAGEMENT ====================

  /**
   * Create a new client-tenant association
   * 
   * @route POST /api/v1/client-tenants
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createClientTenantAssociationHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const associationData = req.validatedData as CreateClientTenantDto;
      const requestingUser = req.user;
      
      return await clientService.createClientTenantAssociation(
        associationData, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Client-tenant association created successfully'
    }
  );

  /**
   * Get all tenants for a client
   * 
   * @route GET /api/v1/clients/:clientId/tenants
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getClientTenantsHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
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

      const requestingUser = req.user;

      return await clientService.getClientTenants(clientId, requestingUser);
    },
    {
      message: 'Client tenants retrieved successfully'
    }
  );

  /**
   * Remove client-tenant association
   * 
   * @route DELETE /api/v1/client-tenants/:associationId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static removeClientTenantAssociationHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
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

      const requestingUser = req.user;

      await clientService.removeClientTenantAssociation(
        associationId, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      message: 'Client-tenant association removed successfully'
    }
  );
}
