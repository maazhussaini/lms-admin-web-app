/**
 * @file course-session-enum-constraints.types.ts
 * @description Course session enum constraints.
 */

import { EnumConstraint } from '../base-constraint.types';

/**
 * Course session enum constraints following PostgreSQL naming conventions
 */
export const COURSE_SESSION_ENUM_CONSTRAINTS: Record<string, EnumConstraint> = {
  // Course session status enum
  COURSE_SESSION_STATUS_ENUM: {
    table: 'course_sessions',
    constraintName: 'chk_course_session_status_valid',
    column: 'course_session_status_id',
    enumName: 'CourseSessionStatus',
    enumValues: {
      DRAFT: 1,
      PUBLISHED: 2,
      EXPIRED: 3
    },
    description: 'Validates course session status enumeration values'
  },

  // Session enrollment status enum - fixed to use string values properly
  SESSION_ENROLLMENT_STATUS_ENUM: {
    table: 'course_session_enrollments',
    constraintName: 'chk_session_enrollment_status_valid',
    column: 'enrollment_status',
    enumName: 'SessionEnrollmentStatus',
    enumValues: {
      ENROLLED: 1,
      DROPPED: 2,
      COMPLETED: 3,
      EXPELLED: 4
    },
    description: 'Validates session enrollment status enumeration values'
  },
};