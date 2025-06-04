/**
 * @file course-indexes.types.ts
 * @description Performance indexes for course structure and content entities.
 */

import { IndexConstraint } from '../base-constraint.types';

/**
 * Course structure and content performance indexes
 */
export const COURSE_PERFORMANCE_INDEXES: Record<string, IndexConstraint> = {
  // Course structure indexes
  PROGRAM_NAME_TENANT_LOOKUP: {
    table: 'programs',
    indexName: 'idx_programs_name_tenant',
    constraintName: 'idx_programs_name_tenant',
    columns: ['program_name', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize program name searches within tenant'
  },

  PROGRAM_TENANT_ACTIVE_LOOKUP: {
    table: 'programs',
    indexName: 'idx_programs_tenant_active',
    constraintName: 'idx_programs_tenant_active',
    columns: ['tenant_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize active program queries by tenant'
  },

  SPECIALIZATION_PROGRAM_LOOKUP: {
    table: 'specializations',
    indexName: 'idx_specializations_program',
    constraintName: 'idx_specializations_program',
    columns: ['program_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize specialization queries by program'
  },

  SPECIALIZATION_NAME_PROGRAM_LOOKUP: {
    table: 'specializations',
    indexName: 'idx_specializations_name_program',
    constraintName: 'idx_specializations_name_program',
    columns: ['specialization_name', 'program_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize specialization name searches within program'
  },

  COURSE_SPECIALIZATION_LOOKUP: {
    table: 'courses',
    indexName: 'idx_courses_specialization',
    constraintName: 'idx_courses_specialization',
    columns: ['specialization_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course queries by specialization'
  },

  COURSE_STATUS_TENANT_LOOKUP: {
    table: 'courses',
    indexName: 'idx_courses_status_tenant',
    constraintName: 'idx_courses_status_tenant',
    columns: ['course_status_id', 'tenant_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course filtering by status within tenant'
  },

  COURSE_NAME_TENANT_LOOKUP: {
    table: 'courses',
    indexName: 'idx_courses_name_tenant',
    constraintName: 'idx_courses_name_tenant',
    columns: ['course_name', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize course name searches within tenant'
  },

  COURSE_MODULES_COURSE_POSITION: {
    table: 'course_modules',
    indexName: 'idx_course_modules_course_position',
    constraintName: 'idx_course_modules_course_position',
    columns: ['course_id', 'position', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course module ordering queries'
  },

  COURSE_MODULES_NAME_COURSE_LOOKUP: {
    table: 'course_modules',
    indexName: 'idx_course_modules_name_course',
    constraintName: 'idx_course_modules_name_course',
    columns: ['course_module_name', 'course_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize module name searches within course'
  },

  COURSE_TOPICS_MODULE_POSITION: {
    table: 'course_topics',
    indexName: 'idx_course_topics_module_position',
    constraintName: 'idx_course_topics_module_position',
    columns: ['module_id', 'position', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course topic ordering queries'
  },

  COURSE_TOPICS_NAME_MODULE_LOOKUP: {
    table: 'course_topics',
    indexName: 'idx_course_topics_name_module',
    constraintName: 'idx_course_topics_name_module',
    columns: ['course_topic_name', 'module_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize topic name searches within module'
  },

  // Course content indexes
  COURSE_VIDEOS_TOPIC_POSITION: {
    table: 'course_videos',
    indexName: 'idx_course_videos_topic_position',
    constraintName: 'idx_course_videos_topic_position',
    columns: ['course_topic_id', 'position', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course video ordering queries'
  },

  COURSE_VIDEOS_COURSE_LOOKUP: {
    table: 'course_videos',
    indexName: 'idx_course_videos_course',
    constraintName: 'idx_course_videos_course',
    columns: ['course_id', 'upload_status', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize video queries by course and status'
  },

  COURSE_VIDEOS_BUNNY_ID_LOOKUP: {
    table: 'course_videos',
    indexName: 'idx_course_videos_bunny_id',
    constraintName: 'idx_course_videos_bunny_id',
    columns: ['bunny_video_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize Bunny.net video ID lookups'
  },

  COURSE_VIDEOS_UPLOAD_STATUS: {
    table: 'course_videos',
    indexName: 'idx_course_videos_upload_status',
    constraintName: 'idx_course_videos_upload_status',
    columns: ['upload_status', 'tenant_id', 'created_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize video upload status monitoring'
  },

  COURSE_DOCUMENTS_TOPIC_LOOKUP: {
    table: 'course_documents',
    indexName: 'idx_course_documents_topic',
    constraintName: 'idx_course_documents_topic',
    columns: ['course_topic_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize document queries by topic'
  },

  COURSE_DOCUMENTS_COURSE_LOOKUP: {
    table: 'course_documents',
    indexName: 'idx_course_documents_course',
    constraintName: 'idx_course_documents_course',
    columns: ['course_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize document queries by course'
  },

  // Progress tracking indexes
  VIDEO_PROGRESS_STUDENT_LOOKUP: {
    table: 'video_progresses',
    indexName: 'idx_video_progresses_student',
    constraintName: 'idx_video_progresses_student',
    columns: ['student_id', 'is_completed', 'last_watched_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student video progress queries'
  },

  VIDEO_PROGRESS_VIDEO_LOOKUP: {
    table: 'video_progresses',
    indexName: 'idx_video_progresses_video',
    constraintName: 'idx_video_progresses_video',
    columns: ['course_video_id', 'completion_percentage'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize video progress analytics'
  },

  VIDEO_PROGRESS_STUDENT_VIDEO_UNIQUE: {
    table: 'video_progresses',
    indexName: 'idx_video_progresses_student_video',
    constraintName: 'idx_video_progresses_student_video',
    columns: ['student_id', 'course_video_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Unique constraint and optimization for student video progress'
  },

  STUDENT_COURSE_PROGRESS_LOOKUP: {
    table: 'student_course_progresses',
    indexName: 'idx_student_course_progresses_lookup',
    constraintName: 'idx_student_course_progresses_lookup',
    columns: ['student_id', 'course_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize student course progress queries'
  },

  STUDENT_COURSE_PROGRESS_COMPLETION: {
    table: 'student_course_progresses',
    indexName: 'idx_student_course_progresses_completion',
    constraintName: 'idx_student_course_progresses_completion',
    columns: ['course_id', 'is_course_completed', 'completion_date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course completion analytics'
  },

  STUDENT_COURSE_PROGRESS_ACTIVITY: {
    table: 'student_course_progresses',
    indexName: 'idx_student_course_progresses_activity',
    constraintName: 'idx_student_course_progresses_activity',
    columns: ['student_id', 'last_accessed_at', 'overall_progress_percentage'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student activity tracking'
  },

  // Course analytics indexes
  COURSE_ANALYTICS_TIME_RANGE: {
    table: 'course_videos',
    indexName: 'idx_course_analytics_time_range',
    constraintName: 'idx_course_analytics_time_range',
    columns: ['course_id', 'created_at', 'upload_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course content analytics by time range'
  },

  VIDEO_ANALYTICS_DURATION: {
    table: 'course_videos',
    indexName: 'idx_video_analytics_duration',
    constraintName: 'idx_video_analytics_duration',
    columns: ['course_id', 'duration_seconds', 'upload_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize video duration analytics'
  },
};
