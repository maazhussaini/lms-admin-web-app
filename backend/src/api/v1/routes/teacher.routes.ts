import { Router } from 'express';
import { TeacherController } from '@/controllers/teacher.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  createTeacherValidation, 
  updateTeacherValidation,
  teacherPhoneNumberValidation,
  teacherEmailAddressValidation
} from '@/dtos/teacher/teacher.dto';
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
    .withMessage('Tenant ID is required when creating a teacher as SUPER_ADMIN')
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer')
    .toInt(),
];

/**
 * @route POST /api/v1/teachers
 * @description Create a new teacher
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/',
  authenticate, // ✅ Add authentication middleware
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]), // ✅ Add authorization
  validate([
    ...validateTenantIdForSuperAdmin, 
    ...createTeacherValidation,
    ...teacherPhoneNumberValidation,
    ...teacherEmailAddressValidation
  ]),
  TeacherController.createTeacherHandler
);

// Apply authentication to all routes below (for backward compatibility)
router.use(authenticate);

/**
 * @route GET /api/v1/teachers
 * @description Get all teachers with pagination and filtering
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.get(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  TeacherController.getAllTeachersHandler
);

/**
 * @route GET /api/v1/teachers/:teacherId
 * @description Get teacher by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.get(
  '/:teacherId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('teacherId')
      .isInt({ min: 1 })
      .withMessage('Teacher ID must be a positive integer')
      .toInt()
  ]),
  TeacherController.getTeacherByIdHandler
);

/**
 * @route PATCH /api/v1/teachers/:teacherId
 * @description Update teacher by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:teacherId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('teacherId')
      .isInt({ min: 1 })
      .withMessage('Teacher ID must be a positive integer')
      .toInt(),
    ...updateTeacherValidation,
    ...teacherPhoneNumberValidation,
    ...teacherEmailAddressValidation
  ]),
  TeacherController.updateTeacherHandler
);

/**
 * @route DELETE /api/v1/teachers/:teacherId
 * @description Delete teacher by ID (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:teacherId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('teacherId')
      .isInt({ min: 1 })
      .withMessage('Teacher ID must be a positive integer')
      .toInt()
  ]),
  TeacherController.deleteTeacherHandler
);

/**
 * @route POST /api/v1/teachers/bulk-delete
 * @description Bulk delete teachers (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/bulk-delete',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    body('teacherIds')
      .isArray({ min: 1 })
      .withMessage('Teacher IDs must be a non-empty array')
      .custom((value) => {
        if (!value.every((id: any) => Number.isInteger(id) && id > 0)) {
          throw new Error('All teacher IDs must be positive integers');
        }
        return true;
      })
  ]),
  TeacherController.bulkDeleteTeachersHandler
);

export default router;
