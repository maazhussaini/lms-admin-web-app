/**
 * @file api/v1/routes/tenant.routes.ts
 * @description Tenant management routes with comprehensive CRUD operations
 * @note Client-specific routes have been moved to client.routes.ts for better organization
 */

import { Router } from 'express';
import { TenantController } from '@/controllers/tenant.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  CreateTenantDto, 
  UpdateTenantDto,
  CreateTenantPhoneNumberDto,
  UpdateTenantPhoneNumberDto,
  CreateTenantEmailAddressDto,
  UpdateTenantEmailAddressDto
} from '@/dtos/tenant/tenant.dto';
import { param, query } from 'express-validator';
import { UserType } from '@/types/enums.js';

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
  authorize([UserType.SUPER_ADMIN]),
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
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
  authorize([UserType.SUPER_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
  ]),
  TenantController.deleteTenantHandler
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
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

/**
 * @route GET /api/v1/tenants/:tenantId/clients
 * @description Get all clients for a tenant
 * @access Private (SUPER_ADMIN or same tenant)
 * @note This is a convenience route. Full client management is available at /api/v1/clients
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

export default router;
