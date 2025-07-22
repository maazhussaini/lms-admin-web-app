import { Router } from 'express';
import { SpecializationController } from '@/controllers/specialization.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { UserType } from '@/types/enums.types';
import { validate } from '@/middleware/validation.middleware';
import {
  createSpecializationValidation,
  updateSpecializationValidation,
} from '@/dtos/course/specialization.dto';
import { getActiveSpecializationsByProgramValidation } from '@/dtos/course/active-specializations-by-program.dto';

const router = Router();


// POST /
router.post(
  '/',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(createSpecializationValidation),
  SpecializationController.createSpecializationHandler
);

/**
 * @route GET /api/v1/specializations/by-program
 * @description Get active specializations by program for authenticated student
 * @access Private (Student authentication required)
 * @query program_id - Required: Program ID to filter specializations
 */
router.get(
  '/by-program',
  authenticate,
  authorize([UserType.STUDENT]),
  validate(getActiveSpecializationsByProgramValidation),
  SpecializationController.getActiveSpecializationsByProgramHandler
);

// GET /:specializationId
router.get(
  '/:specializationId',
  authenticate,
  SpecializationController.getSpecializationByIdHandler
);

// GET /
router.get(
  '/',
  authenticate,
  SpecializationController.getAllSpecializationsHandler
);

// PATCH /:specializationId
router.patch(
  '/:specializationId',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(updateSpecializationValidation),
  SpecializationController.updateSpecializationHandler
);

// DELETE /:specializationId
router.delete(
  '/:specializationId',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  SpecializationController.deleteSpecializationHandler
);

export default router;
