/**
 * @file Modern Service Implementation Example
 * @description Example showing how to use the new common utilities in services
 */

import { PrismaClient } from '@prisma/client';
import { TokenPayload } from '@/utils/jwt.utils';
import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { StudentStatus, Gender } from '@/types/enums.types';

// Import our new utilities
import { BaseListService, BaseListServiceConfig } from '@/utils/base-list.service';
import { BaseFilterDto } from '@/utils/service.types';
import { STUDENT_FIELD_MAPPINGS } from '@/utils/field-mapping.utils';
import { buildEnumFilter, buildRangeFilter, mergeFilters } from '@/utils/filter-builders.utils';

/**
 * Example filter DTO extending BaseFilterDto
 */
interface ExampleStudentFilterDto extends BaseFilterDto {
  status?: StudentStatus;
  gender?: Gender;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  age_min?: number;
  age_max?: number;
}

/**
 * Example modern service implementation using common utilities
 * This demonstrates the patterns that should be used across all services
 */
export class ModernStudentService extends BaseListService<any, ExampleStudentFilterDto> {
  private static instance: ModernStudentService;

  private constructor(prisma: PrismaClient) {
    // Configuration for the base service
    const config: BaseListServiceConfig = {
      entityName: 'student',
      primaryKeyField: 'student_id',
      fieldMapping: STUDENT_FIELD_MAPPINGS,
      filterConversion: {
        stringFields: ['search'],
        numberFields: ['country_id', 'state_id', 'city_id', 'age_min', 'age_max'],
        enumFields: {
          status: StudentStatus,
          gender: Gender
        }
      },
      defaultSortField: 'created_at',
      defaultSortOrder: 'desc',
      searchFields: ['full_name', 'username'],
      searchRelations: {
        emails: ['email_address']
      }
    };

    super(prisma, config);
  }

  /**
   * Get singleton instance
   */
  static getInstance(prisma: PrismaClient): ModernStudentService {
    if (!ModernStudentService.instance) {
      ModernStudentService.instance = new ModernStudentService(prisma);
    }
    return ModernStudentService.instance;
  }

  /**
   * Get Prisma table name
   */
  protected getTableName(): string {
    return 'student';
  }

  /**
   * Build entity-specific filters using utility functions
   * This method demonstrates how to use the filter utilities
   */
  protected buildEntitySpecificFilters(
    filterDto: ExampleStudentFilterDto,
    baseFilters: Record<string, any>
  ): Record<string, any> {
    // Start with base filters (includes tenant isolation and soft delete protection)
    let filters = { ...baseFilters };

    // Build search filters using utility
    const searchFilters = this.buildSearchFilters(filterDto.search);
    if (searchFilters) {
      filters = mergeFilters(filters, searchFilters);
    }

    // Build enum filters using utility
    const statusFilter = buildEnumFilter(filterDto.status, StudentStatus, 'student_status');
    const genderFilter = buildEnumFilter(filterDto.gender, Gender, 'gender');
    
    // Build range filters using utility
    const ageFilter = buildRangeFilter(filterDto.age_min, filterDto.age_max, 'age');

    // Apply individual field filters
    if (filterDto.country_id) {
      filters['country_id'] = filterDto.country_id;
    }
    
    if (filterDto.state_id) {
      filters['state_id'] = filterDto.state_id;
    }
    
    if (filterDto.city_id) {
      filters['city_id'] = filterDto.city_id;
    }

    // Merge all filters
    return mergeFilters(filters, statusFilter, genderFilter, ageFilter);
  }

  /**
   * Get include options for Prisma queries
   */
  protected override getIncludeOptions(): Record<string, any> {
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
   * Format entities before returning
   */
  protected override formatEntities(entities: any[]): any[] {
    return entities.map(student => {
      const { password_hash, ...studentData } = student;
      return {
        ...studentData,
        primary_email: student.emails?.[0]?.email_address || null
      };
    });
  }

  /**
   * Example of how to implement getAllStudents using the base class
   * This replaces the complex manual implementation with a simple call
   */
  async getAllStudents(
    requestingUser: TokenPayload,
    params: ExtendedPaginationWithFilters
  ) {
    // This single line replaces all the manual filter/sort/query logic!
    return this.getAllEntities(requestingUser, params);
  }

  /**
   * Example of how tenant isolation works automatically
   */
  async getStudentById(studentId: number, requestingUser: TokenPayload) {
    // Build filters with automatic tenant isolation
    const filters = this.buildEntityAccessFilters(studentId, requestingUser, 'student_id');
    
    const student = await (this.prisma as any).student.findFirst({
      where: filters,
      ...this.getIncludeOptions()
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return this.formatEntities([student])[0];
  }

  /**
   * Helper method to build entity access filters (demonstrates utility usage)
   */
  private buildEntityAccessFilters(
    entityId: number,
    requestingUser: TokenPayload,
    primaryKeyField: string
  ): Record<string, any> {
    const baseFilters = this.buildBaseFilters(requestingUser);
    return {
      [primaryKeyField]: entityId,
      ...baseFilters
    };
  }
}

/**
 * USAGE PATTERNS DEMONSTRATED:
 * 
 * 1. **Service Configuration**: Single config object defines all behavior
 * 2. **Automatic Tenant Isolation**: Built into base filters
 * 3. **Type-Safe Filter Conversion**: Enum validation, number parsing, etc.
 * 4. **Reusable Filter Builders**: Search, enum, range, date filters
 * 5. **Consistent Field Mapping**: API ↔ DB field name translation
 * 6. **Standardized Responses**: Pagination, formatting, error handling
 * 7. **Minimal Code**: Complex operations reduced to single method calls
 * 
 * BENEFITS:
 * - Reduced code duplication across services
 * - Consistent tenant isolation behavior
 * - Type-safe filter handling
 * - Automatic pagination and sorting
 * - Standardized error handling and logging
 * - Easy testing and maintenance
 */
