/**
 * @file user-unique-constraints.types.ts
 * @description Unique constraints for user entities following PostgreSQL best practices.
 */

import { UniqueConstraint } from '../base-constraint.types';

/**
 * User entity unique constraints with proper partial constraint handling
 */
export const USER_UNIQUE_CONSTRAINTS: Record<string, UniqueConstraint> = {
  // User authentication unique constraints
  STUDENT_USERNAME_UNIQUE: {
    table: 'students',
    constraintName: 'uq_student_username_tenant',
    columns: ['username', 'tenant_id'],
    description: 'Student username must be unique within tenant'
  },

  TEACHER_USERNAME_UNIQUE: {
    table: 'teachers',
    constraintName: 'uq_teacher_username_tenant',
    columns: ['username', 'tenant_id'],
    description: 'Teacher username must be unique within tenant'
  },

  // Email unique constraints with proper primary handling
  STUDENT_PRIMARY_EMAIL_UNIQUE: {
    table: 'student_email_addresses',
    constraintName: 'uq_student_primary_email',
    columns: ['student_id'],
    condition: 'is_primary = true',
    description: 'Only one primary email per student (partial unique constraint)'
  },

  TEACHER_PRIMARY_EMAIL_UNIQUE: {
    table: 'teacher_email_addresses',
    constraintName: 'uq_teacher_primary_email',
    columns: ['teacher_id'],
    condition: 'is_primary = true',
    description: 'Only one primary email per teacher (partial unique constraint)'
  },

  STUDENT_EMAIL_ADDRESS_UNIQUE: {
    table: 'student_email_addresses',
    constraintName: 'uq_student_email_tenant',
    columns: ['email_address', 'tenant_id'],
    description: 'Student email must be unique within tenant'
  },

  TEACHER_EMAIL_ADDRESS_UNIQUE: {
    table: 'teacher_email_addresses',
    constraintName: 'uq_teacher_email_tenant',
    columns: ['email_address', 'tenant_id'],
    description: 'Teacher email must be unique within tenant'
  },

  // Phone unique constraints with proper primary handling
  STUDENT_PRIMARY_PHONE_UNIQUE: {
    table: 'student_phone_numbers',
    constraintName: 'uq_student_primary_phone',
    columns: ['student_id'],
    condition: 'is_primary = true',
    description: 'Only one primary phone per student (partial unique constraint)'
  },

  TEACHER_PRIMARY_PHONE_UNIQUE: {
    table: 'teacher_phone_numbers',
    constraintName: 'uq_teacher_primary_phone',
    columns: ['teacher_id'],
    condition: 'is_primary = true',
    description: 'Only one primary phone per teacher (partial unique constraint)'
  },

  STUDENT_PHONE_NUMBER_UNIQUE: {
    table: 'student_phone_numbers',
    constraintName: 'uq_student_phone_tenant',
    columns: ['dial_code', 'phone_number', 'tenant_id'],
    description: 'Student phone must be unique within tenant'
  },

  TEACHER_PHONE_NUMBER_UNIQUE: {
    table: 'teacher_phone_numbers',
    constraintName: 'uq_teacher_phone_tenant',
    columns: ['dial_code', 'phone_number', 'tenant_id'],
    description: 'Teacher phone must be unique within tenant'
  },

  // Device unique constraints
  DEVICE_IDENTIFIER_UNIQUE: {
    table: 'student_devices',
    constraintName: 'uq_device_identifier_student',
    columns: ['device_identifier', 'student_id'],
    description: 'Device identifier must be unique per student'
  },

  STUDENT_PRIMARY_DEVICE_UNIQUE: {
    table: 'student_devices',
    constraintName: 'uq_student_primary_device',
    columns: ['student_id'],
    condition: 'is_primary = true',
    description: 'Only one primary device per student (partial unique constraint)'
  },

  // Enrollment and association unique constraints
  STUDENT_COURSE_ENROLLMENT_UNIQUE: {
    table: 'enrollments',
    constraintName: 'uq_student_course_enrollment',
    columns: ['student_id', 'course_id'],
    description: 'Student can only be enrolled once per course'
  },

  // Prevent duplicate active enrollments
  STUDENT_COURSE_ACTIVE_ENROLLMENT_UNIQUE: {
    table: 'enrollments',
    constraintName: 'uq_student_course_active_enrollment',
    columns: ['student_id', 'course_id', 'tenant_id'],
    condition: 'enrollment_status_id IN (1, 2)', // PENDING, ACTIVE
    description: 'Student can have only one pending or active enrollment per course per tenant'
  },

  // Unique active enrollment per student-course-institute combination
  STUDENT_COURSE_INSTITUTE_ACTIVE_UNIQUE: {
    table: 'enrollments',
    constraintName: 'uq_student_course_institute_active',
    columns: ['student_id', 'course_id', 'institute_id'],
    condition: 'enrollment_status_id IN (1, 2)', // PENDING, ACTIVE
    description: 'Student can have only one active enrollment per course per institute'
  },

  // Prevent duplicate entries in enrollment status history
  ENROLLMENT_STATUS_HISTORY_UNIQUE: {
    table: 'enrollment_status_history',
    constraintName: 'uq_enrollment_status_history_entry',
    columns: ['enrollment_id', 'status_changed_at', 'new_status_id'],
    description: 'Unique status change entry per enrollment per timestamp'
  },

  INSTITUTE_NAME_TENANT_UNIQUE: {
    table: 'institutes',
    constraintName: 'uq_institute_name_tenant',
    columns: ['institute_name', 'tenant_id'],
    description: 'Institute name must be unique within tenant'
  },

  TEACHER_COURSE_ASSIGNMENT_UNIQUE: {
    table: 'teacher_courses',
    constraintName: 'uq_teacher_course_assignment',
    columns: ['teacher_id', 'course_id'],
    description: 'Teacher can be assigned to a course only once'
  },

  STUDENT_INSTITUTE_ASSOCIATION_UNIQUE: {
    table: 'student_institutes',
    constraintName: 'uq_student_institute_association',
    columns: ['student_id', 'institute_id'],
    description: 'Student can be associated with an institute only once'
  },
};
