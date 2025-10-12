/**
 * @file services/teacher.service.ts
 * @description Service for managing teachers with modern BaseListService pattern
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  TeacherFilterDto
} from '@/dtos/teacher/teacher.dto';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { 
  Gender,
  UserType
} from '@/types/enums.types';
import logger from '@/config/logger';
import { BaseListService, BaseListServiceConfig } from '@/utils/base-list.service';
import { hashPassword } from '@/utils/password.utils';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Configuration for Teacher service operations
 */
const TEACHER_SERVICE_CONFIG: BaseListServiceConfig = {
  entityName: 'teacher',
  primaryKeyField: 'teacher_id',
  fieldMapping: {
    'teacherId': 'teacher_id',
    'fullName': 'full_name',
    'firstName': 'first_name',
    'lastName': 'last_name',
    'middleName': 'middle_name',
    'username': 'username',
    'teacherQualification': 'teacher_qualification',
    'dateOfBirth': 'date_of_birth',
    'profilePictureUrl': 'profile_picture_url',
    'zipCode': 'zip_code',
    'age': 'age',
    'gender': 'gender',
    'countryId': 'country_id',
    'stateId': 'state_id',
    'cityId': 'city_id',
    'address': 'address',
    'tenantId': 'tenant_id',
    'isActive': 'is_active',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  filterConversion: {
    stringFields: ['search'],
    booleanFields: ['isActive'],
    numberFields: ['countryId', 'stateId', 'cityId'],
    enumFields: {
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

export class TeacherService extends BaseListService<any, TeacherFilterDto> {
  private static instance: TeacherService;

  private constructor() {
    super(prisma, TEACHER_SERVICE_CONFIG);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TeacherService {
    if (!TeacherService.instance) {
      TeacherService.instance = new TeacherService();
    }
    return TeacherService.instance;
  }

  /**
   * Get table name for queries
   */
  protected getTableName(): string {
    return 'teacher';
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
  protected buildEntitySpecificFilters(filters: TeacherFilterDto): any {
    const whereClause: any = {
      is_deleted: false
    };

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

    // Gender filter
    if (filters.gender !== undefined) {
      whereClause.gender = filters.gender;
    }

    return whereClause;
  }

  /**
   * Format entity response
   */
  protected formatEntityResponse(entity: any): any {
    const { password_hash, ...teacherWithoutPassword } = entity;
    
    return {
      ...teacherWithoutPassword,
      primary_email: entity.emails?.[0]?.email_address || null
    };
  }

  /**
   * Create a new teacher
   * 
   * @param data Teacher data from validated DTO
   * @param requestingUser User requesting the teacher creation
   * @param clientIp IP address of the request
   * @returns Newly created teacher
   */
  async createTeacher(
    data: CreateTeacherDto,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
    // Determine tenant ID based on user type
    let tenantId: number;
    
    if (requestingUser.user_type === UserType.SUPER_ADMIN) {
      if (!data.tenant_id) {
        throw new BadRequestError('Tenant ID is required when creating a teacher as SUPER_ADMIN', 'MISSING_TENANT_ID');
      }
      tenantId = data.tenant_id;
    } 
    else {
      if (!requestingUser.tenantId) {
        throw new BadRequestError('Tenant ID is required', 'MISSING_TENANT_ID');
      }
      tenantId = requestingUser.tenantId;
    }

    return tryCatch(async () => {
      // Check if username exists within tenant
      const existingUsername = await prisma.teacher.findFirst({
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
      const existingEmail = await prisma.teacherEmailAddress.findFirst({
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

      // Create teacher and associated email address within transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the teacher
        const newTeacher = await tx.teacher.create({
          data: {
            tenant_id: tenantId,
            full_name: data.full_name,
            first_name: data.first_name,
            middle_name: data.middle_name || null,
            last_name: data.last_name,
            username: data.username,
            password_hash: passwordHash,
            country_id: data.country_id ?? null,
            state_id: data.state_id ?? null,
            city_id: data.city_id ?? null,
            address: data.address || null,
            date_of_birth: data.date_of_birth || null,
            profile_picture_url: data.profile_picture_url || null,
            zip_code: data.zip_code || null,
            age: data.age || null,
            gender: data.gender || null,
            teacher_qualification: data.teacher_qualification || null,
            joining_date: data.joining_date || null,
            is_active: true,
            created_ip: clientIp || null,
            updated_ip: clientIp || null,
            created_by: requestingUser.id,
            updated_by: requestingUser.id
          }
        });

        // Handle email addresses
        if (data.emailAddresses && data.emailAddresses.length > 0) {
          await tx.teacherEmailAddress.createMany({
            data: data.emailAddresses.map((email, index) => ({
              teacher_id: newTeacher.teacher_id,
              tenant_id: tenantId,
              email_address: email.email_address,
              is_primary: email.is_primary ?? false,
              priority: email.priority || (index + 1),
              created_ip: clientIp || null,
              updated_ip: clientIp || null,
              created_by: requestingUser.id,
              updated_by: requestingUser.id
            }))
          });
        } else if (data.email_address) {
          await tx.teacherEmailAddress.create({
            data: {
              teacher_id: newTeacher.teacher_id,
              tenant_id: tenantId,
              email_address: data.email_address,
              is_primary: true,
              priority: 1,
              created_ip: clientIp || null,
              updated_ip: clientIp || null,
              created_by: requestingUser.id,
              updated_by: requestingUser.id
            }
          });
        }

        // Handle phone numbers
        if (data.phoneNumbers && data.phoneNumbers.length > 0) {
          await tx.teacherPhoneNumber.createMany({
            data: data.phoneNumbers.map(phone => ({
              teacher_id: newTeacher.teacher_id,
              tenant_id: tenantId,
              dial_code: phone.dial_code,
              phone_number: phone.phone_number,
              iso_country_code: phone.iso_country_code || null,
              is_primary: phone.is_primary ?? false,
              created_ip: clientIp || null,
              updated_ip: clientIp || null,
              created_by: requestingUser.id,
              updated_by: requestingUser.id
            }))
          });
        }

        return newTeacher;
      });

      const { password_hash, ...teacherWithoutPassword } = result;
      return teacherWithoutPassword;
    });
  }

  /**
   * Get all teachers with pagination, sorting, and filtering
   */
  async getAllTeachers(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    return this.getAllEntities(requestingUser, params);
  }

  /**
   * Get teacher by ID
   */
  async getTeacherById(teacherId: number, requestingUser: TokenPayload) {
    return tryCatch(async () => {
      let whereClause: any = {
        teacher_id: teacherId,
        is_deleted: false
      };

      if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
        whereClause.tenant_id = requestingUser.tenantId;
      }

      const teacher = await prisma.teacher.findFirst({
        where: whereClause,
        include: {
          emails: {
            where: { is_deleted: false },
            orderBy: [
              { is_primary: 'desc' },
              { priority: 'asc' }
            ]
          },
          phones: {
            where: { is_deleted: false },
            orderBy: { is_primary: 'desc' }
          },
          country: {
            select: {
              country_id: true,
              name: true,
              iso_code_2: true,
              dial_code: true
            }
          },
          state: {
            select: {
              state_id: true,
              name: true,
              state_code: true
            }
          },
          city: {
            select: {
              city_id: true,
              name: true
            }
          }
        }
      });

      if (!teacher) {
        throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
      }

      if (
        requestingUser.user_type !== UserType.SUPER_ADMIN &&
        teacher.tenant_id !== requestingUser.tenantId
      ) {
        throw new ForbiddenError('You do not have permission to access this teacher', 'FORBIDDEN');
      }

      return this.formatEntityResponse(teacher);
    });
  }

  /**
   * Update teacher by ID
   */
  async updateTeacher(
    teacherId: number,
    data: UpdateTeacherDto,
    requestingUser: TokenPayload,
    clientIp?: string
  ) {
    return tryCatch(async () => {
      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          teacher_id: teacherId,
          is_deleted: false
        }
      });

      if (!existingTeacher) {
        throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
      }

      if (
        requestingUser.user_type !== UserType.SUPER_ADMIN &&
        existingTeacher.tenant_id !== requestingUser.tenantId
      ) {
        throw new ForbiddenError('You do not have permission to update this teacher', 'FORBIDDEN');
      }

      const result = await prisma.$transaction(async (tx) => {
        // Build update data object with only defined fields
        const updateData: any = {
          updated_by: requestingUser.id,
          updated_ip: clientIp || null,
          updated_at: new Date()
        };

        if (data.full_name !== undefined) updateData.full_name = data.full_name;
        if (data.first_name !== undefined) updateData.first_name = data.first_name;
        if (data.middle_name !== undefined) updateData.middle_name = data.middle_name;
        if (data.last_name !== undefined) updateData.last_name = data.last_name;
        if (data.country_id !== undefined) updateData.country_id = data.country_id ?? null;
        if (data.state_id !== undefined) updateData.state_id = data.state_id ?? null;
        if (data.city_id !== undefined) updateData.city_id = data.city_id ?? null;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth;
        if (data.profile_picture_url !== undefined) updateData.profile_picture_url = data.profile_picture_url;
        if (data.zip_code !== undefined) updateData.zip_code = data.zip_code;
        if (data.age !== undefined) updateData.age = data.age;
        if (data.gender !== undefined) updateData.gender = data.gender;
        if (data.teacher_qualification !== undefined) updateData.teacher_qualification = data.teacher_qualification;
        if (data.joining_date !== undefined) updateData.joining_date = data.joining_date;

        const updatedTeacher = await tx.teacher.update({
          where: { teacher_id: teacherId },
          data: updateData
        });

        // Handle email addresses update (soft delete old + insert new)
        if (data.emailAddresses && data.emailAddresses.length > 0) {
          await tx.teacherEmailAddress.updateMany({
            where: {
              teacher_id: teacherId,
              is_deleted: false
            },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
              deleted_by: requestingUser.id
            }
          });

          await tx.teacherEmailAddress.createMany({
            data: data.emailAddresses.map((email, index) => ({
              teacher_id: teacherId,
              tenant_id: existingTeacher.tenant_id,
              email_address: email.email_address,
              is_primary: email.is_primary ?? false,
              priority: email.priority || (index + 1),
              created_ip: clientIp || null,
              updated_ip: clientIp || null,
              created_by: requestingUser.id,
              updated_by: requestingUser.id
            }))
          });
        }

        // Handle phone numbers update
        if (data.phoneNumbers && data.phoneNumbers.length > 0) {
          await tx.teacherPhoneNumber.updateMany({
            where: {
              teacher_id: teacherId,
              is_deleted: false
            },
            data: {
              is_deleted: true,
              deleted_at: new Date(),
              deleted_by: requestingUser.id
            }
          });

          await tx.teacherPhoneNumber.createMany({
            data: data.phoneNumbers.map(phone => ({
              teacher_id: teacherId,
              tenant_id: existingTeacher.tenant_id,
              dial_code: phone.dial_code,
              phone_number: phone.phone_number,
              iso_country_code: phone.iso_country_code || null,
              is_primary: phone.is_primary ?? false,
              created_ip: clientIp || null,
              updated_ip: clientIp || null,
              created_by: requestingUser.id,
              updated_by: requestingUser.id
            }))
          });
        }

        return updatedTeacher;
      });

      logger.info('Teacher updated successfully', {
        teacherId,
        updatedBy: requestingUser.id
      });

      const { password_hash, ...teacherWithoutPassword } = result;
      return teacherWithoutPassword;
    });
  }

  /**
   * Delete teacher by ID (soft delete)
   */
  async deleteTeacher(
    teacherId: number,
    requestingUser: TokenPayload,
    clientIp?: string
  ): Promise<void> {
    return tryCatch(async () => {
      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          teacher_id: teacherId,
          is_deleted: false
        }
      });

      if (!existingTeacher) {
        throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
      }

      if (
        requestingUser.user_type !== UserType.SUPER_ADMIN &&
        existingTeacher.tenant_id !== requestingUser.tenantId
      ) {
        throw new ForbiddenError('You do not have permission to delete this teacher', 'FORBIDDEN');
      }

      await prisma.teacher.update({
        where: { teacher_id: teacherId },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: requestingUser.id,
          updated_ip: clientIp || null
        }
      });

      logger.info('Teacher deleted successfully', {
        teacherId,
        deletedBy: requestingUser.id
      });
    });
  }

  /**
   * Get tenant from domain helper method
   */
  async getTenantFromDomain(req: any): Promise<any> {
    const originalHost = req?.headers['x-original-host'] as string || 
                        req?.headers['x-forwarded-host'] as string || 
                        req?.headers.host as string;

    if (!originalHost) {
      throw new BadRequestError('Unable to determine tenant from request', 'INVALID_HOSTNAME');
    }

    const domain = originalHost;
    
    try {
      const tenants = await prisma.$queryRaw`
        SELECT * FROM tenants 
        WHERE tenant_domain = ${domain} 
        AND tenant_status IN ('ACTIVE', 'TRIAL')
        AND is_active = true 
        AND is_deleted = false 
        LIMIT 1
      ` as any[];
      
      const tenant = tenants.length > 0 ? tenants[0] : null;

      if (!tenant) {
        throw new NotFoundError('Tenant not found for this domain', 'TENANT_NOT_FOUND');
      }

      logger.info(`Found tenant: ${tenant.tenant_name} (ID: ${tenant.tenant_id}) for domain: ${domain}`);
      return tenant;
    } catch (error) {
      logger.error('Error fetching tenant by domain:', { error, domain });
      throw new BadRequestError('Unable to determine tenant from request', 'INVALID_HOSTNAME');
    }
  }
}

export const teacherService = TeacherService.getInstance();
