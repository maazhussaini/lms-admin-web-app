/**
 * @file course-session-indexes.types.ts
 * @description Performance indexes for course session management.
 */

import { IndexConstraint } from '../base-constraint.types';

/**
 * Course session performance indexes
 */
export const COURSE_SESSION_PERFORMANCE_INDEXES: Record<string, IndexConstraint> = {
  // Course session primary indexes
  SESSION_STATUS_TENANT_LOOKUP: {
    table: 'course_sessions',
    constraintName: 'idx_course_session_status_tenant',
    indexName: 'idx_course_session_status_tenant',
    columns: ['course_session_status_id', 'tenant_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize session filtering by status within tenant'
  },

  SESSION_TEACHER_LOOKUP: {
    table: 'course_sessions',
    constraintName: 'idx_course_session_teacher',
    indexName: 'idx_course_session_teacher',
    columns: ['teacher_id', 'tenant_id', 'course_session_status_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher session queries'
  },

  SESSION_COURSE_LOOKUP: {
    table: 'course_sessions',
    constraintName: 'idx_course_session_course',
    indexName: 'idx_course_session_course',
    columns: ['course_id', 'tenant_id', 'course_session_status_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course session queries'
  },

  SESSION_DATE_RANGE_LOOKUP: {
    table: 'course_sessions',
    constraintName: 'idx_course_session_date_range',
    indexName: 'idx_course_session_date_range',
    columns: ['start_date', 'end_date', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize session date range queries'
  },

  SESSION_CODE_LOOKUP: {
    table: 'course_sessions',
    constraintName: 'idx_course_session_code',
    indexName: 'idx_course_session_code',
    columns: ['session_code'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize session join code lookups'
  },

  SESSION_EXPIRY_MONITORING: {
    table: 'course_sessions',
    constraintName: 'idx_course_session_expiry',
    indexName: 'idx_course_session_expiry',
    columns: ['end_date', 'course_session_status_id', 'auto_expire_enabled'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'course_session_status_id = 2 AND auto_expire_enabled = true', // PUBLISHED and auto-expire enabled
    description: 'Optimize expiry monitoring for active sessions'
  },

  // Session enrollment indexes
  ENROLLMENT_SESSION_LOOKUP: {
    table: 'course_session_enrollments',
    constraintName: 'idx_session_enrollment_session',
    indexName: 'idx_session_enrollment_session',
    columns: ['course_session_id', 'enrollment_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize enrollment queries by session'
  },

  ENROLLMENT_STUDENT_LOOKUP: {
    table: 'course_session_enrollments',
    constraintName: 'idx_session_enrollment_student',
    indexName: 'idx_session_enrollment_student',
    columns: ['student_id', 'tenant_id', 'enrollment_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student enrollment history'
  },

  ENROLLMENT_COMPLETION_ANALYTICS: {
    table: 'course_session_enrollments',
    constraintName: 'idx_session_enrollment_completion',
    indexName: 'idx_session_enrollment_completion',
    columns: ['course_session_id', 'completion_percentage', 'enrollment_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize completion analytics'
  },

  // Session announcement indexes
  ANNOUNCEMENT_SESSION_CHRONOLOGICAL: {
    table: 'course_session_announcements',
    constraintName: 'idx_session_announcement_chronological',
    indexName: 'idx_session_announcement_chronological',
    columns: ['course_session_id', 'created_at', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize chronological announcement retrieval'
  },

  ANNOUNCEMENT_URGENT_LOOKUP: {
    table: 'course_session_announcements',
    constraintName: 'idx_session_announcement_urgent',
    indexName: 'idx_session_announcement_urgent',
    columns: ['course_session_id', 'is_urgent', 'expires_at'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'is_urgent = true',
    description: 'Optimize urgent announcement queries'
  },

  // Session settings lookup
  SESSION_SETTINGS_LOOKUP: {
    table: 'course_session_settings',
    constraintName: 'idx_session_settings_lookup',
    indexName: 'idx_session_settings_lookup',
    columns: ['course_session_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize session settings queries'
  },
};