import { Router } from 'express';
import { InstituteController } from '@/controllers/institute.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  createInstituteValidation, 
  updateInstituteValidation
} from '@/dtos/institute/institute.dto';
import { param, body } from 'express-validator';
import { UserType } from '@/types/enums.types';

const router = Router();

/**
 * Custom validation for SUPER_ADMIN tenant_id requirement
 */
const validateTenantIdForSuperAdmin = [
  body('tenant_id')
    .if((_value, { req }) => req['user']?.user_type === UserType.SUPER_ADMIN)
    .exists()
    .withMessage('Tenant ID is required when creating an institute as SUPER_ADMIN')
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer')
    .toInt(),
];

/**
 * @route POST /api/v1/institutes
 * @description Create a new institute
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/',
  authenticate, // ✅ Add authentication middleware
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]), // ✅ Add authorization
  validate([
    ...validateTenantIdForSuperAdmin, 
    ...createInstituteValidation
  ]),
  InstituteController.createInstituteHandler
);

// Apply authentication to all routes below (for backward compatibility)
router.use(authenticate);

/**
 * @route GET /api/v1/institutes
 * @description Get all institutes with pagination and filtering
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.get(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  InstituteController.getAllInstitutesHandler
);

/**
 * @route GET /api/v1/institutes/:instituteId
 * @description Get institute by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.get(
  '/:instituteId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('instituteId')
      .isInt({ min: 1 })
      .withMessage('Institute ID must be a positive integer')
      .toInt()
  ]),
  InstituteController.getInstituteByIdHandler
);

/**
 * @route PATCH /api/v1/institutes/:instituteId
 * @description Update institute by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:instituteId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('instituteId')
      .isInt({ min: 1 })
      .withMessage('Institute ID must be a positive integer')
      .toInt(),
    ...updateInstituteValidation
  ]),
  InstituteController.updateInstituteHandler
);

/**
 * @route DELETE /api/v1/institutes/:instituteId
 * @description Delete institute by ID (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:instituteId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('instituteId')
      .isInt({ min: 1 })
      .withMessage('Institute ID must be a positive integer')
      .toInt()
  ]),
  InstituteController.deleteInstituteHandler
);

export default router;
