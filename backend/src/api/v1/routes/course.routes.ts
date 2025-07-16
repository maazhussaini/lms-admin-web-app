import { Router } from 'express';
import { CourseController } from '@/controllers/course.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { createCourseValidation, updateCourseValidation } from '@/dtos/course/course.dto';
import { param, body } from 'express-validator';
import { UserType } from '@/types/enums.types';

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
    .withMessage('Tenant ID is required when creating a course as SUPER_ADMIN')
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer')
    .toInt(),
];

/**
 * @route POST /api/v1/courses
 * @description Create a new course
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.post(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([...validateTenantIdForSuperAdmin, ...createCourseValidation]),
  CourseController.createCourseHandler
);

/**
 * @route GET /api/v1/courses
 * @description Get all courses with pagination and filtering
 * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
 */
router.get(
  '/',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN, UserType.TEACHER]),
  CourseController.getAllCoursesHandler
);

/**
 * @route GET /api/v1/courses/:courseId
 * @description Get course by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
 */
router.get(
  '/:courseId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN, UserType.TEACHER]),
  validate([
    param('courseId')
      .isInt({ min: 1 })
      .withMessage('Course ID must be a positive integer')
      .toInt()
  ]),
  CourseController.getCourseByIdHandler
);

/**
 * @route PATCH /api/v1/courses/:courseId
 * @description Update course by ID
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.patch(
  '/:courseId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('courseId')
      .isInt({ min: 1 })
      .withMessage('Course ID must be a positive integer')
      .toInt(),
    ...updateCourseValidation
  ]),
  CourseController.updateCourseHandler
);

/**
 * @route DELETE /api/v1/courses/:courseId
 * @description Delete course by ID (soft delete)
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */
router.delete(
  '/:courseId',
  authorize([UserType.SUPER_ADMIN, UserType.TENANT_ADMIN]),
  validate([
    param('courseId')
      .isInt({ min: 1 })
      .withMessage('Course ID must be a positive integer')
      .toInt()
  ]),
  CourseController.deleteCourseHandler
);

export default router;
