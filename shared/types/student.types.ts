import { MultiTenantAuditFields, MinimalAuditFields } from './base.types';

/**
 * Gender enumeration
 * @description Represents the gender of a student
 */
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

/**
 * Student status enumeration
 * @description Represents the lifecycle status of a student
 */
export const StudentStatus = {
  ACTIVE: 'ACTIVE',
  ALUMNI: 'ALUMNI',
  DROPOUT: 'DROPOUT',
  ACCOUNT_FREEZED: 'ACCOUNT_FREEZED',
  BLACKLISTED: 'BLACKLISTED',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
} as const;

export type StudentStatus = typeof StudentStatus[keyof typeof StudentStatus];

/**
 * Device type enumeration
 * @description Represents the type of device used by a student
 */
export const DeviceType = {
  IOS: 'IOS',
  ANDROID: 'ANDROID',
  WEB: 'WEB',
  DESKTOP: 'DESKTOP',
} as const;

export type DeviceType = typeof DeviceType[keyof typeof DeviceType];

/**
 * Enrollment status enumeration
 * @description Represents the lifecycle status of a student's enrollment in a course
 */
export const EnrollmentStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
  SUSPENDED: 'SUSPENDED',
  EXPELLED: 'EXPELLED',
  TRANSFERRED: 'TRANSFERRED',
  DEFERRED: 'DEFERRED',
} as const;

export type EnrollmentStatus = typeof EnrollmentStatus[keyof typeof EnrollmentStatus];

/**
 * Represents a country with minimal audit fields
 * @description Geographic reference data (global)
 */
export interface Country extends MinimalAuditFields {
  country_id: number;
  name: string;
  iso_code_2?: string | null; // e.g., US
  iso_code_3?: string | null; // e.g., USA
  dial_code?: string | null; // e.g., +1
}

/**
 * Represents a state with minimal audit fields
 * @description Geographic reference data (global)
 */
export interface State extends MinimalAuditFields {
  state_id: number;
  country_id: number; // Foreign key to Country
  name: string;
  state_code?: string | null; // e.g., CA for California
}

/**
 * Represents a city with minimal audit fields
 * @description Geographic reference data (global)
 */
export interface City extends MinimalAuditFields {
  city_id: number;
  state_id: number; // Foreign key to State
  name: string;
}

/**
 * Represents a student with multi-tenant isolation
 * @description Student entity with comprehensive profile information
 */
export interface Student extends MultiTenantAuditFields {
  student_id: number;
  full_name: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  country_id: number; // Foreign key to Country
  state_id: number; // Foreign key to State
  city_id: number; // Foreign key to City
  address?: string | null;
  date_of_birth?: Date | string | null;
  profile_picture_url?: string | null;
  zip_code?: string | null;
  age?: number | null;
  gender?: Gender | null;
  username: string;
  password_hash: string;
  last_login_at?: Date | string | null;
  student_status: StudentStatus;
  referral_type?: string | null;
}

/**
 * Represents a student's email address with multi-tenant isolation
 * @description Student contact email information
 */
export interface StudentEmailAddress extends MultiTenantAuditFields {
  student_email_address_id: number;
  student_id: number; // Foreign key to Student
  email_address: string;
  is_primary: boolean;
  priority?: number | null;
}

/**
 * Represents a student's phone number with multi-tenant isolation
 * @description Student contact phone information
 */
export interface StudentPhoneNumber extends MultiTenantAuditFields {
  student_phone_number_id: number;
  student_id: number; // Foreign key to Student
  dial_code: string;
  phone_number: string;
  iso_country_code?: string | null;
  is_primary: boolean;
}

/**
 * Represents a student's device with multi-tenant isolation
 * @description Student device tracking for security and access control
 */
export interface StudentDevice extends MultiTenantAuditFields {
  student_device_id: number;
  student_id: number; // Foreign key to Student
  device_type: DeviceType;
  device_identifier: string; // Unique ID for the physical device/browser
  device_ip?: string | null;
  mac_address?: string | null;
  is_primary: boolean;
  last_active_at: Date | string;
}

/**
 * Enhanced enrollment with comprehensive status management
 * @description Student course enrollment with complete lifecycle tracking
 */
export interface Enrollment extends MultiTenantAuditFields {
  enrollment_id: number;
  course_id: number; // Foreign key to Course
  student_id: number; // Foreign key to Student
  institute_id: number; // Foreign key to Institute
  teacher_id?: number | null; // Foreign key to Teacher
  enrollment_status_id: EnrollmentStatus;
  enrolled_at: Date | string;
  expected_completion_date?: Date | string | null;
  actual_completion_date?: Date | string | null;
  status_changed_at?: Date | string | null;
  status_changed_by?: number | null; // Foreign key to system_users
  status_change_reason?: string | null;
  grade?: string | null;
  final_score?: number | null; // 0-100
}

/**
 * Tracks enrollment status history for audit purposes
 * @description Complete audit trail of enrollment status changes
 */
export interface EnrollmentStatusHistory extends MultiTenantAuditFields {
  enrollment_status_history_id: number;
  enrollment_id: number; // Foreign key to Enrollment
  previous_status_id?: EnrollmentStatus | null;
  new_status_id: EnrollmentStatus;
  status_changed_at: Date | string;
  changed_by: number; // Foreign key to system_users
  change_reason?: string | null;
  notes?: string | null;
}

/**
 * Represents an institute with multi-tenant isolation
 * @description Educational institution information
 */
export interface Institute extends MultiTenantAuditFields {
  institute_id: number;
  institute_name: string;
}

/**
 * Represents the association between a student and an institute
 * @description Many-to-many relationship between students and institutes
 */
export interface StudentInstitute extends MultiTenantAuditFields {
  student_institute_id: number;
  student_id: number; // Foreign key to Student
  institute_id: number; // Foreign key to Institute
}

// Type guards for runtime type checking
export const isGender = (value: any): value is Gender => 
  Object.values(Gender).includes(value);

export const isStudentStatus = (value: any): value is StudentStatus => 
  Object.values(StudentStatus).includes(value);

export const isDeviceType = (value: any): value is DeviceType => 
  Object.values(DeviceType).includes(value);

export const isEnrollmentStatus = (value: any): value is EnrollmentStatus => 
  Object.values(EnrollmentStatus).includes(value);