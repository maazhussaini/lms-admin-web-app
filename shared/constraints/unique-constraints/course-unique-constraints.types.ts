/**
 * @file course-unique-constraints.types.ts
 * @description Unique constraints for course structure and content entities following PostgreSQL best practices.
 */

import { UniqueConstraint } from '../base-constraint.types';

/**
 * Course structure and content unique constraints with consistent naming
 */
export const COURSE_UNIQUE_CONSTRAINTS: Record<string, UniqueConstraint> = {
  // Course structure unique constraints
  PROGRAM_NAME_TENANT_UNIQUE: {
    table: 'programs',
    constraintName: 'uq_program_name_tenant',
    columns: ['program_name', 'tenant_id'],
    description: 'Program name must be unique within tenant'
  },

  SPECIALIZATION_NAME_PROGRAM_UNIQUE: {
    table: 'specializations',
    constraintName: 'uq_specialization_name_program',
    columns: ['specialization_name', 'program_id'],
    description: 'Specialization name must be unique within program'
  },

  COURSE_NAME_TENANT_UNIQUE: {
    table: 'courses',
    constraintName: 'uq_course_name_tenant',
    columns: ['course_name', 'tenant_id'],
    description: 'Course name must be unique within tenant'
  },

  COURSE_MODULE_NAME_COURSE_UNIQUE: {
    table: 'course_modules',
    constraintName: 'uq_course_module_name_course',
    columns: ['course_module_name', 'course_id'],
    description: 'Course module name must be unique within course'
  },

  COURSE_MODULE_POSITION_UNIQUE: {
    table: 'course_modules',
    constraintName: 'uq_course_module_position_course',
    columns: ['course_id', 'position'],
    condition: 'position IS NOT NULL',
    description: 'Unique module position within course (partial unique constraint)'
  },

  COURSE_TOPIC_NAME_MODULE_UNIQUE: {
    table: 'course_topics',
    constraintName: 'uq_course_topic_name_module',
    columns: ['course_topic_name', 'module_id'],
    description: 'Course topic name must be unique within module'
  },

  COURSE_TOPIC_POSITION_UNIQUE: {
    table: 'course_topics',
    constraintName: 'uq_course_topic_position_module',
    columns: ['module_id', 'position'],
    condition: 'position IS NOT NULL',
    description: 'Unique topic position within module (partial unique constraint)'
  },

  COURSE_VIDEO_NAME_TOPIC_UNIQUE: {
    table: 'course_videos',
    constraintName: 'uq_course_video_name_topic',
    columns: ['video_name', 'course_topic_id'],
    description: 'Video name must be unique within topic'
  },

  COURSE_VIDEO_POSITION_TOPIC_UNIQUE: {
    table: 'course_videos',
    constraintName: 'uq_course_video_position_topic',
    columns: ['course_topic_id', 'position'],
    condition: 'position IS NOT NULL',
    description: 'Unique video position within topic (partial unique constraint)'
  },

  // Video unique constraints
  BUNNY_VIDEO_ID_UNIQUE: {
    table: 'course_videos',
    constraintName: 'uq_bunny_video_id_global',
    columns: ['bunny_video_id'],
    description: 'Unique Bunny.net video identifier globally'
  },

  COURSE_DOCUMENT_NAME_TOPIC_UNIQUE: {
    table: 'course_documents',
    constraintName: 'uq_course_document_name_topic',
    columns: ['document_name', 'course_topic_id'],
    description: 'Document name must be unique within topic'
  },

  // Progress tracking unique constraints
  VIDEO_PROGRESS_STUDENT_VIDEO_UNIQUE: {
    table: 'video_progresses',
    constraintName: 'uq_video_progress_student_video',
    columns: ['student_id', 'course_video_id'],
    description: 'Unique video progress record per student per video'
  },

  STUDENT_COURSE_PROGRESS_UNIQUE: {
    table: 'student_course_progresses',
    constraintName: 'uq_student_course_progress_student_course',
    columns: ['student_id', 'course_id'],
    description: 'Unique course progress record per student per course'
  },
};
