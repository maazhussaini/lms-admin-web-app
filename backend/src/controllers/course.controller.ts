import { CourseService } from '@/services/course.service';
import { CreateCourseDto, UpdateCourseDto } from '@/dtos/course/course.dto';
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

const courseService = new CourseService();

export class CourseController {
  /**
   * Create a new course
   * @route POST /api/v1/courses
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createCourseHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      const courseData = req.validatedData as CreateCourseDto;
      const requestingUser = req.user;
      let tenantId: number;
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        if (!courseData.tenant_id) {
          throw new ApiError('Tenant ID is required when creating a course as SUPER_ADMIN', 400, 'MISSING_TENANT_ID');
        }
        tenantId = courseData.tenant_id;
      } else {
        if (!requestingUser.tenantId) {
          throw new ApiError('Tenant ID is required', 400, 'MISSING_TENANT_ID');
        }
        tenantId = requestingUser.tenantId;
        if (courseData.tenant_id && courseData.tenant_id !== tenantId) {
          logger.warn('Non-SUPER_ADMIN user attempted to specify different tenant_id', {
            userId: requestingUser.id,
            userType: requestingUser.user_type,
            requestedTenantId: courseData.tenant_id,
            userTenantId: tenantId
          });
        }
      }
      const adminUserId = requestingUser.id;
      if (!adminUserId) {
        throw new ApiError('Admin user ID is required', 400, 'MISSING_ADMIN_USER_ID');
      }
      logger.debug('Creating course', {
        courseName: courseData.course_name,
        tenantId,
        userId: requestingUser.id,
        role: requestingUser.user_type
      });
      return await courseService.createCourse(
        courseData,
        tenantId,
        adminUserId,
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Course created successfully'
    }
  );

  /**
   * Get course by ID
   * @route GET /api/v1/courses/:courseId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
   */
  static getCourseByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const courseIdParam = req.params['courseId'];
      if (!courseIdParam) {
        throw new ApiError('Course ID is required', 400, 'MISSING_COURSE_ID');
      }
      const courseId = parseInt(courseIdParam, 10);
      if (isNaN(courseId)) {
        throw new ApiError('Invalid course ID', 400, 'INVALID_COURSE_ID');
      }
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      const requestingUser = req.user;
      return await courseService.getCourseById(courseId, requestingUser);
    },
    {
      message: 'Course retrieved successfully'
    }
  );

  /**
   * Get all courses with pagination, sorting, and filtering
   * @route GET /api/v1/courses
   * @access Private (SUPER_ADMIN, TENANT_ADMIN, TEACHER)
   */
  static getAllCoursesHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      const requestingUser = req.user;
      const result = await courseService.getAllCourses(requestingUser, params);
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Courses retrieved successfully'
    }
  );

  /**
   * Update course by ID
   * @route PATCH /api/v1/courses/:courseId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static updateCourseHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const courseIdParam = req.params['courseId'];
      if (!courseIdParam) {
        throw new ApiError('Course ID is required', 400, 'MISSING_COURSE_ID');
      }
      const courseId = parseInt(courseIdParam, 10);
      if (isNaN(courseId)) {
        throw new ApiError('Invalid course ID', 400, 'INVALID_COURSE_ID');
      }
      const updateData = req.validatedData as UpdateCourseDto;
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      const requestingUser = req.user;
      return await courseService.updateCourse(
        courseId,
        updateData,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Course updated successfully'
    }
  );

  /**
   * Delete course by ID (soft delete)
   * @route DELETE /api/v1/courses/:courseId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static deleteCourseHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
      const courseIdParam = req.params['courseId'];
      if (!courseIdParam) {
        throw new ApiError('Course ID is required', 400, 'MISSING_COURSE_ID');
      }
      const courseId = parseInt(courseIdParam, 10);
      if (isNaN(courseId)) {
        throw new ApiError('Invalid course ID', 400, 'INVALID_COURSE_ID');
      }
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      const requestingUser = req.user;
      await courseService.deleteCourse(
        courseId,
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Course deleted successfully'
    }
  );
}
