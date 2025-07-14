/**
 * @file System User Routes
 * @description API routes for system user management
 */

import { Router } from 'express';
import systemUserController from '@/controllers/system-user.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  createSystemUserValidation, 
  updateSystemUserValidation,
  listSystemUsersValidation 
} from '@/dtos/user/system-user.dto';
import { UserType } from '@/types/enums.types';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Create a new system user
router.post(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(createSystemUserValidation),
  systemUserController.createSystemUserHandler
);

// Get a system user by ID
router.get(
  '/:userId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  systemUserController.getSystemUserByIdHandler
);

// Get all system users with pagination and filtering
router.get(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(listSystemUsersValidation), // Use the proper validation chain
  systemUserController.getAllSystemUsersHandler
);

// Update a system user
router.patch(
  '/:userId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(updateSystemUserValidation),
  systemUserController.updateSystemUserHandler
);

// Delete (soft-delete) a system user
router.delete(
  '/:userId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  systemUserController.deleteSystemUserHandler
);

export default router;
