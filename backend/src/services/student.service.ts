/**
 * @file services/student.service.ts
 * @description Service for managing students with modern BaseListService pattern
 */

import { PrismaClient, CourseStatus } from '@prisma/client';
import {
  CreateStudentDto,
  UpdateStudentDto,
  UpdateStudentProfileDto,
  StudentFilterDto
} from '@/dtos/student/student.dto';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { formatDateRangeShort, formatDecimalHours } from '@/utils/date-format.utils';
import { 
  StudentStatus,
  Gender,
  UserType,
  EnrollmentStatus
} from '@/types/enums.types';
import logger from '@/config/logger';
import { BaseListService, BaseListServiceConfig } from '@/utils/base-list.service';
import { STUDENT_FIELD_MAPPINGS } from '@/utils/field-mapping.utils';
import { hashPassword } from '@/utils/password.utils';
import { env } from '@/config/environment';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Configuration for Student service operations
 */
const STUDENT_SERVICE_CONFIG: BaseListServiceConfig = {
  entityName: 'student',
  primaryKeyField: 'student_id',
  fieldMapping: STUDENT_FIELD_MAPPINGS,
  filterConversion: {
    stringFields: ['search'],
    booleanFields: [],
    numberFields: ['countryId', 'stateId', 'cityId', 'ageMin', 'ageMax'],
    enumFields: {
      status: StudentStatus,
      gender: Gender
    }
  },
  defaultSortField: 'created_at',
  defaultSortOrder: 'desc',
  searchFields: ['full_name', 'first_name', 'last_name', 'username'],
  searchRelations: {
    emails: ['email_address']
  }
};

export class StudentService extends BaseListService<any, StudentFilterDto> {
  private static instance: StudentService;

  private constructor() {
    super(prisma, STUDENT_SERVICE_CONFIG);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StudentService {
    if (!StudentService.instance) {
      StudentService.instance = new StudentService();
    }
    return StudentService.instance;
  }

  /**
   * Get table name for queries
   */
  protected getTableName(): string {
    return 'student';
  }

  /**
   * Get include options for queries
   */
  protected override getIncludeOptions(): any {
    return {
      include: {
        emails: {
          where: {
            is_primary: true,
            is_deleted: false
          },
          select: {
            email_address: true
          },
          take: 1
        }
      }
    };
  }

  /**
   * Build entity-specific filters
   */
  protected buildEntitySpecificFilters(filters: StudentFilterDto): any {
    const whereClause: any = {};

    // Age range filtering
    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
      whereClause.age = {};
      if (filters.ageMin !== undefined) {
        whereClause.age.gte = filters.ageMin;
      }
      if (filters.ageMax !== undefined) {
        whereClause.age.lte = filters.ageMax;
      }
    }

    // Geographic filters
    if (filters.countryId !== undefined) {
      whereClause.country_id = filters.countryId;
    }
    if (filters.stateId !== undefined) {
      whereClause.state_id = filters.stateId;
    }
    if (filters.cityId !== undefined) {
      whereClause.city_id = filters.cityId;
    }

    // Status and gender filters
    if (filters.status !== undefined) {
      whereClause.student_status = filters.status;
    }
    if (filters.gender !== undefined) {
      whereClause.gender = filters.gender;
    }

    return whereClause;
  }

  /**
   * Format entity response
   */
  protected formatEntityResponse(entity: any): any {
    const { password_hash, ...studentWithoutPassword } = entity;
    
    // Format response to include primary email address directly
    return {
      ...studentWithoutPassword,
      primary_email: entity.emails?.[0]?.email_address || null
    };
  }

  /**
   * Create a new student
   * 
   * @param data Student data from validated DTO
   * @param requestingUser User requesting the student creation
   * @param clientIp IP address of the request
   * @returns Newly created student
   */
  async createStudent(
    data: CreateStudentDto,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
   
   
    // Validate that we have a requesting user
    // if (!requestingUser || !requestingUser.user_type) {
    //   throw new BadRequestError('Invalid requesting user context');
    // }

    // Determine tenant ID based on user type
    let tenantId: number;
    
    if (requestingUser.user_type === UserType.SUPER_ADMIN) {
      // SUPER_ADMIN must provide tenant_id in request body
      if (!data.tenant_id) {
        throw new BadRequestError('Tenant ID is required when creating a student as SUPER_ADMIN', 'MISSING_TENANT_ID');
      }
      tenantId = data.tenant_id;
    } 
    else {
      // Regular admins use their own tenant
      if (!requestingUser.tenantId) {
        throw new BadRequestError('Tenant ID is required', 'MISSING_TENANT_ID');
      }
      tenantId = requestingUser.tenantId;
      
      // Ignore tenant_id from body for non-SUPER_ADMIN users
      // if (data.tenant_id && data.tenant_id !== tenantId) {
      //   logger.warn('Non-SUPER_ADMIN user attempted to specify different tenant_id', {
      //     userId: requestingUser.id,
      //     userType: requestingUser.user_type ?? UserType.STUDENT,
      //     requestedTenantId: data.tenant_id,
      //     userTenantId: tenantId
      //   });
      // }
    }

    return tryCatch(async () => {

      // Check if username exists within tenant
      const existingUsername = await prisma.student.findFirst({
        where: {
          username: data.username,
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (existingUsername) {
        throw new ConflictError('Username already exists in this tenant', 'DUPLICATE_USERNAME');
      }

      // Check if primary email address exists within tenant
      const existingEmail = await prisma.studentEmailAddress.findFirst({
        where: {
          email_address: data.email_address,
          tenant_id: tenantId,
          is_deleted: false
        }
      });

      if (existingEmail) {
        throw new ConflictError('Email address already exists in this tenant', 'DUPLICATE_EMAIL');
      }

      // Hash the password
      const passwordHash = await hashPassword(data.password);

      // Create student and associated email address within transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the student
        const newStudent = await tx.student.create({
          data: {
            tenant_id: tenantId,
            full_name: data.full_name,
            first_name: data.first_name,
            middle_name: data.middle_name || null,
            last_name: data.last_name,
            username: data.username,
            password_hash: passwordHash,
            country_id: data.country_id,
            state_id: data.state_id,
            city_id: data.city_id,
            address: data.address || null,
            date_of_birth: data.date_of_birth || null,
            profile_picture_url: data.profile_picture_url || null,
            zip_code: data.zip_code || null,
            age: data.age || null,
            gender: data.gender || null,
            student_status: data.student_status || StudentStatus.ACTIVE,
            referral_type: data.referral_type || null,
            created_ip: clientIp || null,
            updated_ip: clientIp || null,
            created_by: !requestingUser.id ? null : requestingUser.id,
            updated_by: !requestingUser.id ? null : requestingUser.id
          }
        });

        // Create the primary email address
        await tx.studentEmailAddress.create({
          data: {
            student_id: newStudent.student_id,
            tenant_id: tenantId,
            email_address: data.email_address,
            is_primary: true,
            created_ip: clientIp || null,
            updated_ip: clientIp || null,
            created_by: requestingUser.id || 0,
            updated_by: requestingUser.id || 0
          }
        });

        return newStudent;
      });

      // Return the created student (without password_hash)
      const { password_hash, ...studentWithoutPassword } = result;
      return studentWithoutPassword;
    }, {
      context: {
        tenantId: 1,
        requestingUser: { id: 1, role: UserType.STUDENT, tenantId: 1 },
        username: data.username
      }
      // context: {
      //   tenantId,
      //   requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId },
      //   username: data.username
      // }
    });
  }

  /**
   * Get student by ID
   * 
   * @param studentId Student identifier
   * @param requestingUser User requesting the student
   * @returns Student if found
   */
  async getStudentById(studentId: number, requestingUser: TokenPayload) {
    return tryCatch(async () => {
      logger.debug('Getting student by ID', {
        studentId,
        requestingUserId: requestingUser.id
      });

      // Build where clause based on user permissions
      let whereClause: any = {
        student_id: studentId,
        is_deleted: false
      };

      // Super Admin can access any student
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        // No additional tenant restriction needed
      } else {
        // Other users are restricted to their tenant
        whereClause.tenant_id = requestingUser.tenantId;
      }

      // Get student with primary email address
      const student = await prisma.student.findFirst({
        where: whereClause,
        include: {
          emails: {
            where: {
              is_primary: true,
              is_deleted: false
            },
            take: 1
          }
        }
      });

      if (!student) {
        throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
      }

      return this.formatEntityResponse(student);
    }, {
      context: {
        studentId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Get all students with pagination, sorting, and filtering
   * Uses the modern BaseListService pattern
   * 
   * @param requestingUser User requesting the students
   * @param params Extended pagination with filters
   * @returns List response with students and pagination metadata
   */
  async getAllStudents(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return tryCatch(async () => {
      logger.debug('Getting all students with params', {
        requestingUserId: requestingUser.id,
        params: {
          page: params.page,
          limit: params.limit,
          filters: Object.keys(params.filters)
        }
      });

      // Use the BaseListService getAllEntities method
      const result = await this.getAllEntities(requestingUser, params);
      
      // Format the response to match the expected structure
      const formattedStudents = result.items.map(student => this.formatEntityResponse(student));

      return {
        items: formattedStudents,
        pagination: result.pagination
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

  /**
   * Update student by ID
   * 
   * @param studentId Student identifier
   * @param data Update data from validated DTO
   * @param requestingUser User requesting the update
   * @param clientIp IP address of the request
   * @returns Updated student
   */
  async updateStudent(
    studentId: number, 
    data: UpdateStudentDto, 
    requestingUser: TokenPayload, 
    clientIp?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Updating student', {
        studentId,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });

      // First, get the existing student to determine tenant context
      let whereClause: any = {
        student_id: studentId,
        is_deleted: false
      };

      // For non-SUPER_ADMIN users, restrict to their tenant
      if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
        whereClause.tenant_id = requestingUser.tenantId;
      }

      const existingStudent = await prisma.student.findFirst({
        where: whereClause
      });

      if (!existingStudent) {
        throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
      }

      // Log tenant context for SUPER_ADMIN operations
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        logger.debug('SUPER_ADMIN updating student in different tenant', {
          requestingUserId: requestingUser.id,
          studentId,
          studentTenantId: existingStudent.tenant_id,
          adminTenantId: requestingUser.tenantId
        });
      }

      // Build update data
      const updateData: any = {
        updated_by: requestingUser.id,
        updated_at: new Date(),
        updated_ip: clientIp || null
      };

      // Only include fields that are provided in the update data
      if (data.full_name !== undefined) updateData.full_name = data.full_name;
      if (data.first_name !== undefined) updateData.first_name = data.first_name;
      if (data.middle_name !== undefined) updateData.middle_name = data.middle_name;
      if (data.last_name !== undefined) updateData.last_name = data.last_name;
      if (data.country_id !== undefined) updateData.country_id = data.country_id;
      if (data.state_id !== undefined) updateData.state_id = data.state_id;
      if (data.city_id !== undefined) updateData.city_id = data.city_id;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth;
      if (data.profile_picture_url !== undefined) updateData.profile_picture_url = data.profile_picture_url;
      if (data.zip_code !== undefined) updateData.zip_code = data.zip_code;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.student_status !== undefined) updateData.student_status = data.student_status;
      if (data.referral_type !== undefined) updateData.referral_type = data.referral_type;

      // Update the student
      const updatedStudent = await prisma.student.update({
        where: {
          student_id: studentId
        },
        data: updateData
      });

      // Return the updated student (without password_hash)
      const { password_hash, ...studentWithoutPassword } = updatedStudent;
      return studentWithoutPassword;
    }, {
      context: {
        studentId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Soft delete student by ID
   * 
   * @param studentId Student identifier
   * @param requestingUser User requesting the deletion
   * @param clientIp IP address of the request
   * @returns Success message
   */
  async deleteStudent(
    studentId: number, 
    requestingUser: TokenPayload, 
    clientIp?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Deleting student', {
        studentId,
        requestingUserId: requestingUser.id,
        userType: requestingUser.user_type
      });

      // First, get the existing student to determine tenant context
      let whereClause: any = {
        student_id: studentId,
        is_deleted: false
      };

      // For non-SUPER_ADMIN users, restrict to their tenant
      if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
        whereClause.tenant_id = requestingUser.tenantId;
      }

      const existingStudent = await prisma.student.findFirst({
        where: whereClause
      });

      if (!existingStudent) {
        throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
      }

      // Log tenant context for SUPER_ADMIN operations
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        logger.debug('SUPER_ADMIN deleting student in different tenant', {
          requestingUserId: requestingUser.id,
          studentId,
          studentTenantId: existingStudent.tenant_id,
          adminTenantId: requestingUser.tenantId
        });
      }

      // Soft delete by updating is_deleted flag and related fields
      await prisma.student.update({
        where: {
          student_id: studentId
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

      return { message: 'Student deleted successfully' };
    }, {
      context: {
        studentId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Get student's own profile
   * 
   * @param requestingUser The authenticated student user
   * @returns Student profile without sensitive information
   */
  async getStudentProfile(requestingUser: TokenPayload) {
    return tryCatch(async () => {
      logger.debug('Getting student profile', {
        userId: requestingUser.id,
        tenantId: requestingUser.tenantId,
        userType: requestingUser.user_type
      });

      // Only students can access their own profile via this method
      if (requestingUser.user_type !== UserType.STUDENT) {
        throw new ForbiddenError('Only students can access student profiles', 'FORBIDDEN');
      }

      // Find student record by email matching the authenticated user
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
        include: {
          emails: {
            where: {
              is_primary: true,
              is_deleted: false
            },
            select: {
              email_address: true
            },
            take: 1
          }
        }
      });

      if (!student) {
        throw new NotFoundError('Student profile not found', 'STUDENT_NOT_FOUND');
      }

      return this.formatEntityResponse(student);
    }, {
      context: {
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Update student's own profile (limited fields)
   * 
   * @param data Profile update data from validated DTO
   * @param requestingUser The authenticated student user
   * @param clientIp IP address of the request
   * @returns Updated student profile
   */
  async updateStudentProfile(
    data: UpdateStudentProfileDto,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Updating student profile', {
        userId: requestingUser.id,
        tenantId: requestingUser.tenantId,
        userType: requestingUser.user_type
      });

      // Only students can update their own profile via this method
      if (requestingUser.user_type !== UserType.STUDENT) {
        throw new ForbiddenError('Only students can update student profiles', 'FORBIDDEN');
      }

      // Find student record by email matching the authenticated user
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
        }
      });

      if (!student) {
        throw new NotFoundError('Student profile not found', 'STUDENT_NOT_FOUND');
      }

      // Build update data with only allowed fields for profile updates
      const updateData: any = {
        updated_by: requestingUser.id,
        updated_at: new Date(),
        updated_ip: clientIp || null
      };

      // Only include fields that are provided and allowed for profile updates
      if (data.full_name !== undefined) updateData.full_name = data.full_name;
      if (data.first_name !== undefined) updateData.first_name = data.first_name;
      if (data.middle_name !== undefined) updateData.middle_name = data.middle_name;
      if (data.last_name !== undefined) updateData.last_name = data.last_name;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth;
      if (data.profile_picture_url !== undefined) updateData.profile_picture_url = data.profile_picture_url;

      // Update the student profile
      const updatedStudent = await prisma.student.update({
        where: {
          student_id: student.student_id
        },
        data: updateData,
        include: {
          emails: {
            where: {
              is_primary: true,
              is_deleted: false
            },
            select: {
              email_address: true
            },
            take: 1
          }
        }
      });

      return this.formatEntityResponse(updatedStudent);
    }, {
      context: {
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Map frontend enrollment status values to backend enum values
   * Frontend uses some status names that don't exist in our Prisma schema
   * 
   * @param statuses Array of frontend status strings
   * @returns Array of valid Prisma enum values
   */
  private mapEnrollmentStatuses(statuses: string[]): EnrollmentStatus[] {
    const statusMapping: Record<string, EnrollmentStatus> = {
      // Direct mappings for existing statuses
      'PENDING': EnrollmentStatus.PENDING,
      'ACTIVE': EnrollmentStatus.ACTIVE,
      'COMPLETED': EnrollmentStatus.COMPLETED,
      'DROPPED': EnrollmentStatus.DROPPED,
      'SUSPENDED': EnrollmentStatus.SUSPENDED,
      'EXPELLED': EnrollmentStatus.EXPELLED,
      'TRANSFERRED': EnrollmentStatus.TRANSFERRED,
      'DEFERRED': EnrollmentStatus.DEFERRED,
      
      // Frontend-to-backend mappings for statuses that don't exist in Prisma
      'INACTIVE': EnrollmentStatus.DROPPED,  // Map inactive to dropped
      'CANCELLED': EnrollmentStatus.DROPPED, // Map cancelled to dropped
    };

    return statuses
      .map(status => status.trim().toUpperCase())
      .map(status => statusMapping[status])
      .filter(status => status !== undefined); // Remove any unmapped statuses
  }

  /**
   * Get enrolled courses by student ID with pagination, sorting, and filtering
   * 
   * @param studentId Student identifier
   * @param requestingUser User requesting the data
   * @param params Pagination and filtering parameters
   * @param enrollmentStatuses Optional array of enrollment statuses to filter by
   * @returns List of enrolled courses with pagination metadata
   */
  async getEnrolledCoursesByStudentId(
    studentId: number,
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters,
    enrollmentStatuses?: string[]
  ): Promise<{ items: any[]; pagination: any }> {
    return tryCatch(async () => {
      logger.debug('Getting enrolled courses by student ID', {
        studentId,
        paginationParams: params,
        requestingUserId: requestingUser.id
      });

      // First, get the student's tenant ID and validate access
      const student = await prisma.student.findFirst({
        where: {
          student_id: studentId,
          is_deleted: false
        },
        select: {
          student_id: true,
          tenant_id: true
        }
      });

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      // For non-SUPER_ADMIN users, restrict to their tenant
      if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
        if (!requestingUser.tenantId || student.tenant_id !== requestingUser.tenantId) {
          throw new ForbiddenError('Access denied to student from different tenant');
        }
      }

      // Build search filter from pagination params
      const searchQuery = params.filters?.['search'] || '';
      const searchFilter = searchQuery 
        ? {
            course_name: {
              contains: searchQuery as string,
              mode: 'insensitive' as const
            }
          }
        : {};

      // Calculate pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = params.skip ?? (page - 1) * limit;

      // Map frontend enrollment statuses to valid Prisma enum values
      const mappedEnrollmentStatuses = enrollmentStatuses && enrollmentStatuses.length > 0 
        ? this.mapEnrollmentStatuses(enrollmentStatuses)
        : undefined;

      // Build where clause for enrolled courses
      const whereClause = {
        student_id: studentId,
        is_active: true,
        is_deleted: false,
        // Filter by enrollment statuses if provided
        ...(mappedEnrollmentStatuses && mappedEnrollmentStatuses.length > 0 && {
          enrollment_status: { in: mappedEnrollmentStatuses }
        }),
        course: {
          is_active: true,
          is_deleted: false,
          course_status: CourseStatus.PUBLIC,
          tenant_id: student.tenant_id,
          ...searchFilter
        }
      };

      logger.debug('Built where clause for enrollment query', {
        studentId,
        originalEnrollmentStatuses: enrollmentStatuses,
        mappedEnrollmentStatuses,
        searchQuery,
        tenantId: student.tenant_id
      });

      // Get total count for pagination
      const total = await prisma.enrollment.count({
        where: whereClause
      });

      // Query enrolled courses with pagination
      const enrollments = await prisma.enrollment.findMany({
        where: whereClause,
        include: {
          course: {
            include: {
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
              // Include specialization and program information
              course_specialization: {
                where: {
                  is_active: true,
                  is_deleted: false
                },
                include: {
                  specialization: {
                    select: {
                      specialization_id: true,
                      specialization_name: true,
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
            }
          },
          // Include specialization program for enrollment details
          specialization_program: {
            include: {
              specialization: {
                select: {
                  specialization_id: true,
                  specialization_name: true
                }
              },
              program: {
                select: {
                  program_id: true,
                  program_name: true
                }
              }
            }
          }
        },
        orderBy: {
          enrolled_at: 'desc'
        },
        skip,
        take: limit
      });

      // Get progress data for all courses
      const courseIds = enrollments.map(enrollment => (enrollment as any).course.course_id);
      const progressData = await prisma.studentCourseProgress.findMany({
        where: {
          student_id: studentId,
          course_id: { in: courseIds },
          is_active: true,
          is_deleted: false
        },
        select: {
          course_id: true,
          overall_progress_percentage: true
        }
      });

      // Create a map for quick progress lookup
      const progressMap = new Map();
      progressData.forEach(progress => {
        progressMap.set(progress.course_id, progress.overall_progress_percentage);
      });

      // Extract and format course objects with all required fields
      const courses = enrollments.map(enrollment => {
        const course = (enrollment as any).course;
        const teacher = course.teacher_courses?.[0]?.teacher;
        const courseSession = course.course_sessions?.[0];
        const courseSpecialization = course.course_specialization?.[0];
        const specialization = courseSpecialization?.specialization;
        const specializationProgram = specialization?.specialization_program?.[0];
        const enrollmentSpecializationProgram = (enrollment as any).specialization_program;

        // Format dates using utility function
        const formattedDates = formatDateRangeShort(
          courseSession?.start_date || null,
          courseSession?.end_date || null
        );

        // Format hours using utility function
        const formattedHours = formatDecimalHours(
          course.course_total_hours ? course.course_total_hours.toNumber() : null
        );

        const progressPercentage = progressMap.get(course.course_id) || null;

        return {
          enrollment_id: (enrollment as any).enrollment_id,
          specialization_program_id: (enrollment as any).specialization_program_id,
          course_id: course.course_id,
          specialization_id: enrollmentSpecializationProgram?.specialization?.specialization_id || 
                           specializationProgram?.specialization?.specialization_id || 
                           specialization?.specialization_id || null,
          program_id: enrollmentSpecializationProgram?.program?.program_id || 
                     specializationProgram?.program?.program_id || null,
          course_name: course.course_name,
          start_date: formattedDates.start_date,
          end_date: formattedDates.end_date,
          specialization_name: enrollmentSpecializationProgram?.specialization?.specialization_name || 
                              specializationProgram?.specialization?.specialization_name || 
                              specialization?.specialization_name || null,
          program_name: enrollmentSpecializationProgram?.program?.program_name || 
                       specializationProgram?.program?.program_name || null,
          teacher_name: teacher?.full_name || 'Not Assigned',
          profile_picture_url: teacher?.profile_picture_url || null,
          teacher_qualification: teacher?.teacher_qualification || null,
          course_total_hours: formattedHours,
          overall_progress_percentage: progressPercentage
        };
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      };

      return {
        items: courses,
        pagination
      };
    }, {
      context: {
        studentId,
        paginationParams: params,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }


  /**
   * Extract domain from IIS headers and get tenant
   * @param req Express request object with IIS headers
   * @returns Tenant object or null
   */
  public async getTenantFromDomain(req: any): Promise<any | null> {
    const originalHost = req?.headers['x-original-host'] as string || 
                        req?.headers['x-forwarded-host'] as string || 
                        req?.headers.host as string;

    if (!originalHost) {
      logger.warn('No domain found in request headers');
      return null;
    }

    const domain = env.IS_DEVELOPMENT ? 'alphaacademy.com' : originalHost;
    logger.info(`Extracting tenant for domain: ${domain}`);

    
    try {
      // Use raw query to find tenant by domain since Prisma types might not be generated
      const tenants = await this.prisma.$queryRaw`
        SELECT * FROM tenants 
        WHERE tenant_domain = ${domain} 
        AND tenant_status IN ('ACTIVE', 'TRIAL')
        AND is_active = true 
        AND is_deleted = false 
        LIMIT 1
      ` as any[];
      
      const tenant = tenants.length > 0 ? tenants[0] : null;

      if (tenant) {
        logger.info(`Found tenant: ${tenant.tenant_name} (ID: ${tenant.tenant_id}) for domain: ${domain}`);
      } else {
        logger.warn(`No active tenant found for domain: ${domain}`);
      }

      return tenant;
    } catch (error) {
      logger.error('Error fetching tenant by domain:', { error, domain });
      return null;
    }
  }

}

/**
 * Export a singleton instance of StudentService
 */
export const studentService = StudentService.getInstance();
export default studentService;
