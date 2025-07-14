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
import logger from '@/config/logger';
import { UserType } from '@/types/enums.types';

// Initialize student service
const studentService = new StudentService();

export class StudentController {
  /**
   * Create a new student
   * 
   * @route POST /api/v1/students
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createStudentHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const studentData = req.validatedData as CreateStudentDto;
      const requestingUser = req.user;
      
      // Determine tenant ID based on user type
      let tenantId: number;
      
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        // SUPER_ADMIN must provide tenant_id in request body
        if (!studentData.tenant_id) {
          throw new ApiError('Tenant ID is required when creating a student as SUPER_ADMIN', 400, 'MISSING_TENANT_ID');
        }
        tenantId = studentData.tenant_id;
      } else {
        // Regular admins use their own tenant
        if (!requestingUser.tenantId) {
          throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
        }
        tenantId = requestingUser.tenantId;
        
        // Ignore tenant_id from body for non-SUPER_ADMIN users
        if (studentData.tenant_id && studentData.tenant_id !== tenantId) {
          logger.warn('Non-SUPER_ADMIN user attempted to specify different tenant_id', {
            userId: requestingUser.id,
            userType: requestingUser.user_type,
            requestedTenantId: studentData.tenant_id,
            userTenantId: tenantId
          });
        }
      }

      // Extract admin user ID from authenticated user
      const adminUserId = requestingUser.id;
      if (!adminUserId) {
        throw new ApiError('Admin user ID is required', 400, 'MISSING_ADMIN_USER_ID');
      }
      
      logger.debug('Creating student', {
        username: studentData.username,
        tenantId,
        userId: requestingUser.id,
        role: requestingUser.user_type
      });
      
      return await studentService.createStudent(
        studentData, 
        tenantId,
        adminUserId,
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
}
