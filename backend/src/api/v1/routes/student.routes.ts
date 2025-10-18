import { Router } from 'express';
import multer from 'multer';
import { StudentController } from '@/controllers/student.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { 
  createStudentValidation, 
  updateStudentValidation,
  studentPhoneNumberValidation,
  studentEmailAddressValidation
} from '@/dtos/student/student.dto';
import { param, body } from 'express-validator';
import { UserType } from '@/types/enums.types';

const router = Router();

/**
 * Multer configuration for student profile picture uploads
 * Using memoryStorage to keep files in buffer for network share upload
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
    files: 1 // Only one file allowed
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});


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
  
  // For non-SUPER_ADMIN users, allow null/undefined tenant_id (will be set from header)
  body('tenant_id')
    .if((_value, { req }) => req['user']?.user_type !== UserType.SUPER_ADMIN)
    .optional({ nullable: true })
    .customSanitizer(() => undefined) // Remove it from body for non-SUPER_ADMIN
];


/**
 * @route POST /api/v1/students
 * @description Create a new student
 * @access Private (SUPER_ADMIN, TENANT_ADMIN)
 */

router.post(
  '/',
  upload.single('profile_picture'),
  validate([
    ...validateTenantIdForSuperAdmin, 
    ...createStudentValidation,
    ...studentPhoneNumberValidation,
    ...studentEmailAddressValidation
  ]),
  StudentController.createStudentHandler
);

// Apply authentication to all routes
router.use(authenticate);




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
  upload.single('profile_picture'),
  validate([
    param('studentId')
      .isInt({ min: 1 })
      .withMessage('Student ID must be a positive integer')
      .toInt(),
    ...updateStudentValidation,
    ...studentPhoneNumberValidation,
    ...studentEmailAddressValidation
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
