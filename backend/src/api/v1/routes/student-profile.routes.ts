import { Router } from 'express';
import { StudentController } from '@/controllers/student.controller';
import { CourseController } from '@/controllers/course.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { updateStudentProfileValidation } from '@/dtos/student/student.dto';
import { getEnrolledCoursesByStudentValidation } from '@/dtos/student/enrolled-courses-by-student.dto';
import { getCoursesByProgramsAndSpecializationProfileValidation } from '@/dtos/course/course-by-programs-specialization.dto';
import { getCourseBasicDetailsProfileValidation } from '@/dtos/course/course-basic-details.dto';
import { param } from 'express-validator';
import { UserType } from '@/types/enums.types';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/v1/student/profile
 * @description Get current student's profile
 * @access Private (STUDENT only)
 */
router.get(
  '/profile',
  authorize([UserType.STUDENT]),
  StudentController.getStudentProfileHandler
);

/**
 * @route PATCH /api/v1/student/profile
 * @description Update current student's profile (limited fields)
 * @access Private (STUDENT only)
 */
router.patch(
  '/profile',
  authorize([UserType.STUDENT]),
  validate(updateStudentProfileValidation),
  StudentController.updateStudentProfileHandler
);

/**
 * @route GET /api/v1/student/profile/enrollments
 * @description Get current student's enrolled courses
 * @access Private (STUDENT only)
 */
router.get(
  '/profile/enrollments',
  authorize([UserType.STUDENT]),
  validate(getEnrolledCoursesByStudentValidation),
  StudentController.getStudentProfileEnrollmentsHandler
);

/**
 * @route GET /api/v1/student/profile/courses/discover
 * @description Get courses by programs and specialization for current student
 * @access Private (STUDENT only)
 */
router.get(
  '/profile/courses/discover',
  authorize([UserType.STUDENT]),
  validate(getCoursesByProgramsAndSpecializationProfileValidation),
  CourseController.getStudentProfileCoursesByProgramsAndSpecializationHandler
);

/**
 * @route GET /api/v1/student/profile/courses/:courseId/basic-details
 * @description Get basic details for a specific course for current student
 * @access Private (STUDENT only)
 */
router.get(
  '/profile/courses/:courseId/basic-details',
  authorize([UserType.STUDENT]),
  validate([
    param('courseId')
      .isInt({ min: 1 })
      .withMessage('Course ID must be a positive integer')
      .toInt(),
    ...getCourseBasicDetailsProfileValidation
  ]),
  CourseController.getStudentProfileCourseBasicDetailsHandler
);

export default router;
