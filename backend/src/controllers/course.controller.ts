import { CreateCourseDto, UpdateCourseDto } from '@/dtos/course/course.dto';
import { GetCoursesByProgramsAndSpecializationDto } from '@/dtos/course/course-by-programs-specialization.dto';
import {
  createRouteHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler,
  ExtendedPaginationWithFilters,
  AuthenticatedRequest
} from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import prisma from '@/config/database';
import logger from '@/config/logger';
import { UserType } from '@/types/enums.types';
import { courseService } from '@/services/course.service';


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
  
  /**
   * Get course basic details
   * @route GET /api/v1/courses/:courseId/basic-details
   * @access Public (can be accessed with optional authentication)
   */
  static getCourseBasicDetailsHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const courseIdParam = req.params['courseId'];
      if (!courseIdParam) {
        throw new ApiError('Course ID is required', 400, 'MISSING_COURSE_ID');
      }
      
      const courseId = parseInt(courseIdParam, 10);
      if (isNaN(courseId)) {
        throw new ApiError('Invalid course ID', 400, 'INVALID_COURSE_ID');
      }

      // Get student_id from query parameters
      const studentId = req.query['student_id'] ? parseInt(req.query['student_id'] as string, 10) : undefined;

      logger.debug('Getting course basic details', {
        courseId,
        studentId,
        userType: req.user?.user_type
      });

      return await courseService.getCourseBasicDetails(
        courseId,
        studentId,
        req.user || undefined
      );
    },
    {
      message: 'Course basic details retrieved successfully'
    }
  );

  /**
   * Get course modules with statistics
   * @route GET /api/v1/courses/:courseId/modules
   * @access Public (can be accessed with optional authentication)
   */
  static getCourseModulesHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const courseIdParam = req.params['courseId'];
      if (!courseIdParam) {
        throw new ApiError('Course ID is required', 400, 'MISSING_COURSE_ID');
      }
      
      const courseId = parseInt(courseIdParam, 10);
      if (isNaN(courseId)) {
        throw new ApiError('Invalid course ID', 400, 'INVALID_COURSE_ID');
      }

      logger.debug('Getting course modules', {
        courseId,
        userType: req.user?.user_type,
        params: {
          page: params.page,
          limit: params.limit,
          search: params.filters?.['search']
        }
      });

      const result = await courseService.getCourseModules(
        courseId,
        req.user || undefined,
        params
      );

      return {
        items: result.items,
        total: result.total
      };
    },
    {
      message: 'Course modules retrieved successfully'
    }
  );

  /**
   * Get course topics by module ID with video lecture statistics
   * @route GET /api/v1/modules/:moduleId/topics
   * @access Public (can be accessed with optional authentication)
   */
  static getCourseTopicsByModuleIdHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const moduleIdParam = req.params['moduleId'];
      if (!moduleIdParam) {
        throw new ApiError('Module ID is required', 400, 'MISSING_MODULE_ID');
      }
      
      const moduleId = parseInt(moduleIdParam, 10);
      if (isNaN(moduleId)) {
        throw new ApiError('Invalid module ID', 400, 'INVALID_MODULE_ID');
      }

      logger.debug('Getting course topics by module ID', {
        moduleId,
        userType: req.user?.user_type,
        params: {
          page: params.page,
          limit: params.limit,
          search: params.filters?.['search']
        }
      });

      const result = await courseService.getCourseTopicsByModuleId(
        moduleId,
        req.user || undefined,
        params
      );

      return {
        items: result.items,
        total: result.total
      };
    },
    {
      message: 'Course topics retrieved successfully'
    }
  );

  /**
   * Get all course videos by topic ID with progress tracking and locking logic
   * @route GET /api/v1/topics/:topicId/videos
   * @access Public (can be accessed with optional authentication for progress tracking)
   */
  static getAllCourseVideosByTopicIdHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const topicIdParam = req.params['topicId'];
      if (!topicIdParam) {
        throw new ApiError('Topic ID is required', 400, 'MISSING_TOPIC_ID');
      }
      
      const topicId = parseInt(topicIdParam, 10);
      if (isNaN(topicId)) {
        throw new ApiError('Invalid topic ID', 400, 'INVALID_TOPIC_ID');
      }

      // Get student_id from query parameters
      const studentId = req.query['student_id'] ? parseInt(req.query['student_id'] as string, 10) : undefined;

      logger.debug('Getting all course videos by topic ID', {
        topicId,
        studentId,
        userType: req.user?.user_type,
        params: {
          page: params.page,
          limit: params.limit,
          search: params.filters?.['search']
        }
      });

      const result = await courseService.getAllCourseVideosByTopicId(
        topicId,
        studentId,
        req.user || undefined,
        params
      );

      return {
        items: result.items,
        total: result.total
      };
    },
    {
      message: 'Course videos retrieved successfully'
    }
  );

  /**
   * Get comprehensive video details by video ID including teacher info and navigation
   * @route GET /api/v1/videos/:videoId/details
   * @access Public (can be accessed with optional authentication)
   */
  static getVideoDetailsByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const videoIdParam = req.params['videoId'];
      if (!videoIdParam) {
        throw new ApiError('Video ID is required', 400, 'MISSING_VIDEO_ID');
      }
      
      const videoId = parseInt(videoIdParam, 10);
      if (isNaN(videoId)) {
        throw new ApiError('Invalid video ID', 400, 'INVALID_VIDEO_ID');
      }

      logger.debug('Getting video details by ID', {
        videoId,
        userType: req.user?.user_type
      });

      return await courseService.getVideoDetailsById(
        videoId,
        req.user || undefined
      );
    },
    {
      message: 'Video details retrieved successfully'
    }
  );

  /**
   * Get courses by programs and specialization for current student (profile-based)
   * @route GET /api/v1/student/profile/courses/discover
   * @access Private (STUDENT only)
   */
  static getStudentProfileCoursesByProgramsAndSpecializationHandler = createListHandler(
    async (_paginationParams: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Ensure the user is a student
      if (requestingUser.user_type !== UserType.STUDENT) {
        throw new ApiError('Only students can access this endpoint', 403, 'FORBIDDEN');
      }

      // Find the student record using the user's email
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

      // Build params from query parameters (excluding student_id)
      const params: GetCoursesByProgramsAndSpecializationDto = {
        course_type: req.query['course_type'] as string,
        program_id: req.query['program_id'] ? parseInt(req.query['program_id'] as string, 10) : undefined,
        specialization_id: req.query['specialization_id'] ? parseInt(req.query['specialization_id'] as string, 10) : undefined,
        search_query: req.query['search_query'] as string,
        student_id: student.student_id // Use student_id from token instead of query param
      };

      logger.debug('Getting courses by programs and specialization for student profile', {
        params,
        studentId: student.student_id,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });

      const result = await courseService.getCoursesByProgramsAndSpecialization(
        params,
        student.student_id
      );

      return {
        items: result,
        total: result.length
      };
    },
    {
      message: 'Courses retrieved successfully'
    }
  );

  /**
   * Get course basic details for current student (profile-based)
   * @route GET /api/v1/student/profile/courses/:courseId/basic-details
   * @access Private (STUDENT only)
   */
  static getStudentProfileCourseBasicDetailsHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Ensure the user is a student
      if (requestingUser.user_type !== UserType.STUDENT) {
        throw new ApiError('Only students can access this endpoint', 403, 'FORBIDDEN');
      }

      const courseIdParam = req.params['courseId'];
      if (!courseIdParam) {
        throw new ApiError('Course ID is required', 400, 'MISSING_COURSE_ID');
      }
      
      const courseId = parseInt(courseIdParam, 10);
      if (isNaN(courseId)) {
        throw new ApiError('Invalid course ID', 400, 'INVALID_COURSE_ID');
      }

      // Find the student record using the user's email
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

      logger.debug('Getting course basic details for student profile', {
        courseId,
        studentId: student.student_id,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });

      return await courseService.getCourseBasicDetails(
        courseId,
        student.student_id, // Use student_id from token instead of query param
        requestingUser
      );
    },
    {
      message: 'Course basic details retrieved successfully'
    }
  );
}
