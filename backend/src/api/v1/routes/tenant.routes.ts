/**
 * @file api/v1/routes/tenant.routes.ts
 * @description Tenant management routes with comprehensive CRUD operations
 */

import { Router } from 'express';
import { TenantController } from '@/controllers/tenant.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  CreateTenantDto, 
  UpdateTenantDto,
  CreateClientDto,
  UpdateClientDto,
  CreateTenantPhoneNumberDto,
  UpdateTenantPhoneNumberDto,
  CreateTenantEmailAddressDto,
  UpdateTenantEmailAddressDto,
  CreateClientTenantDto
} from '@/dtos/tenant/tenant.dto';
import { param, query } from 'express-validator';

const router = Router();

// ==================== TENANT MANAGEMENT ROUTES ====================

/**
 * @route POST /api/v1/tenants
 * @description Create a new tenant
 * @access Private (SUPER_ADMIN only)
 */
router.post(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN']),
  validate(CreateTenantDto.validate()),
  TenantController.createTenantHandler
);

/**
 * @route GET /api/v1/tenants
 * @description Get all tenants with pagination and filtering
 * @access Private (SUPER_ADMIN or own tenant)
 */
router.get(
  '/',
  authenticate,
  validate([
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Search term cannot exceed 255 characters'),
    query('status')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Status must be a valid tenant status (1-5)'),
    query('sortBy')
      .optional()
      .isIn(['tenant_id', 'tenant_name', 'tenant_status', 'created_at', 'updated_at'])
      .withMessage('Invalid sort field'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc')
  ]),
  TenantController.getAllTenantsHandler
);

/**
 * @route GET /api/v1/tenants/:tenantId
 * @description Get tenant by ID
 * @access Private (SUPER_ADMIN or own tenant)
 */
router.get(
  '/:tenantId',
  authenticate,
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
  ]),
  TenantController.getTenantByIdHandler
);

/**
 * @route PATCH /api/v1/tenants/:tenantId
 * @description Update tenant by ID
 * @access Private (SUPER_ADMIN or tenant admin)
 */
router.patch(
  '/:tenantId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    ...UpdateTenantDto.validate()
  ]),
  TenantController.updateTenantHandler
);

/**
 * @route DELETE /api/v1/tenants/:tenantId
 * @description Delete tenant by ID (soft delete)
 * @access Private (SUPER_ADMIN only)
 */
router.delete(
  '/:tenantId',
  authenticate,
  authorize(['SUPER_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
  ]),
  TenantController.deleteTenantHandler
);

// ==================== CLIENT MANAGEMENT ROUTES ====================

/**
 * @route POST /api/v1/clients
 * @description Create a new client
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/clients',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate(CreateClientDto.validate()),
  TenantController.createClientHandler
);

/**
 * @route GET /api/v1/clients
 * @description Get all clients with pagination and filtering
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/clients',
  authenticate,
  validate([
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Search term cannot exceed 255 characters'),
    query('tenantId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    query('status')
      .optional()
      .isInt({ min: 1, max: 4 })
      .withMessage('Status must be a valid client status (1-4)'),
    query('sortBy')
      .optional()
      .isIn(['client_id', 'full_name', 'email_address', 'client_status', 'created_at', 'updated_at'])
      .withMessage('Invalid sort field'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc')
  ]),
  TenantController.getAllClientsHandler
);

/**
 * @route GET /api/v1/clients/:clientId
 * @description Get client by ID
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/clients/:clientId',
  authenticate,
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
  ]),
  TenantController.getClientByIdHandler
);

/**
 * @route PATCH /api/v1/clients/:clientId
 * @description Update client by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/clients/:clientId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer'),
    ...UpdateClientDto.validate()
  ]),
  TenantController.updateClientHandler
);

/**
 * @route DELETE /api/v1/clients/:clientId
 * @description Delete client by ID (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/clients/:clientId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
  ]),
  TenantController.deleteClientHandler
);

// ==================== TENANT CONTACT INFORMATION ROUTES ====================

/**
 * @route POST /api/v1/tenants/:tenantId/phone-numbers
 * @description Create a new tenant phone number
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/:tenantId/phone-numbers',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    ...CreateTenantPhoneNumberDto.validate()
  ]),
  TenantController.createTenantPhoneNumberHandler
);

/**
 * @route GET /api/v1/tenants/:tenantId/phone-numbers
 * @description Get all tenant phone numbers
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/:tenantId/phone-numbers',
  authenticate,
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    query('contactType')
      .optional()
      .isInt({ min: 1, max: 4 })
      .withMessage('Contact type must be a valid type (1-4)'),
    query('isPrimary')
      .optional()
      .isBoolean()
      .withMessage('isPrimary must be a boolean')
  ]),
  TenantController.getAllTenantPhoneNumbersHandler
);

/**
 * @route PATCH /api/v1/tenants/:tenantId/phone-numbers/:phoneNumberId
 * @description Update tenant phone number by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:tenantId/phone-numbers/:phoneNumberId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    param('phoneNumberId')
      .isInt({ min: 1 })
      .withMessage('Phone number ID must be a positive integer'),
    ...UpdateTenantPhoneNumberDto.validate()
  ]),
  TenantController.updateTenantPhoneNumberHandler
);

/**
 * @route DELETE /api/v1/tenants/:tenantId/phone-numbers/:phoneNumberId
 * @description Delete tenant phone number by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:tenantId/phone-numbers/:phoneNumberId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    param('phoneNumberId')
      .isInt({ min: 1 })
      .withMessage('Phone number ID must be a positive integer')
  ]),
  TenantController.deleteTenantPhoneNumberHandler
);

/**
 * @route POST /api/v1/tenants/:tenantId/email-addresses
 * @description Create a new tenant email address
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/:tenantId/email-addresses',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    ...CreateTenantEmailAddressDto.validate()
  ]),
  TenantController.createTenantEmailAddressHandler
);

/**
 * @route GET /api/v1/tenants/:tenantId/email-addresses
 * @description Get all tenant email addresses
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/:tenantId/email-addresses',
  authenticate,
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    query('contactType')
      .optional()
      .isInt({ min: 1, max: 4 })
      .withMessage('Contact type must be a valid type (1-4)'),
    query('isPrimary')
      .optional()
      .isBoolean()
      .withMessage('isPrimary must be a boolean')
  ]),
  TenantController.getAllTenantEmailAddressesHandler
);

/**
 * @route PATCH /api/v1/tenants/:tenantId/email-addresses/:emailAddressId
 * @description Update tenant email address by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:tenantId/email-addresses/:emailAddressId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    param('emailAddressId')
      .isInt({ min: 1 })
      .withMessage('Email address ID must be a positive integer'),
    ...UpdateTenantEmailAddressDto.validate()
  ]),
  TenantController.updateTenantEmailAddressHandler
);

/**
 * @route DELETE /api/v1/tenants/:tenantId/email-addresses/:emailAddressId
 * @description Delete tenant email address by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:tenantId/email-addresses/:emailAddressId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer'),
    param('emailAddressId')
      .isInt({ min: 1 })
      .withMessage('Email address ID must be a positive integer')
  ]),
  TenantController.deleteTenantEmailAddressHandler
);

// ==================== CLIENT-TENANT ASSOCIATION ROUTES ====================

/**
 * @route POST /api/v1/client-tenants
 * @description Create a new client-tenant association
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/client-tenants',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate(CreateClientTenantDto.validate()),
  TenantController.createClientTenantAssociationHandler
);

/**
 * @route GET /api/v1/clients/:clientId/tenants
 * @description Get all tenants for a client
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/clients/:clientId/tenants',
  authenticate,
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
  ]),
  TenantController.getClientTenantsHandler
);

/**
 * @route GET /api/v1/tenants/:tenantId/clients
 * @description Get all clients for a tenant
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/:tenantId/clients',
  authenticate,
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
  ]),
  TenantController.getTenantClientsHandler
);

/**
 * @route DELETE /api/v1/client-tenants/:associationId
 * @description Remove client-tenant association
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/client-tenants/:associationId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('associationId')
      .isInt({ min: 1 })
      .withMessage('Association ID must be a positive integer')
  ]),
  TenantController.removeClientTenantAssociationHandler
);

export default router;
