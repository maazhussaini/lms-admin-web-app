import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Foreign key constraints for user entities (students, teachers, system users)
 */
export const USER_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Generic user constraints
  STUDENT_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_student_reference',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Reference to student entity'
  },
  
  TEACHER_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_teacher_reference',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Reference to teacher entity'
  },

  // Student geographic constraints (required)
  STUDENT_COUNTRY_CONSTRAINT: {
    table: 'students',
    constraintName: 'fk_student_country',
    column: 'country_id',
    referencedTable: 'countries',
    referencedColumn: 'country_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student must have a valid country'
  },

  STUDENT_STATE_CONSTRAINT: {
    table: 'students',
    constraintName: 'fk_student_state',
    column: 'state_id',
    referencedTable: 'states',
    referencedColumn: 'state_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student must have a valid state'
  },

  STUDENT_CITY_CONSTRAINT: {
    table: 'students',
    constraintName: 'fk_student_city',
    column: 'city_id',
    referencedTable: 'cities',
    referencedColumn: 'city_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student must have a valid city'
  },

  // Teacher geographic constraints (optional)
  TEACHER_COUNTRY_CONSTRAINT: {
    table: 'teachers',
    constraintName: 'fk_teacher_country',
    column: 'country_id',
    referencedTable: 'countries',
    referencedColumn: 'country_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Teacher country reference (optional)'
  },

  TEACHER_STATE_CONSTRAINT: {
    table: 'teachers',
    constraintName: 'fk_teacher_state',
    column: 'state_id',
    referencedTable: 'states',
    referencedColumn: 'state_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Teacher state reference (optional)'
  },

  TEACHER_CITY_CONSTRAINT: {
    table: 'teachers',
    constraintName: 'fk_teacher_city',
    column: 'city_id',
    referencedTable: 'cities',
    referencedColumn: 'city_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Teacher city reference (optional)'
  },

  // Contact information constraints
  STUDENT_EMAIL_STUDENT_CONSTRAINT: {
    table: 'student_email_addresses',
    constraintName: 'fk_student_email_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student email belongs to student'
  },

  STUDENT_PHONE_STUDENT_CONSTRAINT: {
    table: 'student_phone_numbers',
    constraintName: 'fk_student_phone_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student phone belongs to student'
  },

  TEACHER_EMAIL_TEACHER_CONSTRAINT: {
    table: 'teacher_email_addresses',
    constraintName: 'fk_teacher_email_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Teacher email belongs to teacher'
  },

  TEACHER_PHONE_TEACHER_CONSTRAINT: {
    table: 'teacher_phone_numbers',
    constraintName: 'fk_teacher_phone_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Teacher phone belongs to teacher'
  },

  // Student device constraints
  STUDENT_DEVICE_STUDENT_CONSTRAINT: {
    table: 'student_devices',
    constraintName: 'fk_student_device_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student device belongs to student'
  },

  // Institution constraints
  INSTITUTE_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_institute_reference',
    column: 'institute_id',
    referencedTable: 'institutes',
    referencedColumn: 'institute_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Educational institute reference'
  },

  // Enrollment constraints
  ENROLLMENT_STUDENT_CONSTRAINT: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment belongs to student'
  },

  ENROLLMENT_INSTITUTE_CONSTRAINT: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_institute',
    column: 'institute_id',
    referencedTable: 'institutes',
    referencedColumn: 'institute_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment belongs to institute'
  },

  ENROLLMENT_TEACHER_CONSTRAINT: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Enrollment teacher reference (optional)'
  },

  // Student institute association constraints
  STUDENT_INSTITUTE_STUDENT_CONSTRAINT: {
    table: 'student_institutes',
    constraintName: 'fk_student_institute_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student institute association belongs to student'
  },

  STUDENT_INSTITUTE_INSTITUTE_CONSTRAINT: {
    table: 'student_institutes',
    constraintName: 'fk_student_institute_institute',
    column: 'institute_id',
    referencedTable: 'institutes',
    referencedColumn: 'institute_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student institute association belongs to institute'
  },

  // Teacher course assignment constraints
  TEACHER_COURSE_TEACHER_CONSTRAINT: {
    table: 'teacher_courses',
    constraintName: 'fk_teacher_course_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Teacher course assignment belongs to teacher'
  },

  TEACHER_COURSE_COURSE_CONSTRAINT: {
    table: 'teacher_courses',
    constraintName: 'fk_teacher_course_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Teacher course assignment belongs to course'
  },

  // Enrollment foreign keys
  ENROLLMENT_COURSE_FK: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment must reference valid course'
  },

  ENROLLMENT_STUDENT_FK: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment must reference valid student'
  },

  ENROLLMENT_INSTITUTE_FK: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_institute',
    column: 'institute_id',
    referencedTable: 'institutes',
    referencedColumn: 'institute_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment must reference valid institute'
  },

  ENROLLMENT_TEACHER_FK: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Enrollment may reference valid teacher'
  },

  ENROLLMENT_STATUS_CHANGED_BY_FK: {
    table: 'enrollments',
    constraintName: 'fk_enrollment_status_changed_by',
    column: 'status_changed_by',
    referencedTable: 'system_users',
    referencedColumn: 'user_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Enrollment status change must reference valid system user'
  },

  // Enrollment status history foreign keys
  ENROLLMENT_STATUS_HISTORY_ENROLLMENT_FK: {
    table: 'enrollment_status_history',
    constraintName: 'fk_enrollment_status_history_enrollment',
    column: 'enrollment_id',
    referencedTable: 'enrollments',
    referencedColumn: 'enrollment_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment status history must reference valid enrollment'
  },

  ENROLLMENT_STATUS_HISTORY_CHANGED_BY_FK: {
    table: 'enrollment_status_history',
    constraintName: 'fk_enrollment_status_history_changed_by',
    column: 'changed_by',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Enrollment status history must reference valid system user who made the change'
  },
};
