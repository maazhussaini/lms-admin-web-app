/**
 * @file user-enum-constraints.types.ts
 * @description User entity enum constraints for students, teachers, and devices.
 */

import { EnumConstraint } from '../base-constraint.types';

/**
 * User entity enum constraints with consistent naming
 */
export const USER_ENUM_CONSTRAINTS: Record<string, EnumConstraint> = {
  // Gender enum for users
  GENDER_ENUM: {
    table: 'students,teachers',
    constraintName: 'chk_gender_valid',
    column: 'gender',
    enumName: 'Gender',
    enumValues: { 
      MALE: 1, 
      FEMALE: 2 
    },
    description: 'Validates gender enumeration values'
  },

  // Student status enum
  STUDENT_STATUS_ENUM: {
    table: 'students',
    constraintName: 'chk_student_status_valid',
    column: 'student_status',
    enumName: 'StudentStatus',
    enumValues: {
      ACTIVE: 1,
      ALUMNI: 2,
      DROPOUT: 3,
      ACCOUNT_FREEZED: 4,
      BLACKLISTED: 5,
      SUSPENDED: 6,
      DEACTIVATED: 7
    },
    description: 'Validates student status enumeration values'
  },

  // Device type enum
  DEVICE_TYPE_ENUM: {
    table: 'student_devices',
    constraintName: 'chk_device_type_valid',
    column: 'device_type',
    enumName: 'DeviceType',
    enumValues: { 
      IOS: 1, 
      ANDROID: 2, 
      WEB: 3, 
      DESKTOP: 4 
    },
    description: 'Validates device type enumeration values'
  },

  // Enrollment status enum
  ENROLLMENT_STATUS_ENUM: {
    table: 'enrollments',
    constraintName: 'chk_enrollment_status_valid',
    column: 'enrollment_status_id',
    enumName: 'EnrollmentStatus',
    enumValues: {
      PENDING: 1,
      ACTIVE: 2,
      COMPLETED: 3,
      DROPPED: 4,
      SUSPENDED: 5,
      EXPELLED: 6,
      TRANSFERRED: 7,
      DEFERRED: 8
    },
    description: 'Validates enrollment status enumeration values'
  },
};
