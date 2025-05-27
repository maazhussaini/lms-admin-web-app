/**
 * @file course-session-entities-checks.types.ts
 * @description Check constraint definitions for course session management entities.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for course session entities
 */
export const COURSE_SESSION_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
  // Course session validations
  SESSION_NAME_LENGTH_CHECK: {
    table: 'course_sessions',
    constraintName: 'chk_session_name_length',
    condition: 'LENGTH(TRIM(session_name)) >= 2 AND LENGTH(TRIM(session_name)) <= 255',
    description: 'Course session name must be between 2-255 characters (trimmed)'
  },

  SESSION_DESCRIPTION_LENGTH_CHECK: {
    table: 'course_sessions',
    constraintName: 'chk_session_description_length',
    condition: 'session_description IS NULL OR LENGTH(session_description) <= 1000',
    description: 'Course session description must not exceed 1000 characters when provided'
  },

  SESSION_DATE_CONSISTENCY_CHECK: {
    table: 'course_sessions',
    constraintName: 'chk_session_date_consistency',
    condition: 'start_date < end_date',
    description: 'Session start date must be before end date'
  },

  SESSION_MAX_STUDENTS_CHECK: {
    table: 'course_sessions',
    constraintName: 'chk_session_max_students',
    condition: 'max_students IS NULL OR max_students > 0',
    description: 'Maximum students must be positive when provided'
  },

  SESSION_CODE_FORMAT_CHECK: {
    table: 'course_sessions',
    constraintName: 'chk_session_code_format',
    condition: "session_code IS NULL OR session_code ~ '^[A-Z0-9]{6,12}$'",
    description: 'Session code must be 6-12 uppercase alphanumeric characters when provided'
  },

  ENROLLMENT_DEADLINE_CHECK: {
    table: 'course_sessions',
    constraintName: 'chk_enrollment_deadline',
    condition: 'enrollment_deadline IS NULL OR enrollment_deadline <= start_date',
    description: 'Enrollment deadline must be before or equal to session start date when provided'
  },

  // Session enrollment validations
  ENROLLMENT_COMPLETION_PERCENTAGE_CHECK: {
    table: 'course_session_enrollments',
    constraintName: 'chk_enrollment_completion_percentage',
    condition: 'completion_percentage >= 0 AND completion_percentage <= 100',
    description: 'Completion percentage must be between 0-100'
  },

  ENROLLMENT_GRADE_RANGE_CHECK: {
    table: 'course_session_enrollments',
    constraintName: 'chk_enrollment_grade_range',
    condition: 'final_grade IS NULL OR (final_grade >= 0 AND final_grade <= 100)',
    description: 'Final grade must be between 0-100 when provided'
  },

  ENROLLMENT_DROP_DATE_CHECK: {
    table: 'course_session_enrollments',
    constraintName: 'chk_enrollment_drop_date',
    condition: 'dropped_at IS NULL OR dropped_at >= enrolled_at',
    description: 'Drop date must be after enrollment date when provided'
  },

  // Session announcement validations
  ANNOUNCEMENT_TITLE_LENGTH_CHECK: {
    table: 'course_session_announcements',
    constraintName: 'chk_announcement_title_length',
    condition: 'LENGTH(TRIM(title)) >= 2 AND LENGTH(TRIM(title)) <= 255',
    description: 'Announcement title must be between 2-255 characters (trimmed)'
  },

  ANNOUNCEMENT_MESSAGE_LENGTH_CHECK: {
    table: 'course_session_announcements',
    constraintName: 'chk_announcement_message_length',
    condition: 'LENGTH(TRIM(message)) >= 1 AND LENGTH(TRIM(message)) <= 2000',
    description: 'Announcement message must be between 1-2000 characters (trimmed)'
  },

  // Session settings validations
  REMINDER_DAYS_CHECK: {
    table: 'course_session_settings',
    constraintName: 'chk_reminder_days_range',
    condition: 'reminder_days_before_expiry >= 0 AND reminder_days_before_expiry <= 30',
    description: 'Reminder days must be between 0-30'
  },
};