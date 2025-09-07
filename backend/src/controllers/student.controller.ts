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
      // if (!req.user) {
      //   throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      // }
      const tenant = await studentService.getTenantFromDomain(req);
      const studentData = req.validatedData as CreateStudentDto;
      let requestingUser:any = req.user || {};

      if(requestingUser.user_type !== UserType.SUPER_ADMIN){
        requestingUser.tenantId = tenant.tenant_id;
      }
      else{
        studentData.tenant_id = tenant.tenant_id;
      }
      
      return await studentService.createStudent(
        studentData, 
        requestingUser,
        req.ip || undefined
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
      
      return await studentService.updateStudent(
        studentId, 
        updateData, 
        requestingUser,
        req.ip || undefined
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
      
      logger.debug('Getting enrolled courses for current student profile', {
        studentId: student.student_id,
        paginationParams: params,
        enrollmentStatus,
        includeProgress,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });
      
      const result = await studentService.getEnrolledCoursesByStudentId(
        student.student_id,
        requestingUser,
        params
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
