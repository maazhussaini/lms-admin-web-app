/**
 * @file user-entities-checks.types.ts
 * @description Check constraint definitions for user entities following PostgreSQL best practices.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for user entities with consistent naming conventions
 */
export const USER_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
  // Common user validations - removed system_users
  USERNAME_LENGTH_CHECK: {
    table: 'students,teachers',
    constraintName: 'chk_username_length',
    condition: 'LENGTH(TRIM(username)) >= 3 AND LENGTH(TRIM(username)) <= 50',
    description: 'Username must be between 3-50 characters (trimmed)'
  },

  FULL_NAME_LENGTH_CHECK: {
    table: 'students,teachers',
    constraintName: 'chk_full_name_length',
    condition: 'LENGTH(TRIM(full_name)) >= 2 AND LENGTH(TRIM(full_name)) <= 255',
    description: 'Full name must be between 2-255 characters (trimmed)'
  },

  FIRST_NAME_LENGTH_CHECK: {
    table: 'students,teachers',
    constraintName: 'chk_first_name_length',
    condition: 'LENGTH(TRIM(first_name)) >= 1 AND LENGTH(TRIM(first_name)) <= 100',
    description: 'First name must be between 1-100 characters (trimmed)'
  },

  LAST_NAME_LENGTH_CHECK: {
    table: 'students,teachers',
    constraintName: 'chk_last_name_length',
    condition: 'LENGTH(TRIM(last_name)) >= 1 AND LENGTH(TRIM(last_name)) <= 100',
    description: 'Last name must be between 1-100 characters (trimmed)'
  },

  VALID_AGE_CHECK: {
    table: 'students,teachers',
    constraintName: 'chk_age_range',
    condition: 'age IS NULL OR (age >= 5 AND age <= 120)',
    description: 'Age must be between 5-120 when provided'
  },

  GENDER_ENUM_CHECK: {
    table: 'students,teachers',
    constraintName: 'chk_gender_range',
    condition: 'gender IS NULL OR gender BETWEEN 1 AND 2',
    description: 'Gender must be 1 (Male) or 2 (Female) when provided'
  },

  ZIP_CODE_FORMAT_CHECK: {
    table: 'students,teachers',
    constraintName: 'chk_zip_code_format',
    condition: "zip_code IS NULL OR zip_code ~ '^[A-Za-z0-9\\s\\-]{3,20}$'",
    description: 'Zip code must be 3-20 alphanumeric characters when provided'
  },

  // Student-specific validations
  STUDENT_STATUS_ENUM_CHECK: {
    table: 'students',
    constraintName: 'chk_student_status_range',
    condition: 'student_status',
    description: 'Student status must be within valid enum range (1-7)'
  },

  // Device-specific validations
  DEVICE_TYPE_ENUM_CHECK: {
    table: 'student_devices',
    constraintName: 'chk_device_type_range',
    condition: 'device_type BETWEEN 1 AND 4',
    description: 'Device type must be within valid enum range (1-4)'
  },

  DEVICE_IDENTIFIER_LENGTH_CHECK: {
    table: 'student_devices',
    constraintName: 'chk_device_identifier_length',
    condition: 'LENGTH(TRIM(device_identifier)) >= 10 AND LENGTH(TRIM(device_identifier)) <= 255',
    description: 'Device identifier must be between 10-255 characters (trimmed)'
  },

  MAC_ADDRESS_FORMAT_CHECK: {
    table: 'student_devices',
    constraintName: 'chk_mac_address_format',
    condition: "mac_address IS NULL OR mac_address ~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'",
    description: 'MAC address must be in valid format (XX:XX:XX:XX:XX:XX) when provided'
  },

  IP_ADDRESS_FORMAT_CHECK: {
    table: 'student_devices',
    constraintName: 'chk_ip_address_format',
    condition: "device_ip IS NULL OR device_ip ~ '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'",
    description: 'Device IP must be valid IPv4 format when provided'
  },

  // Contact information validations
  EMAIL_PRIORITY_CHECK: {
    table: 'student_email_addresses,teacher_email_addresses',
    constraintName: 'chk_email_priority_range',
    condition: 'priority IS NULL OR (priority >= 1 AND priority <= 10)',
    description: 'Email priority must be between 1-10 when provided'
  },

  // Institute name validation
  INSTITUTE_NAME_LENGTH_CHECK: {
    table: 'institutes',
    constraintName: 'chk_institute_name_length',
    condition: 'LENGTH(TRIM(institute_name)) >= 2 AND LENGTH(TRIM(institute_name)) <= 255',
    description: 'Institute name must be between 2-255 characters (trimmed)'
  },

  // Enrollment-specific validations
  ENROLLMENT_STATUS_ENUM_CHECK: {
    table: 'enrollments',
    constraintName: 'chk_enrollment_status_range',
    condition: 'enrollment_status_id BETWEEN 1 AND 8',
    description: 'Enrollment status must be within valid enum range (1-8)'
  },

  ENROLLMENT_DATE_LOGIC_CHECK: {
    table: 'enrollments',
    constraintName: 'chk_enrollment_date_logic',
    condition: 'expected_completion_date IS NULL OR expected_completion_date > enrolled_at',
    description: 'Expected completion date must be after enrollment date'
  },

  COMPLETION_DATE_LOGIC_CHECK: {
    table: 'enrollments',
    constraintName: 'chk_completion_date_logic',
    condition: 'actual_completion_date IS NULL OR actual_completion_date >= enrolled_at',
    description: 'Actual completion date must be on or after enrollment date'
  },

  COMPLETED_STATUS_DATE_CHECK: {
    table: 'enrollments',
    constraintName: 'chk_completed_status_date',
    condition: '(enrollment_status_id = 3 AND actual_completion_date IS NOT NULL) OR (enrollment_status_id != 3)',
    description: 'Completed status must have actual completion date'
  },

  FINAL_SCORE_RANGE_CHECK: {
    table: 'enrollments',
    constraintName: 'chk_final_score_range',
    condition: 'final_score IS NULL OR (final_score >= 0 AND final_score <= 100)',
    description: 'Final score must be between 0-100 when provided'
  },

  GRADE_FORMAT_CHECK: {
    table: 'enrollments',
    constraintName: 'chk_grade_format',
    condition: "grade IS NULL OR grade ~ '^[A-F][+-]?$|^(PASS|FAIL|INCOMPLETE)$'",
    description: 'Grade must be valid format (A-F with optional +/-, PASS, FAIL, INCOMPLETE)'
  },

  // Enrollment status history validations
  ENROLLMENT_HISTORY_STATUS_ENUM_CHECK: {
    table: 'enrollment_status_history',
    constraintName: 'chk_enrollment_history_status_range',
    condition: 'new_status_id BETWEEN 1 AND 8 AND (previous_status_id IS NULL OR previous_status_id BETWEEN 1 AND 8)',
    description: 'Both previous and new status must be within valid enum range'
  },

  ENROLLMENT_HISTORY_STATUS_CHANGE_CHECK: {
    table: 'enrollment_status_history',
    constraintName: 'chk_enrollment_history_status_change',
    condition: 'previous_status_id IS NULL OR previous_status_id != new_status_id',
    description: 'Status change must represent actual change (new status different from previous)'
  },

  ENROLLMENT_HISTORY_REASON_LENGTH_CHECK: {
    table: 'enrollment_status_history',
    constraintName: 'chk_enrollment_history_reason_length',
    condition: 'change_reason IS NULL OR LENGTH(TRIM(change_reason)) >= 5',
    description: 'Change reason must be at least 5 characters when provided'
  },
};
