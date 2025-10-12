import { TeacherService } from '@/services/teacher.service';
import { 
  CreateTeacherDto, 
  UpdateTeacherDto
} from '@/dtos/teacher/teacher.dto';
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

// Get teacher service singleton instance
const teacherService = TeacherService.getInstance();

export class TeacherController {
  /**
   * Create a new teacher
   * 
   * @route POST /api/v1/teachers
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createTeacherHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenant = await teacherService.getTenantFromDomain(req);
      const teacherData = req.validatedData as CreateTeacherDto;
      let requestingUser:any = req.user || {};

      if(requestingUser.user_type !== UserType.SUPER_ADMIN){
        requestingUser.tenantId = tenant.tenant_id;
      }
      else{
        teacherData.tenant_id = tenant.tenant_id;
      }
      
      return await teacherService.createTeacher(
        teacherData, 
        requestingUser,
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Teacher created successfully'
    }
  );

  /**
   * Get teacher by ID
   * 
   * @route GET /api/v1/teachers/:teacherId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static getTeacherByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const teacherIdParam = req.params['teacherId'];
      if (!teacherIdParam) {
        throw new ApiError('Teacher ID is required', 400, 'MISSING_TEACHER_ID');
      }
      
      const teacherId = parseInt(teacherIdParam, 10);
      if (isNaN(teacherId)) {
        throw new ApiError('Invalid teacher ID', 400, 'INVALID_TEACHER_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      return await teacherService.getTeacherById(teacherId, requestingUser);
    },
    {
      message: 'Teacher retrieved successfully'
    }
  );

  /**
   * Get all teachers with pagination, sorting, and filtering
   * 
   * @route GET /api/v1/teachers
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static getAllTeachersHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Call the service with the params directly
      const result = await teacherService.getAllTeachers(requestingUser, params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Teachers retrieved successfully'
    }
  );

  /**
   * Update teacher by ID
   * 
   * @route PATCH /api/v1/teachers/:teacherId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static updateTeacherHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const teacherIdParam = req.params['teacherId'];
      if (!teacherIdParam) {
        throw new ApiError('Teacher ID is required', 400, 'MISSING_TEACHER_ID');
      }
      
      const teacherId = parseInt(teacherIdParam, 10);
      if (isNaN(teacherId)) {
        throw new ApiError('Invalid teacher ID', 400, 'INVALID_TEACHER_ID');
      }

      const updateData = req.validatedData as UpdateTeacherDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      return await teacherService.updateTeacher(
        teacherId, 
        updateData, 
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Teacher updated successfully'
    }
  );

  /**
   * Delete teacher by ID (soft delete)
   * 
   * @route DELETE /api/v1/teachers/:teacherId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static deleteTeacherHandler = createDeleteHandler(
    async (req: AuthenticatedRequest) => {
      const teacherIdParam = req.params['teacherId'];
      if (!teacherIdParam) {
        throw new ApiError('Teacher ID is required', 400, 'MISSING_TEACHER_ID');
      }
      
      const teacherId = parseInt(teacherIdParam, 10);
      if (isNaN(teacherId)) {
        throw new ApiError('Invalid teacher ID', 400, 'INVALID_TEACHER_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      await teacherService.deleteTeacher(
        teacherId,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Teacher deleted successfully'
    }
  );

  /**
   * Bulk delete teachers (soft delete)
   * 
   * @route POST /api/v1/teachers/bulk-delete
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static bulkDeleteTeachersHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const { teacherIds } = req.body;
      
      if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
        throw new ApiError('Teacher IDs array is required', 400, 'MISSING_TEACHER_IDS');
      }

      const requestingUser = req.user;
      const clientIp = req.ip || undefined;

      // Delete each teacher
      const results = await Promise.allSettled(
        teacherIds.map((id: number) => 
          teacherService.deleteTeacher(id, requestingUser, clientIp)
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      logger.info('Bulk teacher deletion completed', {
        total: teacherIds.length,
        successful: successCount,
        failed: failureCount,
        userId: requestingUser.id
      });

      return {
        total: teacherIds.length,
        successful: successCount,
        failed: failureCount
      };
    },
    {
      message: 'Bulk delete operation completed'
    }
  );
}
