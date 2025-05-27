/**
 * @file course-entities-checks.types.ts
 * @description Check constraint definitions for course entities following PostgreSQL best practices.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for course entities with consistent naming conventions
 */
export const COURSE_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
  // Program validations
  PROGRAM_NAME_LENGTH_CHECK: {
    table: 'programs',
    constraintName: 'chk_program_name_length',
    condition: 'LENGTH(TRIM(program_name)) >= 2 AND LENGTH(TRIM(program_name)) <= 255',
    description: 'Program name must be between 2-255 characters (trimmed)'
  },

  // Specialization validations
  SPECIALIZATION_NAME_LENGTH_CHECK: {
    table: 'specializations',
    constraintName: 'chk_specialization_name_length',
    condition: 'LENGTH(TRIM(specialization_name)) >= 2 AND LENGTH(TRIM(specialization_name)) <= 255',
    description: 'Specialization name must be between 2-255 characters (trimmed)'
  },

  // Course validations
  COURSE_NAME_LENGTH_CHECK: {
    table: 'courses',
    constraintName: 'chk_course_name_length',
    condition: 'LENGTH(TRIM(course_name)) >= 2 AND LENGTH(TRIM(course_name)) <= 255',
    description: 'Course name must be between 2-255 characters (trimmed)'
  },

  COURSE_TOTAL_HOURS_CHECK: {
    table: 'courses',
    constraintName: 'chk_course_total_hours_positive',
    condition: 'course_total_hours IS NULL OR course_total_hours > 0',
    description: 'Course total hours must be positive when provided'
  },

  COURSE_STATUS_ENUM_CHECK: {
    table: 'courses',
    constraintName: 'chk_course_status_range',
    condition: 'course_status_id BETWEEN 1 AND 4',
    description: 'Course status must be within valid enum range (1-4)'
  },

  COURSE_THUMBNAIL_URL_FORMAT_CHECK: {
    table: 'courses',
    constraintName: 'chk_course_thumbnail_url_format',
    condition: "main_thumbnail_url IS NULL OR main_thumbnail_url ~* '^https?://[^\\s/$.?#].[^\\s]*$'",
    description: 'Course thumbnail URL must be valid HTTP/HTTPS format when provided'
  },

  // Course module validations
  COURSE_MODULE_NAME_LENGTH_CHECK: {
    table: 'course_modules',
    constraintName: 'chk_course_module_name_length',
    condition: 'LENGTH(TRIM(course_module_name)) >= 2 AND LENGTH(TRIM(course_module_name)) <= 255',
    description: 'Course module name must be between 2-255 characters (trimmed)'
  },

  COURSE_MODULE_POSITION_CHECK: {
    table: 'course_modules',
    constraintName: 'chk_course_module_position_positive',
    condition: 'position IS NULL OR position > 0',
    description: 'Course module position must be positive when provided'
  },

  // Course topic validations
  COURSE_TOPIC_NAME_LENGTH_CHECK: {
    table: 'course_topics',
    constraintName: 'chk_course_topic_name_length',
    condition: 'LENGTH(TRIM(course_topic_name)) >= 2 AND LENGTH(TRIM(course_topic_name)) <= 255',
    description: 'Course topic name must be between 2-255 characters (trimmed)'
  },

  COURSE_TOPIC_POSITION_CHECK: {
    table: 'course_topics',
    constraintName: 'chk_course_topic_position_positive',
    condition: 'position IS NULL OR position > 0',
    description: 'Course topic position must be positive when provided'
  },

  // Course video validations
  COURSE_VIDEO_NAME_LENGTH_CHECK: {
    table: 'course_videos',
    constraintName: 'chk_course_video_name_length',
    condition: 'LENGTH(TRIM(video_name)) >= 1 AND LENGTH(TRIM(video_name)) <= 255',
    description: 'Course video name must be between 1-255 characters (trimmed)'
  },

  BUNNY_VIDEO_ID_LENGTH_CHECK: {
    table: 'course_videos',
    constraintName: 'chk_bunny_video_id_length',
    condition: 'LENGTH(TRIM(bunny_video_id)) >= 10 AND LENGTH(TRIM(bunny_video_id)) <= 255',
    description: 'Bunny video ID must be between 10-255 characters (trimmed)'
  },

  VIDEO_URL_FORMAT_CHECK: {
    table: 'course_videos',
    constraintName: 'chk_video_url_format',
    condition: "video_url ~* '^https?://[^\\s/$.?#].[^\\s]*$'",
    description: 'Video URL must be valid HTTP/HTTPS format'
  },

  VIDEO_THUMBNAIL_URL_FORMAT_CHECK: {
    table: 'course_videos',
    constraintName: 'chk_video_thumbnail_url_format',
    condition: "thumbnail_url IS NULL OR thumbnail_url ~* '^https?://[^\\s/$.?#].[^\\s]*$'",
    description: 'Video thumbnail URL must be valid HTTP/HTTPS format when provided'
  },

  COURSE_VIDEO_DURATION_CHECK: {
    table: 'course_videos',
    constraintName: 'chk_course_video_duration_non_negative',
    condition: 'duration_seconds IS NULL OR duration_seconds >= 0',
    description: 'Course video duration must be non-negative when provided'
  },

  COURSE_VIDEO_POSITION_CHECK: {
    table: 'course_videos',
    constraintName: 'chk_course_video_position_positive',
    condition: 'position IS NULL OR position > 0',
    description: 'Course video position must be positive when provided'
  },

  VIDEO_UPLOAD_STATUS_ENUM_CHECK: {
    table: 'course_videos',
    constraintName: 'chk_video_upload_status_range',
    condition: 'upload_status IS NULL OR upload_status BETWEEN 1 AND 5',
    description: 'Video upload status must be within valid enum range (1-5) when provided'
  },

  // Course document validations
  COURSE_DOCUMENT_NAME_LENGTH_CHECK: {
    table: 'course_documents',
    constraintName: 'chk_course_document_name_length',
    condition: 'LENGTH(TRIM(document_name)) >= 1 AND LENGTH(TRIM(document_name)) <= 255',
    description: 'Course document name must be between 1-255 characters (trimmed)'
  },

  DOCUMENT_URL_FORMAT_CHECK: {
    table: 'course_documents',
    constraintName: 'chk_document_url_format',
    condition: "document_url ~* '^https?://[^\\s/$.?#].[^\\s]*$'",
    description: 'Document URL must be valid HTTP/HTTPS format'
  },

  // Progress tracking validations
  VIDEO_PROGRESS_DURATION_CHECK: {
    table: 'video_progresses',
    constraintName: 'chk_video_progress_duration_non_negative',
    condition: 'watch_duration_seconds >= 0',
    description: 'Video watch duration must be non-negative'
  },

  VIDEO_PROGRESS_COMPLETION_CHECK: {
    table: 'video_progresses',
    constraintName: 'chk_video_progress_completion_range',
    condition: 'completion_percentage >= 0 AND completion_percentage <= 100',
    description: 'Video completion percentage must be between 0-100'
  },

  STUDENT_COURSE_PROGRESS_OVERALL_CHECK: {
    table: 'student_course_progresses',
    constraintName: 'chk_student_course_progress_overall_range',
    condition: 'overall_progress_percentage >= 0 AND overall_progress_percentage <= 100',
    description: 'Overall course progress percentage must be between 0-100'
  },

  STUDENT_COURSE_PROGRESS_COUNTS_CHECK: {
    table: 'student_course_progresses',
    constraintName: 'chk_student_course_progress_counts_non_negative',
    condition: 'modules_completed >= 0 AND videos_completed >= 0 AND quizzes_completed >= 0 AND assignments_completed >= 0',
    description: 'All progress counts must be non-negative'
  },

  STUDENT_COURSE_PROGRESS_TIME_CHECK: {
    table: 'student_course_progresses',
    constraintName: 'chk_student_course_progress_time_non_negative',
    condition: 'total_time_spent_minutes >= 0',
    description: 'Total time spent must be non-negative'
  },

  COMPLETION_DATE_CONSISTENCY_CHECK: {
    table: 'student_course_progresses',
    constraintName: 'chk_completion_date_consistency',
    condition: '(is_course_completed = false AND completion_date IS NULL) OR (is_course_completed = true AND completion_date IS NOT NULL)',
    description: 'Completion date must be set when course is completed and null otherwise'
  },
};
