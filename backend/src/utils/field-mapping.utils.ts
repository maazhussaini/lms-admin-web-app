/**
 * @file Field Mapping Utilities
 * @description Common utilities for mapping API field names to database column names
 */

import { ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { SortOrder } from '@/utils/pagination.utils';
import { FieldMappingConfig } from './service.types';

/**
 * Common field mappings used across multiple entities
 */
export const COMMON_FIELD_MAPPINGS: FieldMappingConfig = {
  'id': 'id',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'deletedAt': 'deleted_at',
  'createdBy': 'created_by',
  'updatedBy': 'updated_by',
  'deletedBy': 'deleted_by',
  'isActive': 'is_active',
  'isDeleted': 'is_deleted',
  'tenantId': 'tenant_id'
};

/**
 * Student-specific field mappings
 */
export const STUDENT_FIELD_MAPPINGS: FieldMappingConfig = {
  ...COMMON_FIELD_MAPPINGS,
  'studentId': 'student_id',
  'fullName': 'full_name',
  'firstName': 'first_name',
  'lastName': 'last_name',
  'middleName': 'middle_name',
  'username': 'username',
  'studentStatus': 'student_status',
  'dateOfBirth': 'date_of_birth',
  'profilePictureUrl': 'profile_picture_url',
  'zipCode': 'zip_code',
  'age': 'age',
  'gender': 'gender',
  'countryId': 'country_id',
  'stateId': 'state_id',
  'cityId': 'city_id',
  'address': 'address',
  'referralType': 'referral_type'
};

/**
 * Course-specific field mappings
 */
export const COURSE_FIELD_MAPPINGS: FieldMappingConfig = {
  ...COMMON_FIELD_MAPPINGS,
  'courseId': 'course_id',
  'courseName': 'course_name',
  'courseDescription': 'course_description',
  'description': 'course_description',
  'courseCode': 'course_code',
  'courseType': 'course_type',
  'courseLevel': 'course_level',
  'courseDuration': 'course_duration',
  'courseStatus': 'course_status',
  'status': 'course_status',
  'level': 'level',
  'isPublished': 'is_published',
  'publishedAt': 'published_at',
  'specializationProgramId': 'specialization_program_id',
  'mainThumbnailUrl': 'main_thumbnail_url',
  'coursePrice': 'course_price',
  'courseTotalHours': 'course_total_hours',
  'durationInWeeks': 'duration_in_weeks',
  'programId': 'program_id',
  'specializationId': 'specialization_id'
};

/**
 * Program-specific field mappings
 */
export const PROGRAM_FIELD_MAPPINGS: FieldMappingConfig = {
  ...COMMON_FIELD_MAPPINGS,
  'programId': 'program_id',
  'programName': 'program_name',
  'programDescription': 'program_description',
  'programCode': 'program_code',
  'programType': 'program_type',
  'programDuration': 'program_duration',
  'programStatus': 'program_status'
};

/**
 * Specialization-specific field mappings
 */
export const SPECIALIZATION_FIELD_MAPPINGS: FieldMappingConfig = {
  ...COMMON_FIELD_MAPPINGS,
  'specializationId': 'specialization_id',
  'specializationName': 'specialization_name',
  'specializationDescription': 'specialization_description',
  'specializationCode': 'specialization_code',
  'specializationType': 'specialization_type',
  'specializationDuration': 'specialization_duration',
  'specializationStatus': 'specialization_status'
};

/**
 * Tenant-specific field mappings
 */
export const TENANT_FIELD_MAPPINGS: FieldMappingConfig = {
  ...COMMON_FIELD_MAPPINGS,
  'tenantName': 'tenant_name',
  'tenantDescription': 'tenant_description',
  'tenantCode': 'tenant_code',
  'tenantType': 'tenant_type',
  'tenantStatus': 'tenant_status',
  'subscriptionType': 'subscription_type',
  'subscriptionStartDate': 'subscription_start_date',
  'subscriptionEndDate': 'subscription_end_date'
};

/**
 * System User-specific field mappings
 */
export const SYSTEM_USER_FIELD_MAPPINGS: FieldMappingConfig = {
  ...COMMON_FIELD_MAPPINGS,
  'systemUserId': 'system_user_id',
  'fullName': 'full_name',
  'emailAddress': 'email_address',
  'username': 'username',
  'roleType': 'role_type',
  'systemUserStatus': 'system_user_status',
  'passwordHash': 'password_hash'
};

/**
 * Client-specific field mappings
 */
export const CLIENT_FIELD_MAPPINGS: FieldMappingConfig = {
  ...COMMON_FIELD_MAPPINGS,
  'clientId': 'client_id',
  'fullName': 'full_name',
  'emailAddress': 'email_address',
  'dialCode': 'dial_code',
  'phoneNumber': 'phone_number',
  'address': 'address',
  'clientStatus': 'client_status'
};

/**
 * Map API field name to database column name using field mapping configuration
 * 
 * @param apiFieldName API field name (camelCase)
 * @param fieldMapping Field mapping configuration
 * @returns Database column name (snake_case)
 */
export function mapApiToDbField(apiFieldName: string, fieldMapping: FieldMappingConfig): string {
  return fieldMapping[apiFieldName] || apiFieldName;
}

/**
 * Map multiple API field names to database column names
 * 
 * @param apiFields Array of API field names
 * @param fieldMapping Field mapping configuration
 * @returns Array of database column names
 */
export function mapApiToDbFields(apiFields: string[], fieldMapping: FieldMappingConfig): string[] {
  return apiFields.map(field => mapApiToDbField(field, fieldMapping));
}

/**
 * Build Prisma sorting configuration from pagination parameters
 * 
 * @param params Pagination parameters with sorting
 * @param fieldMapping Field mapping configuration
 * @param defaultSortField Default field to sort by (DB column name)
 * @param defaultSortOrder Default sort order
 * @returns Prisma sorting configuration
 */
export function buildSorting(
  params: ExtendedPaginationWithFilters,
  fieldMapping: FieldMappingConfig,
  defaultSortField: string = 'created_at',
  defaultSortOrder: SortOrder = 'desc'
): Record<string, SortOrder> {
  // If explicit sorting object is provided, use it
  if (params.sorting && Object.keys(params.sorting).length > 0) {
    const mappedSorting: Record<string, SortOrder> = {};
    Object.entries(params.sorting).forEach(([field, order]) => {
      const dbField = mapApiToDbField(field, fieldMapping);
      mappedSorting[dbField] = order;
    });
    return mappedSorting;
  }

  // Otherwise, use sortBy and sortOrder parameters
  const sortBy = params.sortBy || defaultSortField;
  const sortOrder = params.sortOrder || defaultSortOrder;
  const dbField = mapApiToDbField(sortBy, fieldMapping);
  
  return { [dbField]: sortOrder };
}

/**
 * Validate that a field name exists in the field mapping
 * 
 * @param apiFieldName API field name to validate
 * @param fieldMapping Field mapping configuration
 * @returns True if field is valid
 */
export function isValidSortField(apiFieldName: string, fieldMapping: FieldMappingConfig): boolean {
  return fieldMapping.hasOwnProperty(apiFieldName);
}

/**
 * Get all valid sort fields for an entity
 * 
 * @param fieldMapping Field mapping configuration
 * @returns Array of valid API field names for sorting
 */
export function getValidSortFields(fieldMapping: FieldMappingConfig): string[] {
  return Object.keys(fieldMapping);
}

/**
 * Create a reverse mapping from database column names to API field names
 * 
 * @param fieldMapping Field mapping configuration
 * @returns Reverse mapping (DB → API)
 */
export function createReverseFieldMapping(fieldMapping: FieldMappingConfig): Record<string, string> {
  const reverseMapping: Record<string, string> = {};
  Object.entries(fieldMapping).forEach(([apiField, dbField]) => {
    reverseMapping[dbField] = apiField;
  });
  return reverseMapping;
}

/**
 * Validate sort parameters against field mapping
 * 
 * @param sortBy Sort field from request
 * @param fieldMapping Field mapping configuration
 * @param defaultField Default field if validation fails
 * @returns Validated and mapped sort field
 */
export function validateAndMapSortField(
  sortBy: string | undefined,
  fieldMapping: FieldMappingConfig,
  defaultField: string = 'created_at'
): string {
  if (!sortBy) {
    return defaultField;
  }
  
  if (isValidSortField(sortBy, fieldMapping)) {
    return mapApiToDbField(sortBy, fieldMapping);
  }
  
  // If the field is already a database column name, check if it's valid
  const reverseMapping = createReverseFieldMapping(fieldMapping);
  if (reverseMapping.hasOwnProperty(sortBy)) {
    return sortBy;
  }
  
  // Fall back to default field
  return defaultField;
}
