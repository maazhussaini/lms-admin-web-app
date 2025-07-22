import { Router } from 'express';
import { CourseController } from '@/controllers/course.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { createCourseValidation, updateCourseValidation } from '@/dtos/course/course.dto';
import { getCoursesByProgramsAndSpecializationValidation } from '@/dtos/course/course-by-programs-specialization.dto';
import { getCourseBasicDetailsValidation } from '@/dtos/course/course-basic-details.dto';
import { getCourseModulesValidation } from '@/dtos/course/course-modules.dto';
import { getCourseTopicsByModuleValidation } from '@/dtos/course/course-topics-by-module.dto';
import { getAllCourseVideosByTopicValidation } from '@/dtos/course/course-videos-by-topic.dto';
import { getVideoDetailsByIdValidation } from '@/dtos/course/video-details-by-id.dto';
import { param, body } from 'express-validator';
import { UserType } from '@/types/enums.types';

const router = Router();

/**
 * PUBLIC ROUTES - No authentication required
 */

/**
 * @route GET /api/v1/courses/:courseId/basic-details
 * @description Get basic details for a specific course
 * @access Public (authentication optional for enhanced features)
 */
router.get(
  '/:courseId/basic-details',
  validate([
    param('courseId')
      .isInt({ min: 1 })
      .withMessage('Course ID must be a positive integer')
      .toInt(),
    ...getCourseBasicDetailsValidation
  ]),
  CourseController.getCourseBasicDetailsHandler
);

/**
 * @route GET /api/v1/courses/:courseId/modules
 * @description Get modules list for a specific course with statistics
 * @access Public (authentication optional for enhanced features)
 */
router.get(
  '/:courseId/modules',
  validate([
    param('courseId')
      .isInt({ min: 1 })
      .withMessage('Course ID must be a positive integer')
      .toInt(),
    ...getCourseModulesValidation
  ]),
  CourseController.getCourseModulesHandler
);

/**
 * @route GET /api/v1/modules/:moduleId/topics
 * @description Get topics list for a specific module with video lecture statistics
 * @access Public (authentication optional for enhanced features)
 */
router.get(
  '/modules/:moduleId/topics',
  validate([
    param('moduleId')
      .isInt({ min: 1 })
      .withMessage('Module ID must be a positive integer')
      .toInt(),
    ...getCourseTopicsByModuleValidation
  ]),
  CourseController.getCourseTopicsByModuleIdHandler
);

/**
 * @route GET /api/v1/topics/:topicId/videos
 * @description Get all videos for a specific topic with progress tracking and locking logic
 * @access Public (authentication optional for progress tracking)
 */
router.get(
  '/topics/:topicId/videos',
  validate([
    param('topicId')
      .isInt({ min: 1 })
      .withMessage('Topic ID must be a positive integer')
      .toInt(),
    ...getAllCourseVideosByTopicValidation
  ]),
  CourseController.getAllCourseVideosByTopicIdHandler
);

/**
 * @route GET /api/v1/videos/:videoId/details
 * @description Get comprehensive video details by ID including teacher info and navigation
 * @access Public (authentication optional for enhanced features)
 */
router.get(
  '/videos/:videoId/details',
  validate([
    param('videoId')
      .isInt({ min: 1 })
      .withMessage('Video ID must be a positive integer')
      .toInt(),
    ...getVideoDetailsByIdValidation
  ]),
  CourseController.getVideoDetailsByIdHandler
);

/**
 * PRIVATE ROUTES - Authentication required
 */

// Apply authentication to all routes below this point
router.use(authenticate);

/**
 * @route GET /api/v1/courses/by-programs-specialization
 * @description Get courses by programs and specialization with filtering
 * @access Private (All authenticated users - students, teachers, admins)
 */
router.get(
  '/by-programs-specialization',
  validate(getCoursesByProgramsAndSpecializationValidation),
  CourseController.getCoursesByProgramsAndSpecializationHandler
);

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
