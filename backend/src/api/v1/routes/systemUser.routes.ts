/**
 * @file System User Routes
 * @description API routes for system user management
 */

import { Router } from 'express';
import systemUserController from '@/controllers/systemUser.controller.js';
import { authenticate, authorize } from '@/middleware/auth.middleware.js';
import { validate, validationChains } from '@/middleware/validation.middleware.js';

/**
 * System user role enumeration
 * @description Defines system-level roles with proper hierarchy
 */
export enum SystemUserRole {
  SUPERADMIN = 1,     // Global system administrator (no tenant)
  TENANT_ADMIN = 2,   // Tenant administrator
}

const router = Router();

// Validation middleware for CreateSystemUserDto
const validateCreateSystemUser = validate([
  validationChains.requiredString('username', { min: 3, max: 50 }),
  validationChains.requiredString('fullName', { min: 2, max: 255 }),
  validationChains.email('email'),
  validationChains.password('password'),
  validationChains.enum('role', Object.values(SystemUserRole).filter(value => typeof value === 'number') as unknown as string[]),
  validationChains.integer('tenantId', { min: 1 })
]);

// Validation middleware for UpdateSystemUserDto
const validateUpdateSystemUser = validate([
  validationChains.optionalString('fullName', { min: 2, max: 255 }),
  validationChains.email('email', false),
  validationChains.enum('role', Object.values(SystemUserRole).filter(value => typeof value === 'number') as unknown as string[], false),
  validationChains.password('password', { required: false }),
  validationChains.enum(
    'status', 
    Object.values(SystemUserRole).filter(value => typeof value === 'number') as unknown as string[], 
    false
  )
]);

// Create a new system user
router.post(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validateCreateSystemUser,
  systemUserController.createSystemUserHandler
);

// Get a system user by ID
router.get(
  '/:userId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validationChains.paramId('userId'),
  systemUserController.getSystemUserByIdHandler
);

// Get all system users with pagination and filtering
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validationChains.pagination(),
  systemUserController.getAllSystemUsersHandler
);

// Update a system user
router.patch(
  '/:userId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validationChains.paramId('userId'),
  validateUpdateSystemUser,
  systemUserController.updateSystemUserHandler
);

// Delete (soft-delete) a system user
router.delete(
  '/:userId',
  authenticate,
  authorize(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validationChains.paramId('userId'),
  systemUserController.deleteSystemUserHandler
);

export default router;
