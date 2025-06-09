/**
 * @file api/v1/routes/client.routes.ts
 * @description Client management routes with comprehensive CRUD operations and tenant associations
 */

import { Router } from 'express';
import { ClientController } from '@/controllers/client.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  CreateClientDto,
  UpdateClientDto,
  CreateClientTenantDto
} from '@/dtos/client/client.dto';
import { param, query } from 'express-validator';

const router = Router();

// ==================== CLIENT MANAGEMENT ROUTES ====================

/**
 * @route POST /api/v1/clients
 * @description Create a new client
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate(CreateClientDto.validate()),
  ClientController.createClientHandler
);

/**
 * @route GET /api/v1/clients
 * @description Get all clients with pagination and filtering
 * @access Private (SUPER_ADMIN or same tenant)
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
  ClientController.getAllClientsHandler
);

/**
 * @route GET /api/v1/clients/:clientId
 * @description Get client by ID
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/:clientId',
  authenticate,
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
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
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer'),
    ...UpdateClientDto.validate()
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
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
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
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate(CreateClientTenantDto.validate()),
  ClientController.createClientTenantAssociationHandler
);

/**
 * @route GET /api/v1/clients/:clientId/tenants
 * @description Get all tenants associated with a client
 * @access Private (SUPER_ADMIN or same tenant)
 */
router.get(
  '/:clientId/tenants',
  authenticate,
  validate([
    param('clientId')
      .isInt({ min: 1 })
      .withMessage('Client ID must be a positive integer')
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
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validate([
    param('associationId')
      .isInt({ min: 1 })
      .withMessage('Association ID must be a positive integer')
  ]),
  ClientController.removeClientTenantAssociationHandler
);

export default router;
