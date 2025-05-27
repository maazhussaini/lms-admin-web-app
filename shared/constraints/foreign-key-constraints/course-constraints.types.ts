import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Foreign key constraints for course structure entities
 */
export const COURSE_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Generic course constraints
  COURSE_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_course_reference',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Reference to course entity'
  },

  // Academic structure constraints
  PROGRAM_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_program_reference',
    column: 'program_id',
    referencedTable: 'programs',
    referencedColumn: 'program_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Academic program reference'
  },

  SPECIALIZATION_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_specialization_reference',
    column: 'specialization_id',
    referencedTable: 'specializations',
    referencedColumn: 'specialization_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Academic specialization reference'
  },

  COURSE_MODULE_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_course_module_reference',
    column: 'course_module_id',
    referencedTable: 'course_modules',
    referencedColumn: 'course_module_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course module reference'
  },

  COURSE_TOPIC_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_course_topic_reference',
    column: 'course_topic_id',
    referencedTable: 'course_topics',
    referencedColumn: 'course_topic_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course topic reference'
  },

  // Specific course hierarchy constraints
  SPECIALIZATION_PROGRAM_CONSTRAINT: {
    table: 'specializations',
    constraintName: 'fk_specialization_program',
    column: 'program_id',
    referencedTable: 'programs',
    referencedColumn: 'program_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Specialization belongs to program (cascade delete)'
  },

  COURSE_SPECIALIZATION_CONSTRAINT: {
    table: 'courses',
    constraintName: 'fk_course_specialization',
    column: 'specialization_id',
    referencedTable: 'specializations',
    referencedColumn: 'specialization_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Course may belong to specialization (optional)'
  },

  COURSE_MODULE_COURSE_CONSTRAINT: {
    table: 'course_modules',
    constraintName: 'fk_course_module_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course module belongs to course (cascade delete)'
  },

  COURSE_TOPIC_MODULE_CONSTRAINT: {
    table: 'course_topics',
    constraintName: 'fk_course_topic_module',
    column: 'module_id',
    referencedTable: 'course_modules',
    referencedColumn: 'course_module_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course topic belongs to module (cascade delete)'
  },

  // Course content constraints
  COURSE_VIDEO_COURSE_CONSTRAINT: {
    table: 'course_videos',
    constraintName: 'fk_course_video_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course video belongs to course (cascade delete)'
  },

  COURSE_VIDEO_TOPIC_CONSTRAINT: {
    table: 'course_videos',
    constraintName: 'fk_course_video_topic',
    column: 'course_topic_id',
    referencedTable: 'course_topics',
    referencedColumn: 'course_topic_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course video belongs to topic (cascade delete)'
  },

  COURSE_DOCUMENT_COURSE_CONSTRAINT: {
    table: 'course_documents',
    constraintName: 'fk_course_document_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course document belongs to course (cascade delete)'
  },

  COURSE_DOCUMENT_TOPIC_CONSTRAINT: {
    table: 'course_documents',
    constraintName: 'fk_course_document_topic',
    column: 'course_topic_id',
    referencedTable: 'course_topics',
    referencedColumn: 'course_topic_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course document belongs to topic (cascade delete)'
  },

  // Progress tracking constraints
  VIDEO_PROGRESS_STUDENT_CONSTRAINT: {
    table: 'video_progresses',
    constraintName: 'fk_video_progress_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Video progress belongs to student (cascade delete)'
  },

  VIDEO_PROGRESS_VIDEO_CONSTRAINT: {
    table: 'video_progresses',
    constraintName: 'fk_video_progress_video',
    column: 'course_video_id',
    referencedTable: 'course_videos',
    referencedColumn: 'course_video_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Video progress tracks specific video (cascade delete)'
  },

  STUDENT_COURSE_PROGRESS_STUDENT_CONSTRAINT: {
    table: 'student_course_progresses',
    constraintName: 'fk_student_course_progress_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student course progress belongs to student (cascade delete)'
  },

  STUDENT_COURSE_PROGRESS_COURSE_CONSTRAINT: {
    table: 'student_course_progresses',
    constraintName: 'fk_student_course_progress_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student course progress tracks specific course (cascade delete)'
  },
};
