import { StudentService } from '@/services/student.service';
import { 
  CreateStudentDto, 
  UpdateStudentDto,
  UpdateStudentProfileDto
} from '@/dtos/student/student.dto';
import { 
  createRouteHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler,
  ExtendedPaginationWithFilters,
  AuthenticatedRequest
} from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import { PrismaClient } from '@prisma/client';
import logger from '@/config/logger';
import { UserType } from '@/types/enums.types';

// Get student service singleton instance
const studentService = StudentService.getInstance();
const prisma = new PrismaClient();

export class StudentController {
  /**
   * Create a new student
   * 
   * @route POST /api/v1/students
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createStudentHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const studentData = req.validatedData as CreateStudentDto;
      let requestingUser: any = req.user || {};

      logger.info('🔍 ===== CONTROLLER: Creating student =====');
      logger.info('🔍 Request User Object:', JSON.stringify(requestingUser, null, 2));
      logger.info('🔍 User Type:', requestingUser.user_type);
      logger.info('🔍 User Type TYPE:', typeof requestingUser.user_type);
      logger.info('🔍 SUPER_ADMIN constant:', UserType.SUPER_ADMIN);
      logger.info('🔍 Comparison Result:', requestingUser.user_type === UserType.SUPER_ADMIN);
      logger.info('🔍 Student Data tenant_id:', studentData.tenant_id);

      // Handle tenant_id based on user type
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        // SUPER_ADMIN: tenant_id must come from request body
        if (!studentData.tenant_id) {
          throw new ApiError(
            'Tenant ID is required for SUPER_ADMIN',
            400,
            'MISSING_TENANT_ID'
          );
        }
        logger.info('✅ SUPER_ADMIN: Using tenant_id from request body:', studentData.tenant_id);
        // tenant_id already in studentData.tenant_id from body
      } else {
        logger.info('👤 Non-SUPER_ADMIN detected: Getting tenant from domain/header');
        logger.info('👤 Current user_type value:', requestingUser.user_type);
        // Non-SUPER_ADMIN: Get tenant from domain/header
        const tenant = await studentService.getTenantFromDomain(req);
        requestingUser.tenantId = tenant.tenant_id;
        // Ignore tenant_id from body for security
        studentData.tenant_id = tenant.tenant_id;
        logger.info('✅ Non-SUPER_ADMIN: Override tenant_id to:', studentData.tenant_id);
      }

      // Extract profile picture file from request
      const profilePictureFile = req.file;
      
      return await studentService.createStudent(
        studentData, 
        requestingUser,
        req.ip || undefined,
        profilePictureFile
      );
    },
    {
      statusCode: 201,
      message: 'Student created successfully'
    }
  );

  /**
   * Get student by ID
   * 
   * @route GET /api/v1/students/:studentId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
   */
  static getStudentByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const studentIdParam = req.params['studentId'];
      if (!studentIdParam) {
        throw new ApiError('Student ID is required', 400, 'MISSING_STUDENT_ID');
      }
      
      const studentId = parseInt(studentIdParam, 10);
      if (isNaN(studentId)) {
        throw new ApiError('Invalid student ID', 400, 'INVALID_STUDENT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      return await studentService.getStudentById(studentId, requestingUser);
    },
    {
      message: 'Student retrieved successfully'
    }
  );

  /**
   * Get all students with pagination, sorting, and filtering
   * 
   * @route GET /api/v1/students
   * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
   */
  static getAllStudentsHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Call the service with the params directly - service now handles ExtendedPaginationWithFilters
      const result = await studentService.getAllStudents(requestingUser, params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Students retrieved successfully'
    }
  );

  /**
   * Update student by ID
   * 
   * @route PATCH /api/v1/students/:studentId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static updateStudentHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const studentIdParam = req.params['studentId'];
      if (!studentIdParam) {
        throw new ApiError('Student ID is required', 400, 'MISSING_STUDENT_ID');
      }
      
      const studentId = parseInt(studentIdParam, 10);
      if (isNaN(studentId)) {
        throw new ApiError('Invalid student ID', 400, 'INVALID_STUDENT_ID');
      }

      const updateData = req.validatedData as UpdateStudentDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Extract profile picture file from request
      const profilePictureFile = req.file;
      
      return await studentService.updateStudent(
        studentId, 
        updateData, 
        requestingUser,
        req.ip || undefined,
        profilePictureFile
      );
    },
    {
      message: 'Student updated successfully'
    }
  );

  /**
   * Delete student by ID (soft delete)
   * 
   * @route DELETE /api/v1/students/:studentId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static deleteStudentHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
      const studentIdParam = req.params['studentId'];
      if (!studentIdParam) {
        throw new ApiError('Student ID is required', 400, 'MISSING_STUDENT_ID');
      }
      
      const studentId = parseInt(studentIdParam, 10);
      if (isNaN(studentId)) {
        throw new ApiError('Invalid student ID', 400, 'INVALID_STUDENT_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      await studentService.deleteStudent(
        studentId, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      message: 'Student deleted successfully'
    }
  );

  /**
   * Get current student's profile
   * 
   * @route GET /api/v1/student/profile
   * @access Private (STUDENT)
   */
  static getStudentProfileHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      // Debug logging to understand the token content
      logger.debug('Student profile request', {
        userId: requestingUser.id,
        email: requestingUser.email,
        userType: requestingUser.user_type,
        tenantId: requestingUser.tenantId,
        role: requestingUser.role
      });

      return await studentService.getStudentProfile(requestingUser);
    },
    {
      message: 'Student profile retrieved successfully'
    }
  );

  /**
   * Update current student's profile
   * 
   * @route PATCH /api/v1/student/profile
   * @access Private (STUDENT)
   */
  static updateStudentProfileHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const updateData = req.validatedData as UpdateStudentProfileDto;
      const requestingUser = req.user;
      
      logger.debug('Updating student profile', {
        userId: requestingUser.id,
        tenantId: requestingUser.tenantId
      });
      
      return await studentService.updateStudentProfile(
        updateData,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Student profile updated successfully'
    }
  );

  /**
   * Get enrolled courses for current student (profile-based)
   * 
   * @route GET /api/v1/student/profile/enrollments
   * @access Private (STUDENT only)
   */
  static getStudentProfileEnrollmentsHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Ensure the user is a student
      if (requestingUser.user_type !== UserType.STUDENT) {
        throw new ApiError('Only students can access this endpoint', 403, 'FORBIDDEN');
      }

      // Find the student record using the user's email (since student login uses email)
      const student = await prisma.student.findFirst({
        where: {
          is_active: true,
          is_deleted: false,
          emails: {
            some: {
              email_address: requestingUser.email,
              is_primary: true,
              is_deleted: false
            }
          }
        },
        select: {
          student_id: true
        }
      });

      if (!student) {
        throw new ApiError('Student profile not found', 404, 'STUDENT_NOT_FOUND');
      }

      // Get query parameters for additional filtering
      const enrollmentStatus = req.query['enrollment_status'] as string;
      const includeProgress = req.query['include_progress'] === 'true';
      const isEnrolled = req.query['is_enrolled'] !== 'false'; // Default to true unless explicitly set to 'false'
      
      // Handle backward compatibility: if enrollment_status is provided, convert to isEnrolled boolean
      let finalIsEnrolled = isEnrolled;
      if (enrollmentStatus) {
        const statusesArray = enrollmentStatus.split(',').map(s => s.trim().toUpperCase());
        // If the provided statuses include ACTIVE or COMPLETED, set isEnrolled to true
        // If they only include other statuses (PENDING, DROPPED, etc.), set to false
        const hasActiveOrCompleted = statusesArray.some(status => 
          ['ACTIVE', 'COMPLETED'].includes(status)
        );
        const hasOtherStatuses = statusesArray.some(status => 
          !['ACTIVE', 'COMPLETED'].includes(status)
        );
        
        // If both types are requested, default to true (enrolled)
        // If only non-active statuses are requested, set to false
        finalIsEnrolled = hasActiveOrCompleted || !hasOtherStatuses;
      }
      
      logger.debug('Getting enrolled courses for current student profile', {
        studentId: student.student_id,
        paginationParams: params,
        enrollmentStatus,
        isEnrolled: finalIsEnrolled,
        includeProgress,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });
      
      const result = await studentService.getEnrolledCoursesByStudentId(
        student.student_id,
        requestingUser,
        params,
        finalIsEnrolled
      );

      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Student enrolled courses retrieved successfully'
    }
  );
}
