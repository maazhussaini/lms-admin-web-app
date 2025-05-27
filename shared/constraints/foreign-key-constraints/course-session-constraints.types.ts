import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Foreign key constraints for course session entities.
 */
export const COURSE_SESSION_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Course session constraints
  SESSION_TEACHER_CONSTRAINT: {
    table: 'course_sessions',
    constraintName: 'fk_course_session_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course session assigned to teacher'
  },

  SESSION_COURSE_CONSTRAINT: {
    table: 'course_sessions',
    constraintName: 'fk_course_session_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course session for specific course'
  },

  SESSION_STATUS_CONSTRAINT: {
    table: 'course_sessions',
    constraintName: 'fk_course_session_status',
    column: 'course_session_status_id',
    referencedTable: 'course_session_status_lookups',
    referencedColumn: 'course_session_status_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course session status reference'
  },

  // Session enrollment constraints
  ENROLLMENT_SESSION_CONSTRAINT: {
    table: 'course_session_enrollments',
    constraintName: 'fk_session_enrollment_session',
    column: 'course_session_id',
    referencedTable: 'course_sessions',
    referencedColumn: 'course_session_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment belongs to course session'
  },

  ENROLLMENT_STUDENT_CONSTRAINT: {
    table: 'course_session_enrollments',
    constraintName: 'fk_session_enrollment_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment for student'
  },

  // Session announcement constraints
  ANNOUNCEMENT_SESSION_CONSTRAINT: {
    table: 'course_session_announcements',
    constraintName: 'fk_session_announcement_session',
    column: 'course_session_id',
    referencedTable: 'course_sessions',
    referencedColumn: 'course_session_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Announcement belongs to course session'
  },

  // Session settings constraints
  SETTINGS_SESSION_CONSTRAINT: {
    table: 'course_session_settings',
    constraintName: 'fk_session_settings_session',
    column: 'course_session_id',
    referencedTable: 'course_sessions',
    referencedColumn: 'course_session_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Settings belong to course session'
  },
};