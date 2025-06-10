/**
 * @file api/v1/routes/client.routes.ts
 * @description Client management routes with comprehensive CRUD operations and tenant associations
 */

import { Router } from 'express';
import { ClientController } from '@/controllers/client.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  createClientValidation,
  updateClientValidation,
  listClientsValidation,
  createClientTenantValidation
} from '@/dtos/client/client.dto';
import { param } from 'express-validator';
import { UserType } from '@/types/enums.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== CLIENT MANAGEMENT ROUTES ====================

/**
 * @route POST /api/v1/clients
 * @description Create a new client
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(createClientValidation),
  ClientController.createClientHandler
);

/**
 * @route GET /api/v1/clients
 * @description Get all clients with pagination and filtering
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/',
  validate(listClientsValidation),
  ClientController.getAllClientsHandler
);

/**
 * @route GET /api/v1/clients/:clientId
 * @description Get client by ID
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/:clientId',
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
      .toInt()
  ]),
  ClientController.getClientByIdHandler
);

/**
 * @route PATCH /api/v1/clients/:clientId
 * @description Update client by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:clientId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
      .toInt(),
    ...updateClientValidation
  ]),
  ClientController.updateClientHandler
);

/**
 * @route DELETE /api/v1/clients/:clientId
 * @description Delete client by ID (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:clientId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
      .toInt()
  ]),
  ClientController.deleteClientHandler
);

// ==================== CLIENT-TENANT ASSOCIATION ROUTES ====================

/**
 * @route POST /api/v1/clients/tenant-associations
 * @description Create a new client-tenant association
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/tenant-associations',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(createClientTenantValidation),
  ClientController.createClientTenantAssociationHandler
);

/**
 * @route GET /api/v1/clients/:clientId/tenants
 * @description Get all tenants associated with a client
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/:clientId/tenants',
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
      .toInt()
  ]),
  ClientController.getClientTenantsHandler
);

/**
 * @route DELETE /api/v1/clients/tenant-associations/:associationId
 * @description Remove client-tenant association
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/tenant-associations/:associationId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('associationId')
      .isInt({ min: 1 })
      .withMessage('Association ID must be a positive integer')
      .toInt()
  ]),
  ClientController.removeClientTenantAssociationHandler
);

export default router;
