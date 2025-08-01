import { MultiTenantAuditFields } from './base.types';

/**
 * Video upload status enumeration
 * @description Represents the lifecycle of a video upload
 */
export const VideoUploadStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type VideoUploadStatus = typeof VideoUploadStatus[keyof typeof VideoUploadStatus];

/**
 * Course status enumeration
 * @description Represents the lifecycle status of a course
 */
export const CourseStatus = {
  DRAFT: 'DRAFT',
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const;

export type CourseStatus = typeof CourseStatus[keyof typeof CourseStatus];


/**
 * Course type enumeration
 * @description Represents the type of course, such as free, paid, or purchased
 */
export const CourseType = {
  FREE: 'FREE',
  PAID: 'PAID',
  PURCHASED: 'PURCHASED',
} as const;

export type CourseType = typeof CourseType[keyof typeof CourseType];

/**
 * Represents a program with multi-tenant isolation
 * @description Academic program entity
 */
export interface Program extends MultiTenantAuditFields {
  program_id: number;
  program_name: string;
  program_thumbnail_url?: string | null;
}

/**
 * Represents a specialization with multi-tenant isolation
 * @description Academic specialization within a program
 */
export interface Specialization extends MultiTenantAuditFields {
  specialization_id: number;
  program_id: number; // Foreign key to Program
  specialization_name: string;
  specialization_thumbnail_url?: string | null;
}

/**
 * Represents a course with multi-tenant isolation
 * @description Core course entity with comprehensive information
 */
export interface Course extends MultiTenantAuditFields {
  course_id: number;
  course_name: string;
  course_description?: string | null;
  main_thumbnail_url?: string | null;
  course_status: CourseStatus;
  course_total_hours?: number | null; // Auto-calculated by backend based on sum of video durations
  specialization_id?: number | null; // Foreign key to Specialization
  course_type: CourseType;
  course_price: number | null; // Applicable for paid courses
}

/**
 * Represents a course module with multi-tenant isolation
 * @description Structural component of a course
 */
export interface CourseModule extends MultiTenantAuditFields {
  course_module_id: number;
  course_id: number; // Foreign key to Course
  course_module_name: string;
  position?: number | null;
}

/**
 * Represents a course topic with multi-tenant isolation
 * @description Content topic within a course module
 */
export interface CourseTopic extends MultiTenantAuditFields {
  course_topic_id: number;
  course_topic_name: string;
  module_id: number; // Foreign key to CourseModule
  position?: number | null;
}

/**
 * Represents a course video with multi-tenant isolation
 * @description Video content within a course topic
 */
export interface CourseVideo extends MultiTenantAuditFields {
  course_video_id: number;
  course_id: number; // Foreign key to Course
  course_topic_id: number; // Foreign key to CourseTopic
  bunny_video_id: string; // Unique identifier for the video in Bunny.net
  video_name: string;
  video_url: string; // Playback manifest URL from Bunny.net (e.g., HLS .m3u8)
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  position?: number | null;
  upload_status?: VideoUploadStatus;
  is_locked?: boolean; // Indicates if the video is locked for students
}

/**
 * Represents a course document with multi-tenant isolation
 * @description Document/resource within a course topic
 */
export interface CourseDocument extends MultiTenantAuditFields {
  course_document_id: number;
  course_id: number; // Foreign key to Course
  document_name: string;
  document_url: string;
  course_topic_id: number; // Foreign key to CourseTopic
}

/**
 * Tracks student progress on individual videos with multi-tenant isolation
 * @description Individual video viewing progress tracking
 */
export interface VideoProgress extends MultiTenantAuditFields {
  video_progress_id: number;
  student_id: number; // Foreign key to Student
  course_video_id: number; // Foreign key to CourseVideo
  watch_duration_seconds: number;
  completion_percentage: number; // 0-100
  last_watched_at: Date | string;
  is_completed: boolean;
}

/**
 * Tracks overall student progress in a course with multi-tenant isolation
 * @description Comprehensive course progress tracking
 */
export interface StudentCourseProgress extends MultiTenantAuditFields {
  student_course_progress_id: number;
  student_id: number; // Foreign key to Student
  course_id: number; // Foreign key to Course
  overall_progress_percentage: number; // 0-100
  modules_completed: number;
  videos_completed: number;
  quizzes_completed: number;
  assignments_completed: number;
  total_time_spent_minutes: number;
  last_accessed_at: Date | string;
  is_course_completed: boolean;
  completion_date?: Date | string | null;
}


export interface SpecializationProgram {
  specialization_program_id: number;
  specialization_id: number;
  program_id: number;  
}

export interface CourseSpecialization {
  course_specialization_id: number;
  course_id: number;
  specialization_id: number;
}