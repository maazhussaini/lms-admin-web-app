/**
 * @file api/v1/routes/program.routes.ts
 * @description Program management routes
 */

import { Router } from 'express';
import { ProgramController } from '@/controllers/program.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { CreateProgramDto, UpdateProgramDto } from '@/dtos/course/program.dto';
import { param } from 'express-validator';
import { UserType } from '@/types/enums.types';

const router = Router();

/**
 * @route POST /api/v1/programs
 * @description Create a new academic program
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(CreateProgramDto.validate()),
  ProgramController.createProgramHandler
);

/**
 * @route GET /api/v1/programs/:programId
 * @description Get program by ID
 * @access Private (Any authenticated user within tenant)
 */
router.get(
  '/:programId',
  authenticate,
  validate([
    param('programId')
      .isInt({ min: 1 })
      .withMessage('Program ID must be a positive integer')
  ]),
  ProgramController.getProgramByIdHandler
);

/**
 * @route GET /api/v1/programs
 * @description Get all programs with pagination and filtering
 * @access Private (Any authenticated user within tenant)
 */
router.get(
  '/',
  authenticate,
  ProgramController.getAllProgramsHandler
);

/**
 * @route PATCH /api/v1/programs/:programId
 * @description Update program by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:programId',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('programId')
      .isInt({ min: 1 })
      .withMessage('Program ID must be a positive integer'),
    ...UpdateProgramDto.validate()
  ]),
  ProgramController.updateProgramHandler
);

/**
 * @route DELETE /api/v1/programs/:programId
 * @description Delete program by ID (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:programId',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('programId')
      .isInt({ min: 1 })
      .withMessage('Program ID must be a positive integer')
  ]),
  ProgramController.deleteProgramHandler
);

/**
 * @route GET /api/v1/programs/tenant/list
 * @description Get all programs for the authenticated user's tenant
 * @access Private (Any authenticated user)
 */
router.get(
  '/tenant/list',
  authenticate,
  ProgramController.getProgramsByTenantHandler
);

export default router;
