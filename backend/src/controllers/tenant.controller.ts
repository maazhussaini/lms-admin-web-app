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

// Use singleton tenant service
const tenantService = TenantService.getInstance();

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
      
      console.log('=== CREATE TENANT CONTROLLER ===');
      console.log('req.files:', req.files);
      console.log('req.body:', req.body);
      
      // Parse phone_numbers and email_addresses from FormData JSON strings
      if (req.body.phone_numbers && typeof req.body.phone_numbers === 'string') {
        try {
          tenantData.phoneNumbers = JSON.parse(req.body.phone_numbers);
          console.log('Parsed phone numbers:', tenantData.phoneNumbers);
        } catch (error) {
          logger.warn('Failed to parse phone_numbers', { error });
        }
      }
      
      if (req.body.email_addresses && typeof req.body.email_addresses === 'string') {
        try {
          tenantData.emailAddresses = JSON.parse(req.body.email_addresses);
          console.log('Parsed email addresses:', tenantData.emailAddresses);
        } catch (error) {
          logger.warn('Failed to parse email_addresses', { error });
        }
      }
      
      // Add uploaded files to tenant data
      if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        console.log('Files object keys:', Object.keys(files));
        
        if (files['logo_light'] && files['logo_light'][0]) {
          console.log('Logo light file found:', files['logo_light'][0].originalname);
          tenantData.logo_light_file = files['logo_light'][0];
        }
        if (files['logo_dark'] && files['logo_dark'][0]) {
          console.log('Logo dark file found:', files['logo_dark'][0].originalname);
          tenantData.logo_dark_file = files['logo_dark'][0];
        }
        if (files['favicon'] && files['favicon'][0]) {
          console.log('Favicon file found:', files['favicon'][0].originalname);
          tenantData.favicon_file = files['favicon'][0];
        }
      } else {
        console.log('No files in request');
      }
      
      logger.debug('Creating tenant', {
        tenantName: tenantData.tenant_name,
        userId: requestingUser.id,
        role: requestingUser.role,
        hasLogoLight: !!tenantData.logo_light_file,
        hasLogoDark: !!tenantData.logo_dark_file,
        hasFavicon: !!tenantData.favicon_file,
        phoneNumbersCount: tenantData.phoneNumbers?.length || 0,
        emailAddressesCount: tenantData.emailAddresses?.length || 0
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

      const requestingUser = req.user;
      
      // Call the service with requestingUser and params
      const result = await tenantService.getAllTenants(requestingUser, params);
      
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
      
      // Parse phone_numbers and email_addresses from FormData JSON strings
      if (req.body.phone_numbers && typeof req.body.phone_numbers === 'string') {
        try {
          updateData.phoneNumbers = JSON.parse(req.body.phone_numbers);
        } catch (error) {
          logger.warn('Failed to parse phone_numbers', { error });
        }
      }
      
      if (req.body.email_addresses && typeof req.body.email_addresses === 'string') {
        try {
          updateData.emailAddresses = JSON.parse(req.body.email_addresses);
        } catch (error) {
          logger.warn('Failed to parse email_addresses', { error });
        }
      }
      
      // Add uploaded files to update data
      if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files['logo_light'] && files['logo_light'][0]) {
          updateData.logo_light_file = files['logo_light'][0];
        }
        if (files['logo_dark'] && files['logo_dark'][0]) {
          updateData.logo_dark_file = files['logo_dark'][0];
        }
        if (files['favicon'] && files['favicon'][0]) {
          updateData.favicon_file = files['favicon'][0];
        }
      }
      
      // Handle delete flags from request body
      if (req.body.delete_logo_light === 'true' || req.body.delete_logo_light === true) {
        updateData.delete_logo_light = true;
      }
      if (req.body.delete_logo_dark === 'true' || req.body.delete_logo_dark === true) {
        updateData.delete_logo_dark = true;
      }
      if (req.body.delete_favicon === 'true' || req.body.delete_favicon === true) {
        updateData.delete_favicon = true;
      }
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      logger.debug('Updating tenant', {
        tenantId,
        userId: requestingUser.id,
        hasLogoLight: !!updateData.logo_light_file,
        hasLogoDark: !!updateData.logo_dark_file,
        hasFavicon: !!updateData.favicon_file,
        deleteLogoLight: !!updateData.delete_logo_light,
        deleteLogoDark: !!updateData.delete_logo_dark,
        deleteFavicon: !!updateData.delete_favicon
      });
      
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

  // ==================== FILE UPLOAD HANDLERS ====================

  /**
   * Upload tenant light logo
   * 
   * @route POST /api/v1/tenants/:tenantId/upload-logo-light
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static uploadLightLogoHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.file) {
        throw new ApiError('Logo file is required', 400, 'MISSING_FILE');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      logger.debug('Uploading tenant light logo', {
        tenantId,
        userId: requestingUser.id,
        fileName: req.file.originalname
      });

      const logoPath = await tenantService.uploadLightLogo(
        tenantId,
        req.file,
        requestingUser
      );

      return {
        logoPath,
        message: 'Light logo uploaded successfully'
      };
    },
    {
      message: 'Light logo uploaded successfully'
    }
  );

  /**
   * Upload tenant dark logo
   * 
   * @route POST /api/v1/tenants/:tenantId/upload-logo-dark
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static uploadDarkLogoHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.file) {
        throw new ApiError('Logo file is required', 400, 'MISSING_FILE');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      logger.debug('Uploading tenant dark logo', {
        tenantId,
        userId: requestingUser.id,
        fileName: req.file.originalname
      });

      const logoPath = await tenantService.uploadDarkLogo(
        tenantId,
        req.file,
        requestingUser
      );

      return {
        logoPath,
        message: 'Dark logo uploaded successfully'
      };
    },
    {
      message: 'Dark logo uploaded successfully'
    }
  );

  /**
   * Upload tenant favicon
   * 
   * @route POST /api/v1/tenants/:tenantId/upload-favicon
   * @access Private (SUPER_ADMIN, TENANT_ADMIN for own tenant)
   */
  static uploadFaviconHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenantIdParam = req.params['tenantId'];
      
      if (!tenantIdParam) {
        throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
      }
      
      const tenantId = parseInt(tenantIdParam, 10);
      
      if (isNaN(tenantId)) {
        throw new ApiError('Invalid tenant ID', 400, 'INVALID_TENANT_ID');
      }

      if (!req.file) {
        throw new ApiError('Favicon file is required', 400, 'MISSING_FILE');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      logger.debug('Uploading tenant favicon', {
        tenantId,
        userId: requestingUser.id,
        fileName: req.file.originalname
      });

      const faviconPath = await tenantService.uploadFavicon(
        tenantId,
        req.file,
        requestingUser
      );

      return {
        faviconPath,
        message: 'Favicon uploaded successfully'
      };
    },
    {
      message: 'Favicon uploaded successfully'
    }
  );

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk activate tenants
   * 
   * @route POST /api/v1/tenants/bulk-activate
   * @access Private (SUPER_ADMIN only)
   */
  static bulkActivateTenantsHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const { tenant_ids } = req.validatedData as { tenant_ids: number[] };
      const requestingUser = req.user;

      logger.debug('Bulk activating tenants', {
        tenantIds: tenant_ids,
        userId: requestingUser.id
      });

      return await tenantService.bulkActivateTenants(
        tenant_ids,
        requestingUser.id,
        req.ip || undefined
      );
    },
    {
      message: 'Tenants activated successfully'
    }
  );

  /**
   * Bulk deactivate tenants
   * 
   * @route POST /api/v1/tenants/bulk-deactivate
   * @access Private (SUPER_ADMIN only)
   */
  static bulkDeactivateTenantsHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const { tenant_ids } = req.validatedData as { tenant_ids: number[] };
      const requestingUser = req.user;

      logger.debug('Bulk deactivating tenants', {
        tenantIds: tenant_ids,
        userId: requestingUser.id
      });

      return await tenantService.bulkDeactivateTenants(
        tenant_ids,
        requestingUser.id,
        req.ip || undefined
      );
    },
    {
      message: 'Tenants deactivated successfully'
    }
  );

  /**
   * Bulk delete tenants
   * 
   * @route POST /api/v1/tenants/bulk-delete
   * @access Private (SUPER_ADMIN only)
   */
  static bulkDeleteTenantsHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const { tenant_ids } = req.validatedData as { tenant_ids: number[] };
      const requestingUser = req.user;

      logger.debug('Bulk deleting tenants', {
        tenantIds: tenant_ids,
        userId: requestingUser.id
      });

      return await tenantService.bulkDeleteTenants(
        tenant_ids,
        requestingUser.id,
        req.ip || undefined
      );
    },
    {
      message: 'Tenants deleted successfully'
    }
  );
}

