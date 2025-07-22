import { PrismaClient, CourseStatus, CourseType } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, CourseFilterDto } from '@/dtos/course/course.dto';
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
import { NotFoundError, ConflictError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { formatDateRange, formatDecimalHours } from '@/utils/date-format.utils';
import { formatDurationFromSeconds } from '@/utils/duration-format.utils';
import { BaseListService } from '@/utils/base-list.service';
import { BaseServiceConfig } from '@/utils/service.types';
import { COURSE_FIELD_MAPPINGS } from '@/utils/field-mapping.utils';
import { 
  buildSearchFilters,
  buildDateRangeFilter,
  buildEnumFilter,
  buildRangeFilter,
  mergeFilters
} from '@/utils/filter-builders.utils';
import { 
  buildEntityAccessFilters,
  updateAuditFields,
  deleteAuditFields
} from '@/utils/tenant-isolation.utils';
import logger from '@/config/logger';

const prisma = new PrismaClient();

export class CourseService extends BaseListService<any, CourseFilterDto> {
  private static instance: CourseService;

  private constructor() {
    // Configuration for the base service
    const config: BaseServiceConfig<CourseFilterDto> = {
      entityName: 'course',
      primaryKeyField: 'course_id',
      fieldMapping: COURSE_FIELD_MAPPINGS,
      filterConversion: {
        stringFields: ['courseName', 'description', 'status', 'level', 'search'],
        booleanFields: ['isActive', 'isPublished'],
        numberFields: ['programId', 'specializationId'],
        enumFields: {
          status: CourseStatus
        }
      },
      defaultSortField: 'created_at',
      defaultSortOrder: 'desc'
    };

    super(prisma, config);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  /**
   * Get Prisma table name
   */
  protected getTableName(): string {
    return 'course';
  }

  /**
   * Build entity-specific filters using utility functions
   */
  protected buildEntitySpecificFilters(
    filterDto: CourseFilterDto,
    baseFilters: Record<string, any>
  ): Record<string, any> {
    // Start with base filters (includes tenant isolation and soft delete protection)
    let filters = { ...baseFilters };

    // Build search filters using utility
    const searchFilters = this.buildSearchFilters(filterDto.search);
    if (searchFilters) {
      filters = mergeFilters(filters, searchFilters);
    }

    // Build individual field search filters
    filters = mergeFilters(filters, buildSearchFilters(filterDto.courseName, ['course_name']));
    filters = mergeFilters(filters, buildSearchFilters(filterDto.description, ['course_description']));
    
    // Build enum filters
    filters = mergeFilters(filters, buildEnumFilter(filterDto.status, CourseStatus, 'course_status'));
    
    // Apply individual field filters
    if (filterDto.level) filters['level'] = filterDto.level;
    if (filterDto.isActive !== undefined) filters['is_active'] = filterDto.isActive;
    if (filterDto.isPublished !== undefined) filters['is_published'] = filterDto.isPublished;

    // Handle durationInWeeks range filter
    if (filterDto.durationInWeeks) {
      filters = mergeFilters(filters, buildRangeFilter(
        filterDto.durationInWeeks.min,
        filterDto.durationInWeeks.max,
        'duration_in_weeks'
      ));
    }

    // Handle programId array filter
    if (filterDto.programId && filterDto.programId.length > 0) {
      filters['program_id'] = { in: filterDto.programId };
    }

    // Handle specializationId array filter
    if (filterDto.specializationId && filterDto.specializationId.length > 0) {
      filters['specialization_id'] = { in: filterDto.specializationId };
    }

    // Handle date range filter
    if (filterDto.dateRange) {
      const field = filterDto.dateRange.field === 'updatedAt' ? 'updated_at' : 'created_at';
      filters = mergeFilters(filters, buildDateRangeFilter(
        filterDto.dateRange.startDate,
        filterDto.dateRange.endDate,
        field
      ));
    }

    return filters;
  }
  /**
   * Get all courses with pagination, filtering, and sorting using modern utilities
   */
  async getAllCourses(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return this.getAllEntities(requestingUser, params);
  }

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

      // Create course with audit fields
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
          created_by: adminUserId,
          is_active: true,
          is_deleted: false,
          created_ip: clientIp || null,
          updated_by: adminUserId,
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
      
      const whereClause = buildEntityAccessFilters(
        courseId,
        requestingUser,
        'course_id'
      );
      
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
      
      const whereClause = buildEntityAccessFilters(
        courseId,
        requestingUser,
        'course_id'
      );
      
      const existingCourse = await prisma.course.findFirst({
        where: whereClause
      });
      
      if (!existingCourse) {
        throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
      }
      
      const updateData: any = {
        ...updateAuditFields(requestingUser, clientIp)
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
      
      const whereClause = buildEntityAccessFilters(
        courseId,
        requestingUser,
        'course_id'
      );
      
      const existingCourse = await prisma.course.findFirst({
        where: whereClause
      });
      
      if (!existingCourse) {
        throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
      }
      
      await prisma.course.update({
        where: {
          course_id: courseId
        },
        data: deleteAuditFields(requestingUser, clientIp)
      });
      
      return { message: 'Course deleted successfully' };
    }, {
      context: {
        courseId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  // Specialized methods with full business logic preserved

  /**
   * Get course basic details
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

      // Calculate purchase status and flags
      let purchaseStatus: string;
      const isPurchased = enrollment !== null;
      const isFree = !course.course_price || course.course_price.toNumber() === 0;
      
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
        specialization_name: specialization?.specialization_name || null,
        is_purchased: isPurchased,
        is_free: isFree
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
          duration_formatted: formatDurationFromSeconds(video.duration_seconds),
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
        duration_formatted: formatDurationFromSeconds(video.duration_seconds),
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
        next_video_duration_formatted: formatDurationFromSeconds(nextVideo?.duration_seconds || null),
        previous_course_video_id: previousVideo?.course_video_id || null,
        previous_video_name: previousVideo?.video_name || null,
        previous_video_duration: previousVideo?.duration_seconds || null,
        previous_video_duration_formatted: formatDurationFromSeconds(previousVideo?.duration_seconds || null)
      };

      return result;
    }, {
      context: {
        videoId,
        requestingUser: requestingUser ? { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId } : null
      }
    });
  }

  /**
   * Get courses by programs and specialization with complex filtering
   */
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

        // Calculate purchase status and flags
        let purchaseStatus: string;
        const isPurchased = enrollment !== null;
        const isFree = !course.course_price || course.course_price.toNumber() === 0;
        
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
          purchase_status: purchaseStatus,
          is_purchased: isPurchased,
          is_free: isFree
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
}

export const courseService = CourseService.getInstance();
export default courseService;
