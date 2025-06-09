/**
 * @file user-indexes.types.ts
 * @description Performance indexes for user entities (students, teachers, system users).
 */

import { IndexConstraint } from '../base-constraint.types';

/**
 * User entity performance indexes
 */
export const USER_PERFORMANCE_INDEXES: Record<string, IndexConstraint> = {
  // User authentication indexes - removed system_users
  STUDENT_USERNAME_LOGIN: {
    table: 'students',
    constraintName: 'idx_student_username_tenant',
    indexName: 'idx_student_username_tenant',
    columns: ['username', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize student login queries'
  },

  TEACHER_USERNAME_LOGIN: {
    table: 'teachers',
    constraintName: 'idx_teacher_username_tenant',
    indexName: 'idx_teacher_username_tenant',
    columns: ['username', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize teacher login queries'
  },

  // Removed all system_user indexes - handled in core indexes

  // Student specific indexes
  STUDENT_STATUS_LOOKUP: {
    table: 'students',
    constraintName: 'idx_student_status_tenant',
    indexName: 'idx_student_status_tenant',
    columns: ['student_status', 'tenant_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student status filtering'
  },

  STUDENT_NAME_SEARCH: {
    table: 'students',
    constraintName: 'idx_student_name_search',
    indexName: 'idx_student_name_search',
    columns: ['full_name', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student name searches'
  },

  STUDENT_GEOGRAPHIC_LOOKUP: {
    table: 'students',
    constraintName: 'idx_student_geographic',
    indexName: 'idx_student_geographic',
    columns: ['country_id', 'state_id', 'city_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student geographic filtering'
  },

  STUDENT_AGE_FILTER: {
    table: 'students',
    constraintName: 'idx_student_age_filter',
    indexName: 'idx_student_age_filter',
    columns: ['age', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student age-based filtering'
  },

  // Teacher specific indexes
  TEACHER_NAME_SEARCH: {
    table: 'teachers',
    constraintName: 'idx_teacher_name_search',
    indexName: 'idx_teacher_name_search',
    columns: ['full_name', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher name searches'
  },

  TEACHER_JOINING_DATE: {
    table: 'teachers',
    constraintName: 'idx_teacher_joining_date',
    indexName: 'idx_teacher_joining_date',
    columns: ['joining_date', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher joining date queries'
  },

  TEACHER_LAST_LOGIN: {
    table: 'teachers',
    constraintName: 'idx_teacher_last_login',
    indexName: 'idx_teacher_last_login',
    columns: ['last_login_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher last login tracking'
  },

  // Contact information indexes
  STUDENT_EMAIL_PRIMARY_LOOKUP: {
    table: 'student_email_addresses',
    constraintName: 'idx_student_email_primary',
    indexName: 'idx_student_email_primary',
    columns: ['student_id', 'is_primary'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize primary email lookups'
  },

  STUDENT_EMAIL_ADDRESS_SEARCH: {
    table: 'student_email_addresses',
    constraintName: 'idx_student_email_search',
    indexName: 'idx_student_email_search',
    columns: ['email_address', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize email address searches'
  },

  STUDENT_PHONE_PRIMARY_LOOKUP: {
    table: 'student_phone_numbers',
    constraintName: 'idx_student_phone_primary',
    indexName: 'idx_student_phone_primary',
    columns: ['student_id', 'is_primary'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize primary phone lookups'
  },

  TEACHER_EMAIL_PRIMARY_LOOKUP: {
    table: 'teacher_email_addresses',
    constraintName: 'idx_teacher_email_primary',
    indexName: 'idx_teacher_email_primary',
    columns: ['teacher_id', 'is_primary'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher primary email lookups'
  },

  TEACHER_PHONE_PRIMARY_LOOKUP: {
    table: 'teacher_phone_numbers',
    constraintName: 'idx_teacher_phone_primary',
    indexName: 'idx_teacher_phone_primary',
    columns: ['teacher_id', 'is_primary'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher primary phone lookups'
  },

  // Device tracking indexes
  STUDENT_DEVICE_ACTIVE: {
    table: 'student_devices',
    constraintName: 'idx_student_device_active',
    indexName: 'idx_student_device_active',
    columns: ['student_id', 'is_active', 'last_active_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize active device queries'
  },

  STUDENT_DEVICE_TYPE_LOOKUP: {
    table: 'student_devices',
    constraintName: 'idx_student_device_type',
    indexName: 'idx_student_device_type',
    columns: ['device_type', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize device type filtering'
  },

  DEVICE_IDENTIFIER_LOOKUP: {
    table: 'student_devices',
    constraintName: 'idx_device_identifier',
    indexName: 'idx_device_identifier',
    columns: ['device_identifier'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize device identifier uniqueness checks'
  },

  // Enrollment indexes
  ENROLLMENT_STUDENT_COURSE: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_student_course',
    indexName: 'idx_enrollment_student_course',
    columns: ['student_id', 'course_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize enrollment uniqueness and lookups'
  },

  ENROLLMENT_INSTITUTE_FILTER: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_institute',
    indexName: 'idx_enrollment_institute',
    columns: ['institute_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize institute-based enrollment queries'
  },

  ENROLLMENT_TEACHER_FILTER: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_teacher',
    indexName: 'idx_enrollment_teacher',
    columns: ['teacher_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher-based enrollment queries'
  },

  ENROLLMENT_DATE_FILTER: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_date',
    indexName: 'idx_enrollment_date',
    columns: ['enrolled_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize enrollment date filtering'
  },

  // Institute indexes
  INSTITUTE_NAME_SEARCH: {
    table: 'institutes',
    constraintName: 'idx_institute_name_search',
    indexName: 'idx_institute_name_search',
    columns: ['institute_name', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize institute name searches'
  },

  STUDENT_INSTITUTE_LOOKUP: {
    table: 'student_institutes',
    constraintName: 'idx_student_institute_lookup',
    indexName: 'idx_student_institute_lookup',
    columns: ['student_id', 'institute_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize student-institute association lookups'
  },

  // Teacher course assignment indexes
  TEACHER_COURSE_ASSIGNMENT: {
    table: 'teacher_courses',
    constraintName: 'idx_teacher_course_assignment',
    indexName: 'idx_teacher_course_assignment',
    columns: ['teacher_id', 'course_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize teacher course assignment lookups'
  },

  COURSE_TEACHER_LOOKUP: {
    table: 'teacher_courses',
    constraintName: 'idx_course_teacher_lookup',
    indexName: 'idx_course_teacher_lookup',
    columns: ['course_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course teacher queries'
  },

  // Enrollment status and date lookups
  ENROLLMENT_STATUS_DATE_LOOKUP: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_status_date',
    indexName: 'idx_enrollment_status_date',
    columns: ['enrollment_status_id', 'enrolled_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize enrollment status and date queries with tenant isolation'
  },

  // Course enrollment analytics
  ENROLLMENT_COURSE_STATUS_ANALYTICS: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_course_status_analytics',
    indexName: 'idx_enrollment_course_status_analytics',
    columns: ['course_id', 'enrollment_status_id', 'actual_completion_date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course completion and status analytics'
  },

  // Student enrollment history lookup
  ENROLLMENT_STUDENT_HISTORY: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_student_history',
    indexName: 'idx_enrollment_student_history',
    columns: ['student_id', 'enrolled_at', 'enrollment_status_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student enrollment history queries'
  },

  // Institute enrollment tracking
  ENROLLMENT_INSTITUTE_TRACKING: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_institute_tracking',
    indexName: 'idx_enrollment_institute_tracking',
    columns: ['institute_id', 'enrollment_status_id', 'enrolled_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize institute enrollment tracking and reporting'
  },

  // Teacher course enrollments
  ENROLLMENT_TEACHER_COURSE: {
    table: 'enrollments',
    constraintName: 'idx_enrollment_teacher_course',
    indexName: 'idx_enrollment_teacher_course',
    columns: ['teacher_id', 'course_id', 'enrollment_status_id'],
    indexType: 'BTREE',
    isUnique: false,
    condition: 'teacher_id IS NOT NULL',
    description: 'Optimize teacher course enrollment queries'
  },

  // Enrollment status history lookups
  ENROLLMENT_STATUS_HISTORY_LOOKUP: {
    table: 'enrollment_status_history',
    constraintName: 'idx_enrollment_status_history_lookup',
    indexName: 'idx_enrollment_status_history_lookup',
    columns: ['enrollment_id', 'status_changed_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize enrollment status history queries'
  },

  // Status change analytics
  ENROLLMENT_STATUS_CHANGE_ANALYTICS: {
    table: 'enrollment_status_history',
    constraintName: 'idx_enrollment_status_change_analytics',
    indexName: 'idx_enrollment_status_change_analytics',
    columns: ['new_status_id', 'status_changed_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize status change analytics and reporting'
  },

  // Changed by user tracking
  ENROLLMENT_STATUS_CHANGED_BY: {
    table: 'enrollment_status_history',
    constraintName: 'idx_enrollment_status_changed_by',
    indexName: 'idx_enrollment_status_changed_by',
    columns: ['changed_by', 'status_changed_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize queries for who changed enrollment statuses'
  },
};
