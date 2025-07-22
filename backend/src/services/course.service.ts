import { PrismaClient, CourseStatus, CourseType } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto } from '@/dtos/course/course.dto';
import { 
  GetCoursesByProgramsAndSpecializationDto, 
  CourseByProgramsAndSpecializationResponse 
} from '@/dtos/course/course-by-programs-specialization.dto';
import { 
  CourseBasicDetailsResponse 
} from '@/dtos/course/course-basic-details.dto';
import { 
  CourseModuleResponse 
} from '@/dtos/course/course-modules.dto';
import { 
  CourseTopicsByModuleResponse 
} from '@/dtos/course/course-topics-by-module.dto';
import { 
  CourseVideosByTopicResponse 
} from '@/dtos/course/course-videos-by-topic.dto';
import { 
  VideoDetailsByIdResponse 
} from '@/dtos/course/video-details-by-id.dto';
import { NotFoundError, ConflictError, ForbiddenError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { getPrismaQueryOptions, SortOrder } from '@/utils/pagination.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters, SafeFilterParams } from '@/utils/async-handler.utils';
import { formatDateRange, formatDecimalHours } from '@/utils/date-format.utils';
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

  async getCoursesByProgramsAndSpecialization(
    params: GetCoursesByProgramsAndSpecializationDto,
    requestingStudentId?: number
  ): Promise<CourseByProgramsAndSpecializationResponse[]> {
    return tryCatch(async () => {
      logger.debug('Getting courses by programs and specialization', {
        params,
        requestingStudentId
      });

      // Get student's tenant_id if student_id is provided
      let tenantId: number | null = null;
      const studentId = params.student_id || requestingStudentId;
      
      if (studentId) {
        const student = await prisma.student.findFirst({
          where: {
            student_id: studentId,
            is_active: true,
            is_deleted: false
          },
          select: {
            tenant_id: true
          }
        });
        if (!student) {
          throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
        }
        tenantId = student.tenant_id;
      }

      // Build base include object
      const includeQuery: any = {
        // Include course sessions for dates
        course_sessions: {
          where: {
            is_active: true,
            is_deleted: false
          },
          select: {
            start_date: true,
            end_date: true
          },
          orderBy: {
            start_date: 'asc'
          },
          take: 1
        },
        // Include teacher information
        teacher_courses: {
          where: {
            is_active: true,
            is_deleted: false
          },
          include: {
            teacher: {
              select: {
                full_name: true,
                profile_picture_url: true,
                teacher_qualification: true
              }
            }
          },
          take: 1
        },
        // Include program information through specialization
        course_specialization: {
          where: {
            is_active: true,
            is_deleted: false
          },
          include: {
            specialization: {
              include: {
                specialization_program: {
                  where: {
                    is_active: true,
                    is_deleted: false
                  },
                  include: {
                    program: {
                      select: {
                        program_id: true,
                        program_name: true
                      }
                    }
                  },
                  take: 1
                }
              }
            }
          },
          take: 1
        }
      };

      // Conditionally add enrollments if studentId is provided
      if (studentId) {
        includeQuery.enrollments = {
          where: {
            student_id: studentId,
            is_active: true,
            is_deleted: false
          },
          select: {
            student_id: true,
            course_enrollment_type: true
          }
        };
      }

      // Build the complex query similar to the PostgreSQL function
      const courses = await prisma.course.findMany({
        where: {
          is_active: true,
          is_deleted: false,
          course_status: CourseStatus.PUBLIC,
          ...(tenantId && { tenant_id: tenantId }),
          // Course name search filter
          ...(params.search_query && {
            course_name: {
              contains: params.search_query,
              mode: 'insensitive'
            }
          }),
          // Course type filter
          ...(params.course_type && params.course_type !== 'PURCHASED' && {
            course_type: params.course_type as CourseType
          }),
          // Join conditions for specializations and programs
          course_specialization: {
            some: {
              is_active: true,
              is_deleted: false,
              specialization: {
                is_active: true,
                is_deleted: false,
                ...(params.specialization_id && params.specialization_id !== -1 && {
                  specialization_id: params.specialization_id
                }),
                specialization_program: {
                  some: {
                    is_active: true,
                    is_deleted: false,
                    ...(params.program_id && params.program_id !== -1 && {
                      program_id: params.program_id
                    })
                  }
                }
              }
            }
          }
        },
        include: includeQuery
      });

      // Filter courses based on course_type = 'PURCHASED' if specified
      let filteredCourses = courses;
      if (params.course_type === 'PURCHASED' && studentId) {
        filteredCourses = courses.filter((course: any) => 
          course.enrollments && Array.isArray(course.enrollments) && course.enrollments.length > 0 &&
          course.enrollments.some((enrollment: any) => 
            ['PAID_COURSE', 'FREE_COURSE', 'COURSE_SESSION'].includes(enrollment.course_enrollment_type)
          )
        );
      }

      // Transform the results to match the expected response format
      const transformedCourses: CourseByProgramsAndSpecializationResponse[] = filteredCourses.map((course: any) => {
        const enrollment = course.enrollments && Array.isArray(course.enrollments) && course.enrollments.length > 0 ? course.enrollments[0] : null;
        const teacher = course.teacher_courses && course.teacher_courses.length > 0 ? course.teacher_courses[0].teacher : null;
        const courseSession = course.course_sessions && course.course_sessions.length > 0 ? course.course_sessions[0] : null;
        const program = course.course_specialization && course.course_specialization.length > 0 && 
                       course.course_specialization[0].specialization.specialization_program &&
                       course.course_specialization[0].specialization.specialization_program.length > 0 
                       ? course.course_specialization[0].specialization.specialization_program[0].program 
                       : null;

        // Calculate purchase status
        let purchaseStatus: string;
        if (!enrollment && (!course.course_price || course.course_price.toNumber() === 0)) {
          purchaseStatus = 'Free';
        } else if (!enrollment && course.course_price && course.course_price.toNumber() > 0) {
          purchaseStatus = `Buy: $${course.course_price.toNumber()}`;
        } else if (enrollment) {
          purchaseStatus = 'Purchased';
        } else {
          purchaseStatus = 'N/A';
        }

        // Format dates
        const formattedDates = formatDateRange(
          courseSession?.start_date || null,
          courseSession?.end_date || null
        );

        // Format hours
        const formattedHours = formatDecimalHours(
          course.course_total_hours ? course.course_total_hours.toNumber() : null
        );

        return {
          course_id: course.course_id,
          course_name: course.course_name,
          start_date: formattedDates.start_date,
          end_date: formattedDates.end_date,
          program_name: program?.program_name || null,
          teacher_name: teacher?.full_name || null,
          course_total_hours: formattedHours,
          profile_picture_url: teacher?.profile_picture_url || null,
          teacher_qualification: teacher?.teacher_qualification || null,
          program_id: program?.program_id || null,
          purchase_status: purchaseStatus
        };
      });

      return transformedCourses;
    }, {
      context: {
        params,
        requestingStudentId
      }
    });
  }

  /**
   * Get course basic details
   * 
   * @param courseId Course identifier
   * @param studentId Optional student identifier for enrollment and progress data
   * @param requestingUser User requesting the data
   * @returns Course basic details with comprehensive information
   */
  async getCourseBasicDetails(
    courseId: number,
    studentId?: number,
    requestingUser?: TokenPayload
  ): Promise<CourseBasicDetailsResponse> {
    return tryCatch(async () => {
      logger.debug('Getting course basic details', {
        courseId,
        studentId,
        requestingUserId: requestingUser?.id
      });

      // Get course with all related data
      const course = await prisma.course.findFirst({
        where: {
          course_id: courseId,
          is_active: true,
          is_deleted: false
        },
        include: {
          // Get teacher information
          teacher_courses: {
            where: {
              is_active: true,
              is_deleted: false
            },
            include: {
              teacher: {
                select: {
                  full_name: true,
                  profile_picture_url: true
                }
              }
            },
            take: 1
          },
          // Get course sessions for dates
          course_sessions: {
            where: {
              is_active: true,
              is_deleted: false
            },
            select: {
              start_date: true,
              end_date: true
            },
            orderBy: {
              start_date: 'asc'
            },
            take: 1
          },
          // Get course specializations to get program and specialization names
          course_specialization: {
            where: {
              is_active: true,
              is_deleted: false
            },
            include: {
              specialization: {
                select: {
                  specialization_name: true,
                  specialization_program: {
                    where: {
                      is_active: true,
                      is_deleted: false
                    },
                    include: {
                      program: {
                        select: {
                          program_name: true
                        }
                      }
                    },
                    take: 1
                  }
                }
              }
            },
            take: 1
          }
        }
      });

      if (!course) {
        throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
      }

      // Get enrollment data if student_id is provided
      let enrollment = null;
      if (studentId) {
        enrollment = await prisma.enrollment.findFirst({
          where: {
            course_id: courseId,
            student_id: studentId,
            is_active: true,
            is_deleted: false
          }
        });
      }

      // Get student progress if student_id is provided
      let progress = null;
      if (studentId) {
        progress = await prisma.studentCourseProgress.findFirst({
          where: {
            course_id: courseId,
            student_id: studentId,
            is_active: true,
            is_deleted: false
          },
          select: {
            overall_progress_percentage: true
          }
        });
      }

      // Extract data from related objects
      const teacher = course.teacher_courses[0]?.teacher;
      const courseSession = course.course_sessions[0];
      const courseSpecialization = course.course_specialization[0];
      const specialization = courseSpecialization?.specialization;
      const specializationProgram = specialization?.specialization_program[0];

      // Determine purchase status
      let purchaseStatus: string;
      if (enrollment) {
        purchaseStatus = 'PURCHASED';
      } else {
        purchaseStatus = course.course_type;
      }

      // Format dates
      const formattedDates = formatDateRange(
        courseSession?.start_date || null,
        courseSession?.end_date || null
      );

      // Format the response
      const result: CourseBasicDetailsResponse = {
        course_id: course.course_id,
        course_name: course.course_name,
        course_description: course.course_description,
        overall_progress_percentage: progress?.overall_progress_percentage || null,
        teacher_name: teacher?.full_name || null,
        profile_picture_url: teacher?.profile_picture_url || null,
        start_date: formattedDates.start_date,
        end_date: formattedDates.end_date,
        purchase_status: purchaseStatus,
        program_name: specializationProgram?.program?.program_name || null,
        specialization_name: specialization?.specialization_name || null
      };

      return result;
    }, {
      context: {
        courseId,
        studentId,
        requestingUser: requestingUser ? { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId } : null
      }
    });
  }

  /**
   * Get course modules with statistics
   * 
   * @param courseId Course identifier
   * @param requestingUser User requesting the data
   * @returns List of course modules with topic and video counts
   */
  async getCourseModules(
    courseId: number,
    requestingUser?: TokenPayload
  ): Promise<CourseModuleResponse[]> {
    return tryCatch(async () => {
      logger.debug('Getting course modules', {
        courseId,
        requestingUserId: requestingUser?.id
      });

      // First verify the course exists and is accessible
      const course = await prisma.course.findFirst({
        where: {
          course_id: courseId,
          is_active: true,
          is_deleted: false
        }
      });

      if (!course) {
        throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
      }

      // Get all course modules for the specified course
      const courseModules = await prisma.courseModule.findMany({
        where: {
          course_id: courseId,
          is_active: true,
          is_deleted: false
        },
        orderBy: {
          position: 'asc'
        }
      });

      // For each module, get the statistics
      const modulesWithStats = await Promise.all(
        courseModules.map(async (module) => {
          // Count topics in this module
          const topicsCount = await prisma.courseTopic.count({
            where: {
              module_id: module.course_module_id,
              is_active: true,
              is_deleted: false
            }
          });

          // Count videos across all topics in this module
          const videosCount = await prisma.courseVideo.count({
            where: {
              course_topic_id: {
                in: await prisma.courseTopic.findMany({
                  where: {
                    module_id: module.course_module_id,
                    is_active: true,
                    is_deleted: false
                  },
                  select: {
                    course_topic_id: true
                  }
                }).then(topics => topics.map(topic => topic.course_topic_id))
              },
              is_active: true,
              is_deleted: false
            }
          });

          // Format the module stats string to match the PostgreSQL function
          const moduleStats = `${topicsCount} Topics  |  ${videosCount} Video Lectures`;

          return {
            course_module_id: module.course_module_id,
            course_module_name: module.course_module_name,
            module_stats: moduleStats
          };
        })
      );

      return modulesWithStats;
    }, {
      context: {
        courseId,
        requestingUser: requestingUser ? { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId } : null
      }
    });
  }

  /**
   * Get course topics by module ID with video lecture statistics
   * 
   * @param moduleId Module identifier
   * @param requestingUser User requesting the data
   * @returns List of course topics with video lecture counts
   */
  async getCourseTopicsByModuleId(
    moduleId: number,
    requestingUser?: TokenPayload
  ): Promise<CourseTopicsByModuleResponse[]> {
    return tryCatch(async () => {
      logger.debug('Getting course topics by module ID', {
        moduleId,
        requestingUserId: requestingUser?.id
      });

      // First verify the module exists and is accessible
      const module = await prisma.courseModule.findFirst({
        where: {
          course_module_id: moduleId,
          is_active: true,
          is_deleted: false
        }
      });

      if (!module) {
        throw new NotFoundError('Course module not found', 'MODULE_NOT_FOUND');
      }

      // Get all course topics for the specified module
      const courseTopics = await prisma.courseTopic.findMany({
        where: {
          module_id: moduleId,
          is_active: true,
          is_deleted: false
        },
        orderBy: {
          position: 'asc'
        }
      });

      // Get video counts for all topics in one query for performance
      const topicIds = courseTopics.map((topic: any) => topic.course_topic_id);
      const videoCounts = await prisma.courseVideo.groupBy({
        by: ['course_topic_id'],
        where: {
          course_topic_id: { in: topicIds },
          is_active: true,
          is_deleted: false
        },
        _count: {
          course_video_id: true
        }
      });

      // Create a map for quick lookup of video counts
      const videoCountMap = new Map<number, number>();
      videoCounts.forEach((count: any) => {
        videoCountMap.set(count.course_topic_id, count._count.course_video_id);
      });

      // Format the response with video lecture counts
      const topicsWithStats: CourseTopicsByModuleResponse[] = courseTopics.map((topic: any) => {
        const videoCount = videoCountMap.get(topic.course_topic_id) || 0;
        return {
          course_topic_id: topic.course_topic_id,
          course_topic_name: topic.course_topic_name,
          overall_video_lectures: `${videoCount} Video Lectures`,
          position: topic.position,
          is_active: topic.is_active,
          created_at: topic.created_at,
          updated_at: topic.updated_at
        };
      });

      return topicsWithStats;
    }, {
      context: {
        moduleId,
        requestingUser: requestingUser ? { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId } : null
      }
    });
  }

  /**
   * Get all course videos by topic ID with progress tracking and locking logic
   * 
   * @param topicId Topic identifier
   * @param studentId Optional student identifier for progress tracking
   * @param requestingUser User requesting the data
   * @returns List of course videos with progress and locking information
   */
  async getAllCourseVideosByTopicId(
    topicId: number,
    studentId?: number,
    requestingUser?: TokenPayload
  ): Promise<CourseVideosByTopicResponse[]> {
    return tryCatch(async () => {
      logger.debug('Getting all course videos by topic ID', {
        topicId,
        studentId,
        requestingUserId: requestingUser?.id
      });

      // First verify the topic exists and is accessible
      const topic = await prisma.courseTopic.findFirst({
        where: {
          course_topic_id: topicId,
          is_active: true,
          is_deleted: false
        }
      });

      if (!topic) {
        throw new NotFoundError('Course topic not found', 'TOPIC_NOT_FOUND');
      }

      // Get all course videos for the specified topic
      const courseVideos = await prisma.courseVideo.findMany({
        where: {
          course_topic_id: topicId,
          is_active: true,
          is_deleted: false
        },
        orderBy: {
          position: 'asc'
        }
      });

      // Get video progress data for the student if provided
      let videoProgressMap = new Map<number, any>();
      if (studentId) {
        const videoProgresses = await prisma.videoProgress.findMany({
          where: {
            course_video_id: { in: courseVideos.map((video: any) => video.course_video_id) },
            student_id: studentId,
            is_active: true,
            is_deleted: false
          }
        });

        videoProgresses.forEach((progress: any) => {
          videoProgressMap.set(progress.course_video_id, progress);
        });
      }

      // Find the minimum position (first video) for locking logic
      const minPosition = courseVideos.length > 0 ? Math.min(...courseVideos.map((video: any) => video.position)) : 0;

      // Format the response with progress and locking logic
      const videosWithProgress: CourseVideosByTopicResponse[] = courseVideos.map((video: any) => {
        const progress = videoProgressMap.get(video.course_video_id);
        
        // Determine completion status
        let completionStatus = 'Pending';
        if (progress) {
          if (progress.completion_percentage === 100) {
            completionStatus = 'Completed';
          } else if (progress.completion_percentage > 0 && progress.completion_percentage < 100) {
            completionStatus = 'In Completed';
          }
        }

        // Determine if video is locked
        let isVideoLocked = false;
        
        // First video is never locked
        if (video.position === minPosition) {
          isVideoLocked = false;
        } else if (studentId) {
          // Check if the previous video (by position) is completed
          const previousVideos = courseVideos.filter((v: any) => v.position < video.position);
          if (previousVideos.length > 0) {
            const maxPreviousPosition = Math.max(...previousVideos.map((v: any) => v.position));
            const previousVideo = courseVideos.find((v: any) => v.position === maxPreviousPosition);
            
            if (previousVideo) {
              const previousProgress = videoProgressMap.get(previousVideo.course_video_id);
              isVideoLocked = !previousProgress || !previousProgress.is_completed;
            }
          }
        } else {
          // If no student ID provided, lock all videos except the first one
          isVideoLocked = true;
        }

        return {
          course_video_id: video.course_video_id,
          position: video.position,
          video_name: video.video_name,
          duration_seconds: video.duration_seconds || 0,
          is_completed: progress ? progress.is_completed : null,
          completion_percentage: progress ? progress.completion_percentage : null,
          last_watched_at: progress ? progress.last_watched_at : null,
          completion_status: completionStatus,
          is_video_locked: isVideoLocked
        };
      });

      return videosWithProgress;
    }, {
      context: {
        topicId,
        studentId,
        requestingUser: requestingUser ? { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId } : null
      }
    });
  }

  /**
   * Get comprehensive video details by video ID including teacher info and navigation
   * 
   * @param videoId Video identifier
   * @param requestingUser User requesting the data
   * @returns Comprehensive video details with teacher information and navigation
   */
  async getVideoDetailsById(
    videoId: number,
    requestingUser?: TokenPayload
  ): Promise<VideoDetailsByIdResponse> {
    return tryCatch(async () => {
      logger.debug('Getting video details by ID', {
        videoId,
        requestingUserId: requestingUser?.id
      });

      // Get the main video with course and teacher information
      const video = await prisma.courseVideo.findFirst({
        where: {
          course_video_id: videoId,
          is_active: true,
          is_deleted: false
        },
        include: {
          course: {
            include: {
              teacher_courses: {
                where: {
                  is_active: true,
                  is_deleted: false
                },
                include: {
                  teacher: {
                    select: {
                      full_name: true,
                      teacher_qualification: true,
                      profile_picture_url: true
                    }
                  }
                },
                take: 1
              }
            }
          }
        }
      });

      if (!video) {
        throw new NotFoundError('Video not found', 'VIDEO_NOT_FOUND');
      }

      // Get next video in the same topic
      const nextVideo = await prisma.courseVideo.findFirst({
        where: {
          course_topic_id: video.course_topic_id,
          position: { gt: video.position || 0 },
          is_active: true,
          is_deleted: false
        },
        orderBy: {
          position: 'asc'
        },
        select: {
          course_video_id: true,
          video_name: true,
          duration_seconds: true
        }
      });

      // Get previous video in the same topic
      const previousVideo = await prisma.courseVideo.findFirst({
        where: {
          course_topic_id: video.course_topic_id,
          position: { lt: video.position || 0 },
          is_active: true,
          is_deleted: false
        },
        orderBy: {
          position: 'desc'
        },
        select: {
          course_video_id: true,
          video_name: true,
          duration_seconds: true
        }
      });

      // Extract teacher information
      const teacher = video.course?.teacher_courses[0]?.teacher;

      // Format the response with navigation information
      const result: VideoDetailsByIdResponse = {
        course_video_id: video.course_video_id,
        video_name: `Lecture:${video.position || 0} ${video.video_name}`,
        video_url: video.video_url || '',
        thumbnail_url: video.thumbnail_url,
        duration: video.duration_seconds || 0,
        position: video.position || 0,
        bunny_video_id: video.bunny_video_id,
        course_topic_id: video.course_topic_id,
        course_id: video.course_id,
        teacher_name: teacher?.full_name || null,
        teacher_qualification: teacher?.teacher_qualification || null,
        profile_picture_url: teacher?.profile_picture_url || null,
        next_course_video_id: nextVideo?.course_video_id || null,
        next_video_name: nextVideo?.video_name || null,
        next_video_duration: nextVideo?.duration_seconds || null,
        previous_course_video_id: previousVideo?.course_video_id || null,
        previous_video_name: previousVideo?.video_name || null,
        previous_video_duration: previousVideo?.duration_seconds || null
      };

      return result;
    }, {
      context: {
        videoId,
        requestingUser: requestingUser ? { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId } : null
      }
    });
  }
}

export const courseService = new CourseService();
export default courseService;
