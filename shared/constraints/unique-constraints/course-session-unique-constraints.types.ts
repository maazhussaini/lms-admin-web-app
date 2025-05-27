/**
 * @file course-session-unique-constraints.types.ts
 * @description Unique constraints for course session entities.
 */

import { UniqueConstraint } from '../base-constraint.types';

/**
 * Course session unique constraints with consistent naming
 */
export const COURSE_SESSION_UNIQUE_CONSTRAINTS: Record<string, UniqueConstraint> = {
  // Course session unique constraints
  SESSION_NAME_TENANT_UNIQUE: {
    table: 'course_sessions',
    constraintName: 'uq_course_session_name_tenant',
    columns: ['session_name', 'tenant_id'],
    description: 'Course session name must be unique within tenant'
  },

  SESSION_CODE_UNIQUE: {
    table: 'course_sessions',
    constraintName: 'uq_course_session_code',
    columns: ['session_code'],
    condition: 'session_code IS NOT NULL',
    description: 'Session join code must be globally unique when provided'
  },

  TEACHER_COURSE_SESSION_OVERLAP_CHECK: {
    table: 'course_sessions',
    constraintName: 'uq_teacher_course_active_session',
    columns: ['teacher_id', 'course_id'],
    condition: 'course_session_status_id IN (1, 2)', // DRAFT or PUBLISHED
    description: 'Teacher can have only one active session per course (partial unique constraint)'
  },

  // Session enrollment unique constraints
  STUDENT_SESSION_ENROLLMENT_UNIQUE: {
    table: 'course_session_enrollments',
    constraintName: 'uq_student_session_enrollment',
    columns: ['course_session_id', 'student_id'],
    description: 'Student can be enrolled in a session only once'
  },

  // Session settings unique constraint
  SESSION_SETTINGS_UNIQUE: {
    table: 'course_session_settings',
    constraintName: 'uq_session_settings_per_session',
    columns: ['course_session_id'],
    description: 'Only one settings record per course session'
  },

  // Session announcement unique constraints
  SESSION_ANNOUNCEMENT_TITLE_UNIQUE: {
    table: 'course_session_announcements',
    constraintName: 'uq_session_announcement_title',
    columns: ['course_session_id', 'title'],
    description: 'Announcement title must be unique within session'
  },
};