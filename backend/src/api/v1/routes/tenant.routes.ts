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
  createTenantValidation, 
  updateTenantValidation,
  listTenantsValidation,
  createTenantPhoneNumberValidation,
  updateTenantPhoneNumberValidation,
  listTenantPhoneNumbersValidation,
  createTenantEmailAddressValidation,
  updateTenantEmailAddressValidation,
  listTenantEmailAddressesValidation,
  listTenantClientsValidation
} from '@/dtos/tenant/tenant.dto';
import { param } from 'express-validator';
import { UserType } from '@/types/enums.types';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== TENANT MANAGEMENT ROUTES ====================

/**
 * @route POST /api/v1/tenants
 * @description Create a new tenant
 * @access Private (SUPER_ADMIN only)
 */
router.post(
  '/',
  authorize([UserType.SUPER_ADMIN]),
  validate(createTenantValidation),
  TenantController.createTenantHandler
);

/**
 * @route GET /api/v1/tenants
 * @description Get all tenants with pagination and filtering
 * @access Private (SUPER_ADMIN or own tenant)
 */
router.get(
  '/',
  validate(listTenantsValidation),
  TenantController.getAllTenantsHandler
);

/**
 * @route GET /api/v1/tenants/:tenantId
 * @description Get tenant by ID
 * @access Private (SUPER_ADMIN or own tenant)
 */
router.get(
  '/:tenantId',
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt()
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    ...updateTenantValidation
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
  authorize([UserType.SUPER_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt()
  ]),
  TenantController.deleteTenantHandler
);

// ==================== TENANT PHONE NUMBER ROUTES ====================

/**
 * @route POST /api/v1/tenants/:tenantId/phone-numbers
 * @description Create a new tenant phone number
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/:tenantId/phone-numbers',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    ...createTenantPhoneNumberValidation
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
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    ...listTenantPhoneNumbersValidation
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    param('phoneNumberId')
      .isInt({ min: 1 })
      .withMessage('Phone number ID must be a positive integer')
      .toInt(),
    ...updateTenantPhoneNumberValidation
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    param('phoneNumberId')
      .isInt({ min: 1 })
      .withMessage('Phone number ID must be a positive integer')
      .toInt()
  ]),
  TenantController.deleteTenantPhoneNumberHandler
);

// ==================== TENANT EMAIL ADDRESS ROUTES ====================

/**
 * @route POST /api/v1/tenants/:tenantId/email-addresses
 * @description Create a new tenant email address
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/:tenantId/email-addresses',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    ...createTenantEmailAddressValidation
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
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    ...listTenantEmailAddressesValidation
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    param('emailAddressId')
      .isInt({ min: 1 })
      .withMessage('Email address ID must be a positive integer')
      .toInt(),
    ...updateTenantEmailAddressValidation
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
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    param('emailAddressId')
      .isInt({ min: 1 })
      .withMessage('Email address ID must be a positive integer')
      .toInt()
  ]),
  TenantController.deleteTenantEmailAddressHandler
);

// ==================== TENANT CLIENT ROUTES ====================

/**
 * @route GET /api/v1/tenants/:tenantId/clients
 * @description Get all clients for a tenant
 * @access Private (SUPER_ADMIN or same tenant)
 * @note This is a convenience route. Full client management is available at /api/v1/clients
 */
router.get(
  '/:tenantId/clients',
  validate([
    param('tenantId')
      .isInt({ min: 1 })
      .withMessage('Tenant ID must be a positive integer')
      .toInt(),
    ...listTenantClientsValidation
  ]),
  TenantController.getTenantClientsHandler
);

export default router;
