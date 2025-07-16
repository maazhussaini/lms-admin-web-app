import { PrismaClient, CourseStatus, CourseType } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto } from '@/dtos/course/course.dto';
import { NotFoundError, ConflictError, ForbiddenError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { getPrismaQueryOptions, SortOrder } from '@/utils/pagination.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters, SafeFilterParams } from '@/utils/async-handler.utils';
import { UserType } from '@/types/enums.types';
import logger from '@/config/logger';

const prisma = new PrismaClient();

export class CourseService {
  async createCourse(
    data: CreateCourseDto,
    tenantId: number,
    adminUserId: number,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Creating course', {
        courseName: data.course_name,
        tenantId,
        adminUserId
      });

      // Check if course name exists within tenant
      const existingCourse = await prisma.course.findFirst({
        where: {
          course_name: data.course_name,
          tenant_id: tenantId,
          is_deleted: false
        }
      });
      if (existingCourse) {
        throw new ConflictError('Course name already exists within tenant', 'COURSE_NAME_EXISTS');
      }

      // Create course
      const course = await prisma.course.create({
        data: {
          tenant_id: tenantId,
          course_name: data.course_name,
          course_description: data.course_description || null,
          main_thumbnail_url: data.main_thumbnail_url || null,
          course_status: (data.course_status as CourseStatus) || CourseStatus.DRAFT,
          course_type: (data.course_type as CourseType) || CourseType.PAID,
          course_price: data.course_price || null,
          course_total_hours: data.course_total_hours || null,
          is_active: true,
          is_deleted: false,
          created_by: adminUserId,
          updated_by: adminUserId,
          created_ip: clientIp || null,
          updated_ip: clientIp || null
        }
      });
      return course;
    }, {
      context: {
        tenantId,
        adminUserId,
        courseName: data.course_name
      }
    });
  }

  async getCourseById(courseId: number, requestingUser: TokenPayload) {
    return tryCatch(async () => {
      logger.debug('Getting course by ID', {
        courseId,
        requestingUserId: requestingUser.id
      });
      let whereClause: any = {
        course_id: courseId,
        is_deleted: false
      };
      if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
        whereClause.tenant_id = requestingUser.tenantId;
      }
      const course = await prisma.course.findFirst({
        where: whereClause
      });
      if (!course) {
        throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
      }
      return course;
    }, {
      context: {
        courseId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  async getAllCourses(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return tryCatch(async () => {
      logger.debug('Getting all courses with params', {
        requestingUserId: requestingUser.id,
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      });
      const filters = this.buildCourseFilters(params.filters, requestingUser);
      const sorting = this.buildCourseSorting(params);
      const queryOptions = getPrismaQueryOptions(
        { page: params.page, limit: params.limit, skip: params.skip },
        sorting
      );
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where: filters,
          ...queryOptions
        }),
        prisma.course.count({ where: filters })
      ]);
      return {
        items: courses,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
          hasNext: params.page < Math.ceil(total / params.limit),
          hasPrev: params.page > 1
        }
      };
    }, {
      context: {
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId },
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      }
    });
  }

  async updateCourse(
    courseId: number,
    data: UpdateCourseDto,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Updating course', {
        courseId,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });
      let whereClause: any = {
        course_id: courseId,
        is_deleted: false
      };
      if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
        whereClause.tenant_id = requestingUser.tenantId;
      }
      const existingCourse = await prisma.course.findFirst({
        where: whereClause
      });
      if (!existingCourse) {
        if (requestingUser.user_type === UserType.SUPER_ADMIN) {
          throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
        } else {
          throw new ForbiddenError('Cannot update course from another tenant');
        }
      }
      const updateData: any = {
        updated_by: requestingUser.id,
        updated_at: new Date(),
        updated_ip: clientIp || null
      };
      if (data.course_name !== undefined) updateData.course_name = data.course_name;
      if (data.course_description !== undefined) updateData.course_description = data.course_description;
      if (data.main_thumbnail_url !== undefined) updateData.main_thumbnail_url = data.main_thumbnail_url;
      if (data.course_status !== undefined) updateData.course_status = data.course_status as CourseStatus;
      if (data.course_type !== undefined) updateData.course_type = data.course_type as CourseType;
      if (data.course_price !== undefined) updateData.course_price = data.course_price;
      if (data.course_total_hours !== undefined) updateData.course_total_hours = data.course_total_hours;
      const updatedCourse = await prisma.course.update({
        where: {
          course_id: courseId
        },
        data: updateData
      });
      return updatedCourse;
    }, {
      context: {
        courseId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  async deleteCourse(
    courseId: number,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Deleting course', {
        courseId,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });
      let whereClause: any = {
        course_id: courseId,
        is_deleted: false
      };
      if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
        whereClause.tenant_id = requestingUser.tenantId;
      }
      const existingCourse = await prisma.course.findFirst({
        where: whereClause
      });
      if (!existingCourse) {
        if (requestingUser.user_type === UserType.SUPER_ADMIN) {
          throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
        } else {
          throw new ForbiddenError('Cannot delete course from another tenant');
        }
      }
      await prisma.course.update({
        where: {
          course_id: courseId
        },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: requestingUser.id,
          updated_by: requestingUser.id,
          updated_at: new Date(),
          updated_ip: clientIp || null
        }
      });
      return { message: 'Course deleted successfully' };
    }, {
      context: {
        courseId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  private buildCourseFilters(filterParams: SafeFilterParams, requestingUser: TokenPayload): Record<string, any> {
    const where: Record<string, any> = {
      is_deleted: false
    };
    if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
      where['tenant_id'] = requestingUser.tenantId;
    }
    if (filterParams['search'] && typeof filterParams['search'] === 'string') {
      where['course_name'] = { contains: filterParams['search'], mode: 'insensitive' };
    }
    if (filterParams['course_status']) {
      where['course_status'] = filterParams['course_status'];
    }
    if (filterParams['course_type']) {
      where['course_type'] = filterParams['course_type'];
    }
    return where;
  }

  private buildCourseSorting(params: ExtendedPaginationWithFilters): Record<string, SortOrder> {
    const fieldMapping: Record<string, string> = {
      'courseId': 'course_id',
      'courseName': 'course_name',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'courseStatus': 'course_status',
      'courseType': 'course_type'
    };
    if (params.sorting && Object.keys(params.sorting).length > 0) {
      const mappedSorting: Record<string, SortOrder> = {};
      Object.entries(params.sorting).forEach(([field, order]) => {
        const dbField = fieldMapping[field] || field;
        mappedSorting[dbField] = order;
      });
      return mappedSorting;
    }
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    const dbField = fieldMapping[sortBy] || sortBy;
    return { [dbField]: sortOrder };
  }
}

export const courseService = new CourseService();
export default courseService;
