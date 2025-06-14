import { Router } from 'express';
import { StudentController } from '@/controllers/student.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { updateStudentProfileValidation } from '@/dtos/student/student.dto';
import { UserType } from '@/types/enums.types.js';

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

export default router;
