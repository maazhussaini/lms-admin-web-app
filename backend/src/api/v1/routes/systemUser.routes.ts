/**
 * @file System User Routes
 * @description API routes for system user management
 */

import { Router } from 'express';
import systemUserController from '@/controllers/systemUser.controller.js';
import { authenticate, authorize } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validation.middleware.js';
import { 
  createSystemUserValidation, 
  updateSystemUserValidation 
} from '@/dtos/user/systemUser.dto.js';
import { UserType } from '@/types/enums.js';

const router = Router();

// Create a new system user
router.post(
  '/',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(createSystemUserValidation),
  systemUserController.createSystemUserHandler
);

// Get a system user by ID
router.get(
  '/:userId',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  systemUserController.getSystemUserByIdHandler
);

// Get all system users with pagination and filtering
router.get(
  '/',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  systemUserController.getAllSystemUsersHandler
);

// Update a system user
router.patch(
  '/:userId',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(updateSystemUserValidation),
  systemUserController.updateSystemUserHandler
);

// Delete (soft-delete) a system user
router.delete(
  '/:userId',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  systemUserController.deleteSystemUserHandler
);

export default router;
