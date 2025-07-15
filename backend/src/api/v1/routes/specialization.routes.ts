import { Router } from 'express';
import { SpecializationController } from '@/controllers/specialization.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { UserType } from '@/types/enums.types';
import { validate } from '@/middleware/validation.middleware';
import {
  createSpecializationValidation,
  updateSpecializationValidation,
} from '@/dtos/course/specialization.dto';

const router = Router();


// POST /
router.post(
  '/',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate(createSpecializationValidation),
  SpecializationController.createSpecializationHandler
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
