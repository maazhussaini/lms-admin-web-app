import { PrismaClient } from '@prisma/client';
import { CreateStudentDto, UpdateStudentDto, UpdateStudentProfileDto } from '@/dtos/student/student.dto';
import { 
  NotFoundError, 
  ConflictError, 
  ForbiddenError 
} from '@/utils/api-error.utils';
import { hashPassword } from '@/utils/password.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { getPrismaQueryOptions, SortOrder } from '@/utils/pagination.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters, SafeFilterParams } from '@/utils/async-handler.utils';
import { 
  Gender,
  StudentStatus,
  UserType
} from '@/types/enums.types';
import logger from '@/config/logger';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Filter DTO for student queries
 */
interface StudentFilterDto {
  search?: string;
  status?: StudentStatus;
  gender?: Gender;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  age_min?: number;
  age_max?: number;
}

export class StudentService {
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
        throw new ConflictError('Username already exists within tenant', 'USERNAME_EXISTS');
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
        throw new ConflictError('Email address already exists within tenant', 'EMAIL_EXISTS');
      }

      // Hash the password
      const passwordHash = await hashPassword(data.password);

      // Create student and associated email address within transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the student
        const student = await tx.student.create({
          data: {
            tenant_id: tenantId,
            full_name: data.full_name,
            first_name: data.first_name,
            middle_name: data.middle_name || null,
            last_name: data.last_name,
            country_id: data.country_id,
            state_id: data.state_id,
            city_id: data.city_id,
            address: data.address || null,
            date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
            profile_picture_url: data.profile_picture_url || null,
            zip_code: data.zip_code || null,
            age: data.age || null,
            gender: data.gender || null,
            username: data.username,
            password_hash: passwordHash,
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

        // Create primary email address for the student
        await tx.studentEmailAddress.create({
          data: {
            tenant_id: tenantId,
            student_id: student.student_id,
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

        return student;
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
        // No additional tenant restriction for super admin
      } else {
        // Regular users can only access students from their tenant
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

      // Remove password_hash from response
      const { password_hash, ...studentWithoutPassword } = student;
      
      // Format response to include primary email address directly
      return {
        ...studentWithoutPassword,
        primary_email: student.emails[0]?.email_address || null
      };
    }, {
      context: {
        studentId,
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Get all students with pagination, sorting, and filtering
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

      // Convert filter params to structured DTO
      const filterDto = this.convertStudentFiltersToDto(params.filters);
      
      // Build filters using the structured DTO
      const filters = this.buildStudentFiltersFromDto(filterDto, requestingUser);
      
      // Use pagination utilities to build sorting
      const sorting = this.buildStudentSorting(params);
      
      // Get query options using pagination utilities
      const queryOptions = getPrismaQueryOptions(
        { page: params.page, limit: params.limit, skip: params.skip },
        sorting
      );

      // Execute queries using Promise.all for better performance
      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where: filters,
          ...queryOptions,
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
        }),
        prisma.student.count({ where: filters })
      ]);

      // Remove password_hash and format response
      const formattedStudents = students.map(student => {
        const { password_hash, ...studentData } = student;
        return {
          ...studentData,
          primary_email: student.emails[0]?.email_address || null
        };
      });

      return {
        items: formattedStudents,
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
        if (requestingUser.user_type === UserType.SUPER_ADMIN) {
          throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
        } else {
          throw new ForbiddenError('Cannot update student from another tenant');
        }
      }

      // Log tenant context for SUPER_ADMIN operations
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        logger.debug('SUPER_ADMIN updating student across tenant', {
          studentId,
          studentTenantId: existingStudent.tenant_id,
          adminUserId: requestingUser.id
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
        if (requestingUser.user_type === UserType.SUPER_ADMIN) {
          throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
        } else {
          throw new ForbiddenError('Cannot delete student from another tenant');
        }
      }

      // Log tenant context for SUPER_ADMIN operations
      if (requestingUser.user_type === UserType.SUPER_ADMIN) {
        logger.debug('SUPER_ADMIN deleting student across tenant', {
          studentId,
          studentTenantId: existingStudent.tenant_id,
          adminUserId: requestingUser.id
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
        throw new ForbiddenError('Only students can access student profile endpoints');
      }

      // Find student record by username or email matching the authenticated user
      // This assumes the JWT contains the student's username or email
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { username: requestingUser.email }, // If email is used as username
            { 
              emails: {
                some: {
                  email_address: requestingUser.email,
                  is_deleted: false
                }
              }
            }
          ],
          tenant_id: requestingUser.tenantId,
          is_deleted: false
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
        throw new NotFoundError('Student profile not found', 'STUDENT_PROFILE_NOT_FOUND');
      }

      // Return only profile-relevant fields (exclude sensitive data)
      return {
        student_id: student.student_id,
        full_name: student.full_name,
        first_name: student.first_name,
        middle_name: student.middle_name,
        last_name: student.last_name,
        address: student.address,
        date_of_birth: student.date_of_birth,
        profile_picture_url: student.profile_picture_url,
        primary_email: student.emails[0]?.email_address || null,
        created_at: student.created_at,
        updated_at: student.updated_at
      };
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
        throw new ForbiddenError('Only students can update student profile');
      }

      // Find student record by username or email matching the authenticated user
      const existingStudent = await prisma.student.findFirst({
        where: {
          OR: [
            { username: requestingUser.email }, // If email is used as username
            { 
              emails: {
                some: {
                  email_address: requestingUser.email,
                  is_deleted: false
                }
              }
            }
          ],
          tenant_id: requestingUser.tenantId,
          is_deleted: false
        }
      });

      if (!existingStudent) {
        throw new NotFoundError('Student profile not found', 'STUDENT_PROFILE_NOT_FOUND');
      }

      // Build update data with only allowed profile fields
      // Note: We don't update audit fields (updated_by, updated_at) for student self-updates
      // to avoid foreign key constraint issues with SystemUser table
      const updateData: any = {
        updated_ip: clientIp || null
      };

      // Only include profile fields that are provided in the update data
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
          student_id: existingStudent.student_id
        },
        data: updateData
      });

      // Return only profile-relevant fields
      return {
        student_id: updatedStudent.student_id,
        full_name: updatedStudent.full_name,
        first_name: updatedStudent.first_name,
        middle_name: updatedStudent.middle_name,
        last_name: updatedStudent.last_name,
        address: updatedStudent.address,
        date_of_birth: updatedStudent.date_of_birth,
        profile_picture_url: updatedStudent.profile_picture_url,
        updated_at: updatedStudent.updated_at
      };
    }, {
      context: {
        requestingUser: { id: requestingUser.id, role: requestingUser.user_type, tenantId: requestingUser.tenantId }
      }
    });
  }

  /**
   * Convert SafeFilterParams to structured student DTO
   */
  private convertStudentFiltersToDto(filterParams: SafeFilterParams): StudentFilterDto {
    const dto: StudentFilterDto = {};
    
    if (filterParams['search'] && typeof filterParams['search'] === 'string') {
      dto.search = filterParams['search'];
    }
    
    if (filterParams['status']) {
      dto.status = filterParams['status'] as StudentStatus;
    }

    if (filterParams['gender']) {
      dto.gender = filterParams['gender'] as Gender;
    }
    
    if (filterParams['country_id']) {
      dto.country_id = typeof filterParams['country_id'] === 'number' 
        ? filterParams['country_id'] 
        : parseInt(filterParams['country_id'] as string, 10);
    }

    if (filterParams['state_id']) {
      dto.state_id = typeof filterParams['state_id'] === 'number' 
        ? filterParams['state_id'] 
        : parseInt(filterParams['state_id'] as string, 10);
    }

    if (filterParams['city_id']) {
      dto.city_id = typeof filterParams['city_id'] === 'number' 
        ? filterParams['city_id'] 
        : parseInt(filterParams['city_id'] as string, 10);
    }

    if (filterParams['age_min']) {
      dto.age_min = typeof filterParams['age_min'] === 'number' 
        ? filterParams['age_min'] 
        : parseInt(filterParams['age_min'] as string, 10);
    }

    if (filterParams['age_max']) {
      dto.age_max = typeof filterParams['age_max'] === 'number' 
        ? filterParams['age_max'] 
        : parseInt(filterParams['age_max'] as string, 10);
    }
    
    return dto;
  }

  /**
   * Build Prisma filters from structured student DTO
   */
  private buildStudentFiltersFromDto(filterDto: StudentFilterDto, requestingUser: TokenPayload): Record<string, any> {
    const where: Record<string, any> = {
      is_deleted: false
    };

    // Add tenant scoping for non-SUPER_ADMIN users
    if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
      where['tenant_id'] = requestingUser.tenantId;
    }
    
    if (filterDto.search) {
      where['OR'] = [
        { full_name: { contains: filterDto.search, mode: 'insensitive' } },
        { username: { contains: filterDto.search, mode: 'insensitive' } },
        {
          emails: {
            some: {
              email_address: { contains: filterDto.search, mode: 'insensitive' },
              is_deleted: false
            }
          }
        }
      ];
    }

    if (filterDto.status) {
      where['student_status'] = filterDto.status;
    }

    if (filterDto.gender) {
      where['gender'] = filterDto.gender;
    }

    if (filterDto.country_id) {
      where['country_id'] = filterDto.country_id;
    }

    if (filterDto.state_id) {
      where['state_id'] = filterDto.state_id;
    }

    if (filterDto.city_id) {
      where['city_id'] = filterDto.city_id;
    }

    if (filterDto.age_min || filterDto.age_max) {
      where['age'] = {};
      if (filterDto.age_min) {
        where['age']['gte'] = filterDto.age_min;
      }
      if (filterDto.age_max) {
        where['age']['lte'] = filterDto.age_max;
      }
    }

    return where;
  }

  /**
   * Build Prisma sorting from pagination parameters for students
   */
  private buildStudentSorting(params: ExtendedPaginationWithFilters): Record<string, SortOrder> {
    const fieldMapping: Record<string, string> = {
      'studentId': 'student_id',
      'fullName': 'full_name',
      'firstName': 'first_name',
      'lastName': 'last_name',
      'username': 'username',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'studentStatus': 'student_status',
      'age': 'age'
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

/**
 * Export a singleton instance of StudentService
 */
export const studentService = new StudentService();
export default studentService;
