import { Router } from 'express';
import { StudentController } from '@/controllers/student.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { createStudentValidation, updateStudentValidation } from '@/dtos/student/student.dto';
import { param, body } from 'express-validator';
import { UserType } from '@/types/enums.types.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * Custom validation for SUPER_ADMIN tenant_id requirement
 */
const validateTenantIdForSuperAdmin = [
  body('tenant_id')
    .if((_value, { req }) => req['user']?.user_type === UserType.SUPER_ADMIN)
    .exists()
    .withMessage('Tenant ID is required when creating a student as SUPER_ADMIN')
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer')
    .toInt(),
];

/**
 * @route POST /api/v1/students
 * @description Create a new student
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([...validateTenantIdForSuperAdmin, ...createStudentValidation]),
  StudentController.createStudentHandler
);

/**
 * @route GET /api/v1/students
 * @description Get all students with pagination and filtering
 * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
 */
router.get(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN, UserType.TEACHER]),
  StudentController.getAllStudentsHandler
);

/**
 * @route GET /api/v1/students/:studentId
 * @description Get student by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
 */
router.get(
  '/:studentId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN, UserType.TEACHER]),
  validate([
    param('studentId')
      .isInt({ min: 1 })
      .withMessage('Student ID must be a positive integer')
      .toInt()
  ]),
  StudentController.getStudentByIdHandler
);

/**
 * @route PATCH /api/v1/students/:studentId
 * @description Update student by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:studentId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('studentId')
      .isInt({ min: 1 })
      .withMessage('Student ID must be a positive integer')
      .toInt(),
    ...updateStudentValidation
  ]),
  StudentController.updateStudentHandler
);

/**
 * @route DELETE /api/v1/students/:studentId
 * @description Delete student by ID (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:studentId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('studentId')
      .isInt({ min: 1 })
      .withMessage('Student ID must be a positive integer')
      .toInt()
  ]),
  StudentController.deleteStudentHandler
);

export default router;
