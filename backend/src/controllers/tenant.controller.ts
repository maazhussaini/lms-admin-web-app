/**
 * @file controllers/tenant.controller.ts
 * @description Controller for handling tenant management HTTP requests
 */

import { Request, Response } from 'express';
import { TenantService } from '@/services/tenant.service';
import { 
  CreateTenantDto, 
  UpdateTenantDto,
  CreateTenantPhoneNumberDto,
  CreateTenantEmailAddressDto,
  UpdateTenantPhoneNumberDto,
  UpdateTenantEmailAddressDto
} from '@/dtos/tenant/tenant.dto';
import { asyncHandler } from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import { getPaginationFromRequest, getSortParamsFromRequest } from '@/utils/pagination.utils';
import { TApiSuccessResponse } from '@shared/types/api.types';
import logger from '@/config/logger';

/**
 * Extended Request interface with authenticated user data
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    tenantId: number;
    permissions?: string[];
    [key: string]: any;
  };
}

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
  static createTenantHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const tenantData = req.body as CreateTenantDto;
      
      logger.debug('Creating tenant', {
        tenantName: tenantData.tenant_name,
        userId: req.user?.id,
        role: req.user?.role
      });
      
      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      const userId = req.user.id;
      
      const tenant = await tenantService.createTenant(
        tenantData, 
        userId, 
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 201,
        message: 'Tenant created successfully',
        data: tenant,
        timestamp: new Date().toISOString()
      };
      
      return res.status(201).json(response);
    }
  );

  /**
   * Get tenant by ID
   * 
   * @route GET /api/v1/tenants/:tenantId
   * @access Private (SUPER_ADMIN or own tenant)
   */
  static getTenantByIdHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };

      const tenant = await tenantService.getTenantById(tenantId, requestingUser);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenant retrieved successfully',
        data: tenant,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Get all tenants with pagination, sorting, and filtering
   * 
   * @route GET /api/v1/tenants
   * @access Private (SUPER_ADMIN or own tenant)
   */
  static getAllTenantsHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const pagination = getPaginationFromRequest(req);
      const sortParams = getSortParamsFromRequest(
        req,
        'created_at',
        'desc',
        ['tenant_id', 'tenant_name', 'tenant_status', 'created_at', 'updated_at']
      );
      const sortBy = Object.keys(sortParams)[0] || undefined;
      const order = Object.values(sortParams)[0] || undefined;
      
      const search = req.query['search'] as string | undefined;
      const status = req.query['status'] ? parseInt(req.query['status'] as string, 10) : undefined;
        const serviceParams: {
        page: number;
        limit: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
        search?: string;
        status?: number;
      } = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (sortBy) serviceParams.sortBy = sortBy;
      if (order) serviceParams.order = order;
      if (search) serviceParams.search = search;
      if (status !== undefined) serviceParams.status = status;
      
      const result = await tenantService.getAllTenants(serviceParams);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenants retrieved successfully',
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
   * Get all clients for a tenant
   * 
   * @route GET /api/v1/tenants/:tenantId/clients
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getTenantClientsHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };

      const clients = await tenantService.getTenantClients(tenantId, requestingUser);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenant clients retrieved successfully',
        data: clients,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Update tenant by ID
   * 
   * @route PATCH /api/v1/tenants/:tenantId
   * @access Private (SUPER_ADMIN or own tenant admin)
   */
  static updateTenantHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      const updateData = req.body as UpdateTenantDto;
        if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };
        const updatedTenant = await tenantService.updateTenant(
        tenantId, 
        updateData, 
        requestingUser.id,
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenant updated successfully',
        data: updatedTenant,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Delete tenant by ID (soft delete)
   * 
   * @route DELETE /api/v1/tenants/:tenantId
   * @access Private (SUPER_ADMIN only)
   */
  static deleteTenantHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };      const result = await tenantService.deleteTenant(
        tenantId, 
        requestingUser.id, 
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

  // ==================== TENANT PHONE NUMBER MANAGEMENT ====================

  /**
   * Create a new tenant phone number
   * 
   * @route POST /api/v1/tenants/:tenantId/phone-numbers
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createTenantPhoneNumberHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      const phoneData = req.body as CreateTenantPhoneNumberDto;
      
      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };
      
      const phoneNumber = await tenantService.createTenantPhoneNumber(
        tenantId,
        phoneData, 
        requestingUser, 
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 201,
        message: 'Tenant phone number created successfully',
        data: phoneNumber,
        timestamp: new Date().toISOString()
      };
      
      return res.status(201).json(response);
    }
  );

  /**
   * Get all tenant phone numbers
   * 
   * @route GET /api/v1/tenants/:tenantId/phone-numbers
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getAllTenantPhoneNumbersHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };      const contactType = req.query['contactType'] ? parseInt(req.query['contactType'] as string, 10) : undefined;

      const options: any = {};
      if (contactType !== undefined) {
        options.phoneType = contactType.toString();
      }

      const phoneNumbers = await tenantService.getAllTenantPhoneNumbers(tenantId, requestingUser, options);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenant phone numbers retrieved successfully',
        data: phoneNumbers,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Update tenant phone number
   * 
   * @route PATCH /api/v1/tenants/:tenantId/phone-numbers/:phoneNumberId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static updateTenantPhoneNumberHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const updateData = req.body as UpdateTenantPhoneNumberDto;
      
      logger.debug('Updating tenant phone number', {
        tenantId,
        phoneNumberId,
        userId: req.user.id,
        role: req.user.role
      });

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };

      const updatedPhoneNumber = await tenantService.updateTenantPhoneNumber(
        tenantId,
        phoneNumberId,
        updateData,
        requestingUser,
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenant phone number updated successfully',
        data: updatedPhoneNumber,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Delete tenant phone number
   * 
   * @route DELETE /api/v1/tenants/:tenantId/phone-numbers/:phoneNumberId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static deleteTenantPhoneNumberHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      logger.debug('Deleting tenant phone number', {
        tenantId,
        phoneNumberId,
        userId: req.user.id,
        role: req.user.role
      });

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };

      const result = await tenantService.deleteTenantPhoneNumber(
        tenantId,
        phoneNumberId,
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

  // ==================== TENANT EMAIL ADDRESS MANAGEMENT ====================

  /**
   * Create a new tenant email address
   * 
   * @route POST /api/v1/tenants/:tenantId/email-addresses
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createTenantEmailAddressHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const tenantIdParam = req.params['tenantId'];
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      const emailData = req.body as CreateTenantEmailAddressDto;
      
      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };
      
      const emailAddress = await tenantService.createTenantEmailAddress(
        tenantId,
        emailData, 
        requestingUser, 
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 201,
        message: 'Tenant email address created successfully',
        data: emailAddress,
        timestamp: new Date().toISOString()
      };
      
      return res.status(201).json(response);
    }
  );

  /**
   * Get all tenant email addresses
   * 
   * @route GET /api/v1/tenants/:tenantId/email-addresses
   * @access Private (SUPER_ADMIN or same tenant)
   */
  static getAllTenantEmailAddressesHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };      const contactType = req.query['contactType'] ? parseInt(req.query['contactType'] as string, 10) : undefined;

      const options: any = {};
      if (contactType !== undefined) {
        options.emailType = contactType.toString();
      }

      const emailAddresses = await tenantService.getAllTenantEmailAddresses(tenantId, requestingUser, options);
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenant email addresses retrieved successfully',
        data: emailAddresses,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Update tenant email address
   * 
   * @route PATCH /api/v1/tenants/:tenantId/email-addresses/:emailAddressId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static updateTenantEmailAddressHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const updateData = req.body as UpdateTenantEmailAddressDto;
      
      logger.debug('Updating tenant email address', {
        tenantId,
        emailAddressId,
        userId: req.user.id,
        role: req.user.role
      });

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };

      const updatedEmailAddress = await tenantService.updateTenantEmailAddress(
        tenantId,
        emailAddressId,
        updateData,
        requestingUser,
        req.ip || undefined
      );
      
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Tenant email address updated successfully',
        data: updatedEmailAddress,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );

  /**
   * Delete tenant email address
   * 
   * @route DELETE /api/v1/tenants/:tenantId/email-addresses/:emailAddressId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static deleteTenantEmailAddressHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
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

      if (!req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      logger.debug('Deleting tenant email address', {
        tenantId,
        emailAddressId,
        userId: req.user.id,
        role: req.user.role
      });

      const requestingUser = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      };

      const result = await tenantService.deleteTenantEmailAddress(
        tenantId,
        emailAddressId,
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

