/**
 * @file controllers/tenant.controller.ts
 * @description Controller for handling tenant management HTTP requests
 */

import { TenantService } from '@/services/tenant.service';
import { 
  CreateTenantDto, 
  UpdateTenantDto,
  CreateTenantPhoneNumberDto,
  CreateTenantEmailAddressDto,
  UpdateTenantPhoneNumberDto,
  UpdateTenantEmailAddressDto
} from '@/dtos/tenant/tenant.dto';
import { 
  createRouteHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler,
  ExtendedPaginationWithFilters,
  AuthenticatedRequest
} from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import logger from '@/config/logger';

// Initialize tenant service
const tenantService = new TenantService();

export class TenantController {
  // ==================== TENANT MANAGEMENT ====================

  /**
   * Create a new tenant
   * 
   * @route POST /api/v1/tenants
   * @access Private (SUPER_ADMIN only)
   */
  static createTenantHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const tenantData = req.validatedData as CreateTenantDto;
      const requestingUser = req.user;
      
      logger.debug('Creating tenant', {
        tenantName: tenantData.tenant_name,
        userId: requestingUser.id,
        role: requestingUser.role
      });
      
      return await tenantService.createTenant(
        tenantData, 
        requestingUser.id, 
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Tenant created successfully'
    }
  );

  /**
   * Get tenant by ID
   * 
   * @route GET /api/v1/tenants/:tenantId
   * @access Private (SUPER_ADMIN or own tenant)
   */
  static getTenantByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      return await tenantService.getTenantById(tenantId, requestingUser);
    },
    {
      message: 'Tenant retrieved successfully'
    }
  );

  /**
   * Get all tenants with pagination, sorting, and filtering
   * 
   * @route GET /api/v1/tenants
   * @access Private (SUPER_ADMIN or own tenant)
   */
  static getAllTenantsHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      // Call the service with the params directly - service now handles ExtendedPaginationWithFilters
      const result = await tenantService.getAllTenants(params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Tenants retrieved successfully'
    }
  );

  /**
   * Get all clients for a tenant
   * 
   * @route GET /api/v1/tenants/:tenantId/clients
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getTenantClientsHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Call the service with the params directly - service now handles ExtendedPaginationWithFilters
      const result = await tenantService.getTenantClients(tenantId, requestingUser, params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Tenant clients retrieved successfully'
    }
  );

  /**
   * Update tenant by ID
   * 
   * @route PATCH /api/v1/tenants/:tenantId
   * @access Private (SUPER_ADMIN or own tenant admin)
   */
  static updateTenantHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      const updateData = req.validatedData as UpdateTenantDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      return await tenantService.updateTenant(
        tenantId, 
        updateData, 
        requestingUser.id,
        req.ip || undefined
      );
    },
    {
      message: 'Tenant updated successfully'
    }
  );

  /**
   * Delete tenant by ID (soft delete)
   * 
   * @route DELETE /api/v1/tenants/:tenantId
   * @access Private (SUPER_ADMIN only)
   */
  static deleteTenantHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      await tenantService.deleteTenant(
        tenantId, 
        requestingUser.id, 
        req.ip || undefined
      );
    },
    {
      message: 'Tenant deleted successfully'
    }
  );

  // ==================== TENANT PHONE NUMBER MANAGEMENT ====================

  /**
   * Create a new tenant phone number
   * 
   * @route POST /api/v1/tenants/:tenantId/phone-numbers
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createTenantPhoneNumberHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      const phoneData = req.validatedData as CreateTenantPhoneNumberDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      return await tenantService.createTenantPhoneNumber(
        tenantId,
        phoneData, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Tenant phone number created successfully'
    }
  );

  /**
   * Get all tenant phone numbers
   * 
   * @route GET /api/v1/tenants/:tenantId/phone-numbers
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getAllTenantPhoneNumbersHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Call the service with the params directly - service now handles ExtendedPaginationWithFilters
      const result = await tenantService.getAllTenantPhoneNumbers(tenantId, requestingUser, params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Tenant phone numbers retrieved successfully'
    }
  );

  /**
   * Update tenant phone number
   * 
   * @route PATCH /api/v1/tenants/:tenantId/phone-numbers/:phoneNumberId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static updateTenantPhoneNumberHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      const phoneNumberIdParam = req.params['phoneNumberId'];
      
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      if (!phoneNumberIdParam) {
        throw new ApiError('Phone number ID is required', 400, 'MISSING_PHONE_NUMBER_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      const phoneNumberId = parseInt(phoneNumberIdParam, 10);
      
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }
      
      if (isNaN(phoneNumberId)) {
        throw new ApiError('Invalid phone number ID', 400, 'INVALID_PHONE_NUMBER_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const updateData = req.validatedData as UpdateTenantPhoneNumberDto;
      const requestingUser = req.user;
      
      logger.debug('Updating tenant phone number', {
        tenantId,
        phoneNumberId,
        userId: requestingUser.id,
        role: requestingUser.role
      });

      return await tenantService.updateTenantPhoneNumber(
        tenantId,
        phoneNumberId,
        updateData,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Tenant phone number updated successfully'
    }
  );

  /**
   * Delete tenant phone number
   * 
   * @route DELETE /api/v1/tenants/:tenantId/phone-numbers/:phoneNumberId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static deleteTenantPhoneNumberHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
      const tenantIdParam = req.params['tenantId'];
      const phoneNumberIdParam = req.params['phoneNumberId'];
      
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      if (!phoneNumberIdParam) {
        throw new ApiError('Phone number ID is required', 400, 'MISSING_PHONE_NUMBER_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      const phoneNumberId = parseInt(phoneNumberIdParam, 10);
      
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }
      
      if (isNaN(phoneNumberId)) {
        throw new ApiError('Invalid phone number ID', 400, 'INVALID_PHONE_NUMBER_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      logger.debug('Deleting tenant phone number', {
        tenantId,
        phoneNumberId,
        userId: requestingUser.id,
        role: requestingUser.role
      });

      await tenantService.deleteTenantPhoneNumber(
        tenantId,
        phoneNumberId,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Tenant phone number deleted successfully'
    }
  );

  // ==================== TENANT EMAIL ADDRESS MANAGEMENT ====================

  /**
   * Create a new tenant email address
   * 
   * @route POST /api/v1/tenants/:tenantId/email-addresses
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createTenantEmailAddressHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      const emailData = req.validatedData as CreateTenantEmailAddressDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      return await tenantService.createTenantEmailAddress(
        tenantId,
        emailData, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Tenant email address created successfully'
    }
  );

  /**
   * Get all tenant email addresses
   * 
   * @route GET /api/v1/tenants/:tenantId/email-addresses
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getAllTenantEmailAddressesHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Call the service with the params directly - service now handles ExtendedPaginationWithFilters
      const result = await tenantService.getAllTenantEmailAddresses(tenantId, requestingUser, params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Tenant email addresses retrieved successfully'
    }
  );

  /**
   * Update tenant email address
   * 
   * @route PATCH /api/v1/tenants/:tenantId/email-addresses/:emailAddressId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static updateTenantEmailAddressHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      const emailAddressIdParam = req.params['emailAddressId'];
      
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      if (!emailAddressIdParam) {
        throw new ApiError('Email address ID is required', 400, 'MISSING_EMAIL_ADDRESS_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      const emailAddressId = parseInt(emailAddressIdParam, 10);
      
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }
      
      if (isNaN(emailAddressId)) {
        throw new ApiError('Invalid email address ID', 400, 'INVALID_EMAIL_ADDRESS_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const updateData = req.validatedData as UpdateTenantEmailAddressDto;
      const requestingUser = req.user;
      
      logger.debug('Updating tenant email address', {
        tenantId,
        emailAddressId,
        userId: requestingUser.id,
        role: requestingUser.role
      });

      return await tenantService.updateTenantEmailAddress(
        tenantId,
        emailAddressId,
        updateData,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Tenant email address updated successfully'
    }
  );

  /**
   * Delete tenant email address
   * 
   * @route DELETE /api/v1/tenants/:tenantId/email-addresses/:emailAddressId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static deleteTenantEmailAddressHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
      const tenantIdParam = req.params['tenantId'];
      const emailAddressIdParam = req.params['emailAddressId'];
      
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      if (!emailAddressIdParam) {
        throw new ApiError('Email address ID is required', 400, 'MISSING_EMAIL_ADDRESS_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      const emailAddressId = parseInt(emailAddressIdParam, 10);
      
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }
      
      if (isNaN(emailAddressId)) {
        throw new ApiError('Invalid email address ID', 400, 'INVALID_EMAIL_ADDRESS_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      logger.debug('Deleting tenant email address', {
        tenantId,
        emailAddressId,
        userId: requestingUser.id,
        role: requestingUser.role
      });

      await tenantService.deleteTenantEmailAddress(
        tenantId,
        emailAddressId,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Tenant email address deleted successfully'
    }
  );
}

