import { Gender } from './student.types';
import { MultiTenantAuditFields } from './base.types';

/**
 * Represents a teacher in the system with multi-tenant isolation
 * @description Teacher entity with comprehensive profile information
 */
export interface Teacher extends MultiTenantAuditFields {
  teacher_id: number;
  full_name: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  country_id?: number | null; // Foreign key to Country (optional)
  state_id?: number | null; // Foreign key to State (optional)
  city_id?: number | null; // Foreign key to City (optional)
  address?: string | null;
  date_of_birth?: Date | string | null;
  profile_picture_url?: string | null;
  teacher_qualification?: string | null;
  zip_code?: string | null;
  age?: number | null;
  gender?: Gender | null;
  username: string;
  password_hash: string;
  last_login_at?: Date | string | null;
  joining_date?: Date | string | null;
}

/**
 * Represents a teacher's email address with multi-tenant isolation
 * @description Teacher contact email information
 */
export interface TeacherEmailAddress extends MultiTenantAuditFields {
  teacher_email_address_id: number;
  teacher_id: number; // Foreign key to Teacher
  email_address: string;
  is_primary: boolean;
  priority?: number | null;
}

/**
 * Represents a teacher's phone number with multi-tenant isolation
 * @description Teacher contact phone information
 */
export interface TeacherPhoneNumber extends MultiTenantAuditFields {
  teacher_phone_number_id: number;
  teacher_id: number; // Foreign key to Teacher
  dial_code: string;
  phone_number: string;
  iso_country_code?: string | null;
  is_primary: boolean;
}

/**
 * Represents the association between a teacher and a course
 * @description Many-to-many relationship between teachers and courses
 */
export interface TeacherCourse extends MultiTenantAuditFields {
  teacher_course_id: number;
  course_id: number; // Foreign key to Course
  teacher_id: number; // Foreign key to Teacher
}