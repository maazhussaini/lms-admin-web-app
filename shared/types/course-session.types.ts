import { MultiTenantAuditFields } from './base.types';

/**
 * Course session status enumeration
 * @description Defines the lifecycle status of a course session
 */
export enum CourseSessionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  EXPIRED = 'EXPIRED',
}

/**
 * Session enrollment status enumeration
 * @description Defines the enrollment status for course session enrollments
 */
export enum SessionEnrollmentStatus {
  PENDING = 'PENDING',
  ENROLLED = 'ENROLLED',
  DROPPED = 'DROPPED',
  COMPLETED = 'COMPLETED',
  EXPELLED = 'EXPELLED',
}

/**
 * Represents a course session with multi-tenant isolation
 * @description Time-bound learning container with one teacher, one course, multiple students
 */
export interface CourseSession extends MultiTenantAuditFields {
  course_session_id: number;
  session_name: string;
  session_description?: string | null;
  teacher_id: number; // Foreign key to Teacher
  course_id: number; // Foreign key to Course
  course_session_status: CourseSessionStatus; // Updated to use enum directly
  start_date: Date | string;
  end_date: Date | string;
  max_students?: number | null;
  enrollment_deadline?: Date | string | null;
  session_timezone?: string | null;
  session_code?: string | null; // Unique code for students to join
  auto_expire_enabled: boolean; // Whether to auto-kick students on expiry
}

/**
 * Represents course session enrollments with multi-tenant isolation
 * @description Student enrollment in a specific course session
 */
export interface CourseSessionEnrollment extends MultiTenantAuditFields {
  course_session_enrollment_id: number;
  course_session_id: number; // Foreign key to CourseSession
  student_id: number; // Foreign key to Student
  enrolled_at: Date | string;
  dropped_at?: Date | string | null;
  enrollment_status: SessionEnrollmentStatus; // Updated to use enum instead of string literals
  completion_percentage: number; // 0-100
  final_grade?: number | null;
  completion_date?: Date | string | null;
}

/**
 * Represents course session announcements with multi-tenant isolation
 * @description Teacher announcements for the course session
 */
export interface CourseSessionAnnouncement extends MultiTenantAuditFields {
  course_session_announcement_id: number;
  course_session_id: number; // Foreign key to CourseSession
  title: string;
  message: string;
  is_urgent: boolean;
  scheduled_for?: Date | string | null; // For scheduled announcements
  expires_at?: Date | string | null;
}

/**
 * Represents course session settings with multi-tenant isolation
 * @description Configuration settings for the course session
 */
export interface CourseSessionSettings extends MultiTenantAuditFields {
  course_session_settings_id: number;
  course_session_id: number; // Foreign key to CourseSession
  allow_late_enrollment: boolean;
  require_approval_for_enrollment: boolean;
  allow_student_discussions: boolean;
  send_reminder_emails: boolean;
  reminder_days_before_expiry: number;
  grading_scale?: Record<string, any> | null; // JSON for grading configuration
  attendance_tracking_enabled: boolean;
}

// Type guards for runtime type checking
export const isCourseSessionStatus = (value: any): value is CourseSessionStatus =>
  Object.values(CourseSessionStatus).includes(value);

export const isSessionEnrollmentStatus = (value: any): value is SessionEnrollmentStatus =>
  Object.values(SessionEnrollmentStatus).includes(value);