/**
 * @file services/student.service.ts
 * @description Service for managing students with modern BaseListService pattern
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateStudentDto,
  UpdateStudentDto,
  UpdateStudentProfileDto,
  StudentFilterDto
} from '@/dtos/student/student.dto';
import { EnrolledCourseResponse } from '@/dtos/student/enrolled-courses-by-student.dto';
import { NotFoundError, ConflictError, ForbiddenError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { 
  StudentStatus,
  Gender,
  UserType
} from '@/types/enums.types';
import logger from '@/config/logger';
import { BaseListService, BaseListServiceConfig } from '@/utils/base-list.service';
import { STUDENT_FIELD_MAPPINGS } from '@/utils/field-mapping.utils';
import { hashPassword } from '@/utils/password.utils';
import { formatDateRange, formatDecimalHours } from '@/utils/date-format.utils';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Configuration for Student service operations
 */
const STUDENT_SERVICE_CONFIG: BaseListServiceConfig<StudentFilterDto> = {
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
   * @param tenantId Tenant ID for multi-tenant isolation
   * @param adminUserId System user ID for audit trail
   * @param clientIp IP address of the request
   * @returns Newly created student
   */
  async createStudent(
    data: CreateStudentDto,
    tenantId: number,
    adminUserId: number,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      logger.debug('Creating student', {
        username: data.username,
        tenantId,
        adminUserId
      });

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
            is_active: true,
            is_deleted: false,
            created_by: adminUserId,
            updated_by: adminUserId,
            created_ip: clientIp || null,
            updated_ip: clientIp || null
          }
        });

        // Create the primary email address
        await tx.studentEmailAddress.create({
          data: {
            student_id: newStudent.student_id,
            tenant_id: tenantId,
            email_address: data.email_address,
            is_primary: true,
            is_active: true,
            is_deleted: false,
            created_by: adminUserId,
            updated_by: adminUserId,
            created_ip: clientIp || null,
            updated_ip: clientIp || null
          }
        });

        return newStudent;
      });

      // Return the created student (without password_hash)
      const { password_hash, ...studentWithoutPassword } = result;
      return studentWithoutPassword;
    }, {
      context: {
        tenantId,
        adminUserId,
        username: data.username
      }
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
   * Get enrolled courses by student ID
   * 
   * @param studentId Student identifier
   * @param searchQuery Optional search query to filter course names
   * @param requestingUser User requesting the data
   * @returns List of enrolled courses with comprehensive details
   */
  async getEnrolledCoursesByStudentId(
    studentId: number,
    searchQuery: string = '',
    requestingUser: TokenPayload
  ): Promise<EnrolledCourseResponse[]> {
    return tryCatch(async () => {
      logger.debug('Getting enrolled courses by student ID', {
        studentId,
        searchQuery,
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

      // Build search filter
      const searchFilter = searchQuery 
        ? {
            course_name: {
              contains: searchQuery,
              mode: 'insensitive' as any
            }
          }
        : {};

      // Query enrolled courses with all required joins
      const enrolledCourses = await prisma.enrollment.findMany({
        where: {
          student_id: studentId,
          is_active: true,
          is_deleted: false,
          course: {
            is_active: true,
            is_deleted: false,
            course_status: 'PUBLIC',
            tenant_id: student.tenant_id,
            ...searchFilter
          }
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
                      full_name: true
                    }
                  }
                }
              },
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
              }
            }
          },
          specialization_program: {
            include: {
              specialization: {
                select: {
                  specialization_name: true
                }
              },
              program: {
                select: {
                  program_name: true
                }
              }
            }
          }
        },
        orderBy: {
          enrolled_at: 'desc'
        }
      });

      // Get student course progress separately
      const studentProgressData = await prisma.studentCourseProgress.findMany({
        where: {
          student_id: studentId,
          course_id: {
            in: enrolledCourses.map(e => e.course_id)
          },
          is_active: true,
          is_deleted: false
        },
        select: {
          course_id: true,
          overall_progress_percentage: true
        }
      });

      // Create a map for quick progress lookup
      const progressMap = new Map(
        studentProgressData.map(p => [p.course_id, p.overall_progress_percentage])
      );

      // Format the response
      const formattedCourses = enrolledCourses.map(enrollment => {
        const course = enrollment.course;
        const specializationProgram = enrollment.specialization_program;
        const teacher = course.teacher_courses[0]?.teacher;
        const courseSession = course.course_sessions[0];
        const progressPercentage = progressMap.get(course.course_id) || 0;

        // Format dates
        const formattedDates = formatDateRange(
          courseSession?.start_date || null,
          courseSession?.end_date || null
        );

        // Format hours
        const formattedHours = formatDecimalHours(
          course.course_total_hours ? Number(course.course_total_hours) : null
        );

        return {
          enrollment_id: enrollment.enrollment_id,
          specialization_program_id: enrollment.specialization_program_id,
          course_id: course.course_id,
          specialization_id: specializationProgram?.specialization_id || null,
          program_id: specializationProgram?.program_id || null,
          course_name: course.course_name,
          start_date: formattedDates.start_date,
          end_date: formattedDates.end_date,
          specialization_name: specializationProgram?.specialization?.specialization_name || null,
          program_name: specializationProgram?.program?.program_name || null,
          teacher_name: teacher?.full_name || 'Not Assigned',
          course_total_hours: formattedHours,
          overall_progress_percentage: progressPercentage
        };
      });

      return formattedCourses;
    }, {
      context: {
        studentId,
        searchQuery,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }
}

/**
 * Export a singleton instance of StudentService
 */
export const studentService = StudentService.getInstance();
export default studentService;
