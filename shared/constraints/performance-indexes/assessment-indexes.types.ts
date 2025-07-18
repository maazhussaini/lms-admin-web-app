/**
 * @file assessment-indexes.types.ts
 * @description Performance indexes for assessment entities (quizzes and assignments).
 */

import { IndexConstraint } from '../base-constraint.types';

/**
 * Assessment performance indexes
 */
export const ASSESSMENT_PERFORMANCE_INDEXES: Record<string, IndexConstraint> = {
  // Quiz indexes
  QUIZ_COURSE_STATUS_LOOKUP: {
    table: 'quizzes',
    constraintName: 'idx_quiz_course_status_tenant',
    indexName: 'idx_quiz_course_status_tenant',
    columns: ['course_id', 'status', 'tenant_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz queries by course and status'
  },

  QUIZ_TEACHER_LOOKUP: {
    table: 'quizzes',
    constraintName: 'idx_quiz_teacher_lookup',
    indexName: 'idx_quiz_teacher_lookup',
    columns: ['teacher_id', 'course_id', 'status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz queries by teacher ownership'
  },

  QUIZ_DUE_DATE_LOOKUP: {
    table: 'quizzes',
    constraintName: 'idx_quiz_due_date_tenant',
    indexName: 'idx_quiz_due_date_tenant',
    columns: ['due_date', 'tenant_id', 'status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz due date queries'
  },

  QUIZ_NAME_SEARCH: {
    table: 'quizzes',
    constraintName: 'idx_quiz_name_search',
    indexName: 'idx_quiz_name_search',
    columns: ['quiz_name', 'course_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize quiz name searches and uniqueness'
  },

  QUIZ_MAPPING_LOOKUP: {
    table: 'quiz_mappings',
    constraintName: 'idx_quiz_mapping_lookup',
    indexName: 'idx_quiz_mapping_lookup',
    columns: ['reference_table_id', 'reference_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz mapping queries by reference'
  },

  QUIZ_MAPPING_QUIZ_LOOKUP: {
    table: 'quiz_mappings',
    constraintName: 'idx_quiz_mapping_quiz',
    indexName: 'idx_quiz_mapping_quiz',
    columns: ['quiz_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz mapping queries by quiz'
  },

  QUIZ_MAPPING_TEACHER_LOOKUP: {
    table: 'quiz_mappings',
    constraintName: 'idx_quiz_mapping_teacher',
    indexName: 'idx_quiz_mapping_teacher',
    columns: ['teacher_id', 'reference_table_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz mapping queries by teacher'
  },

  QUIZ_QUESTIONS_LOOKUP: {
    table: 'quiz_questions',
    constraintName: 'idx_quiz_questions_quiz_position',
    indexName: 'idx_quiz_questions_quiz_position',
    columns: ['quiz_id', 'position', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz question ordering queries'
  },

  QUIZ_QUESTIONS_TEACHER_LOOKUP: {
    table: 'quiz_questions',
    constraintName: 'idx_quiz_questions_teacher',
    indexName: 'idx_quiz_questions_teacher',
    columns: ['teacher_id', 'question_type'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz question queries by teacher'
  },

  QUIZ_QUESTIONS_TYPE_LOOKUP: {
    table: 'quiz_questions',
    constraintName: 'idx_quiz_questions_type',
    indexName: 'idx_quiz_questions_type',
    columns: ['question_type', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz question type filtering'
  },

  QUIZ_OPTIONS_QUESTION_LOOKUP: {
    table: 'quiz_question_options',
    constraintName: 'idx_quiz_options_question_position',
    indexName: 'idx_quiz_options_question_position',
    columns: ['quiz_question_id', 'position', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz option ordering queries'
  },

  QUIZ_OPTIONS_CORRECT_LOOKUP: {
    table: 'quiz_question_options',
    constraintName: 'idx_quiz_options_correct',
    indexName: 'idx_quiz_options_correct',
    columns: ['quiz_question_id', 'is_correct'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize correct answer lookups'
  },

  QUIZ_ANSWERS_QUESTION_LOOKUP: {
    table: 'quiz_question_answers',
    constraintName: 'idx_quiz_answers_question',
    indexName: 'idx_quiz_answers_question',
    columns: ['quiz_question_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize quiz answer lookups (unique per question)'
  },

  QUIZ_ATTEMPTS_STUDENT_LOOKUP: {
    table: 'quiz_attempts',
    constraintName: 'idx_quiz_attempts_student',
    indexName: 'idx_quiz_attempts_student',
    columns: ['student_id', 'quiz_id', 'attempt_number'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize student quiz attempt lookups'
  },

  QUIZ_ATTEMPTS_QUIZ_STATUS_LOOKUP: {
    table: 'quiz_attempts',
    constraintName: 'idx_quiz_attempts_quiz_status',
    indexName: 'idx_quiz_attempts_quiz_status',
    columns: ['quiz_id', 'status', 'started_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz attempts by status for grading'
  },

  QUIZ_ATTEMPTS_GRADING_LOOKUP: {
    table: 'quiz_attempts',
    constraintName: 'idx_quiz_attempts_grading',
    indexName: 'idx_quiz_attempts_grading',
    columns: ['graded_by', 'graded_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize grading history queries'
  },

  QUIZ_ATTEMPT_ANSWERS_LOOKUP: {
    table: 'quiz_attempt_answers',
    constraintName: 'idx_quiz_attempt_answers_lookup',
    indexName: 'idx_quiz_attempt_answers_lookup',
    columns: ['quiz_attempt_id', 'quiz_question_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize quiz attempt answer lookups'
  },

  QUIZ_ATTEMPT_ANSWERS_OPTION_LOOKUP: {
    table: 'quiz_attempt_answers',
    constraintName: 'idx_quiz_attempt_answers_option',
    indexName: 'idx_quiz_attempt_answers_option',
    columns: ['quiz_question_option_id', 'is_correct'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz answer validation queries'
  },

  QUIZ_ATTEMPT_ANSWERS_TEACHER_REVIEW_LOOKUP: {
    table: 'quiz_attempt_answers',
    constraintName: 'idx_quiz_attempt_answers_teacher_review',
    indexName: 'idx_quiz_attempt_answers_teacher_review',
    columns: ['reviewed_by_teacher_id', 'marks_obtained'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher review queries'
  },

  // Assignment indexes
  ASSIGNMENT_COURSE_STATUS_LOOKUP: {
    table: 'assignments',
    constraintName: 'idx_assignment_course_status_tenant',
    indexName: 'idx_assignment_course_status_tenant',
    columns: ['course_id', 'status', 'tenant_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment queries by course and status'
  },

  ASSIGNMENT_TEACHER_LOOKUP: {
    table: 'assignments',
    constraintName: 'idx_assignment_teacher_lookup',
    indexName: 'idx_assignment_teacher_lookup',
    columns: ['teacher_id', 'course_id', 'status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment queries by teacher ownership'
  },

  ASSIGNMENT_DUE_DATE_LOOKUP: {
    table: 'assignments',
    constraintName: 'idx_assignment_due_date_tenant',
    indexName: 'idx_assignment_due_date_tenant',
    columns: ['due_date', 'tenant_id', 'status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment due date queries'
  },

  ASSIGNMENT_NAME_SEARCH: {
    table: 'assignments',
    constraintName: 'idx_assignment_name_search',
    indexName: 'idx_assignment_name_search',
    columns: ['assignment_name', 'course_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize assignment name searches and uniqueness'
  },

  ASSIGNMENT_TYPE_LOOKUP: {
    table: 'assignments',
    constraintName: 'idx_assignment_type',
    indexName: 'idx_assignment_type',
    columns: ['assignment_type', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment type filtering'
  },

  ASSIGNMENT_MAPPING_LOOKUP: {
    table: 'assignment_mappings',
    constraintName: 'idx_assignment_mapping_lookup',
    indexName: 'idx_assignment_mapping_lookup',
    columns: ['reference_table_id', 'reference_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment mapping queries by reference'
  },

  ASSIGNMENT_MAPPING_ASSIGNMENT_LOOKUP: {
    table: 'assignment_mappings',
    constraintName: 'idx_assignment_mapping_assignment',
    indexName: 'idx_assignment_mapping_assignment',
    columns: ['assignment_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment mapping queries by assignment'
  },

  ASSIGNMENT_MAPPING_TEACHER_LOOKUP: {
    table: 'assignment_mappings',
    constraintName: 'idx_assignment_mapping_teacher',
    indexName: 'idx_assignment_mapping_teacher',
    columns: ['teacher_id', 'reference_table_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment mapping queries by teacher'
  },

  STUDENT_ASSIGNMENT_STUDENT_LOOKUP: {
    table: 'student_assignments',
    constraintName: 'idx_student_assignment_student',
    indexName: 'idx_student_assignment_student',
    columns: ['student_id', 'assignment_id', 'attempt_number'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize student assignment submission lookups'
  },

  STUDENT_ASSIGNMENT_STATUS_LOOKUP: {
    table: 'student_assignments',
    constraintName: 'idx_student_assignment_status',
    indexName: 'idx_student_assignment_status',
    columns: ['assignment_id', 'submission_status', 'submission_date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment submissions by status for grading'
  },

  STUDENT_ASSIGNMENT_GRADING_LOOKUP: {
    table: 'student_assignments',
    constraintName: 'idx_student_assignment_grading',
    indexName: 'idx_student_assignment_grading',
    columns: ['graded_by', 'graded_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment grading history queries'
  },

  STUDENT_ASSIGNMENT_DUE_DATE_LOOKUP: {
    table: 'student_assignments',
    constraintName: 'idx_student_assignment_due_date',
    indexName: 'idx_student_assignment_due_date',
    columns: ['submission_date', 'submission_status', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize late submission tracking'
  },

  ASSIGNMENT_FILES_SUBMISSION_LOOKUP: {
    table: 'assignment_submission_files',
    constraintName: 'idx_assignment_files_submission',
    indexName: 'idx_assignment_files_submission',
    columns: ['student_assignment_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment file lookups by submission'
  },

  ASSIGNMENT_FILES_SIZE_LOOKUP: {
    table: 'assignment_submission_files',
    constraintName: 'idx_assignment_files_size',
    indexName: 'idx_assignment_files_size',
    columns: ['file_size_bytes', 'mime_type', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize file size and type analytics'
  },

  ASSIGNMENT_FILE_URL_FORMAT_CHECK: {
    table: 'assignment_submission_files',
    constraintName: 'idx_assignment_file_url_search',
    indexName: 'idx_assignment_file_url_search',
    columns: ['file_url', 'mime_type'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment file URL and type searches'
  },

  // Additional missing indexes for performance optimization
  QUIZ_GRADED_BY_LOOKUP: {
    table: 'quiz_attempts',
    constraintName: 'idx_quiz_graded_by_lookup',
    indexName: 'idx_quiz_graded_by_lookup',
    columns: ['graded_by', 'tenant_id', 'status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize queries for grader workload tracking'
  },

  ASSIGNMENT_GRADED_BY_LOOKUP: {
    table: 'student_assignments',
    constraintName: 'idx_assignment_graded_by_lookup',
    indexName: 'idx_assignment_graded_by_lookup',
    columns: ['graded_by', 'tenant_id', 'submission_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize queries for assignment grader workload tracking'
  },

  QUIZ_TEACHER_REVIEW_WORKLOAD: {
    table: 'quiz_attempt_answers',
    constraintName: 'idx_quiz_teacher_review_workload',
    indexName: 'idx_quiz_teacher_review_workload',
    columns: ['reviewed_by_teacher_id', 'tenant_id', 'is_correct'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize teacher review workload queries'
  },

  QUIZ_QUESTIONS_MARKS_SUMMARY: {
    table: 'quiz_questions',
    constraintName: 'idx_quiz_questions_marks_summary',
    indexName: 'idx_quiz_questions_marks_summary',
    columns: ['quiz_id', 'question_marks', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz total marks calculation queries'
  },

  ASSIGNMENT_LATE_SUBMISSION_TRACKING: {
    table: 'student_assignments',
    constraintName: 'idx_assignment_late_submission_tracking',
    indexName: 'idx_assignment_late_submission_tracking',
    columns: ['is_late_submission', 'submission_date', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize late submission analytics queries'
  },

  QUIZ_ATTEMPT_COMPLETION_RATE: {
    table: 'quiz_attempts',
    constraintName: 'idx_quiz_attempt_completion_rate',
    indexName: 'idx_quiz_attempt_completion_rate',
    columns: ['quiz_id', 'status', 'started_at', 'submitted_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz completion rate analytics'
  },

  ASSIGNMENT_FILE_SIZE_ANALYTICS: {
    table: 'assignment_submission_files',
    constraintName: 'idx_assignment_file_size_analytics',
    indexName: 'idx_assignment_file_size_analytics',
    columns: ['tenant_id', 'file_size_bytes', 'upload_status_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize file storage analytics queries'
  },

  QUIZ_QUESTION_TYPE_DISTRIBUTION: {
    table: 'quiz_questions',
    constraintName: 'idx_quiz_question_type_distribution',
    indexName: 'idx_quiz_question_type_distribution',
    columns: ['teacher_id', 'question_type', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize question type distribution analytics'
  },

  ASSIGNMENT_FEEDBACK_TRACKING: {
    table: 'student_assignments',
    constraintName: 'idx_assignment_feedback_tracking',
    indexName: 'idx_assignment_feedback_tracking',
    columns: ['assignment_id', 'graded_at', 'feedback'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize feedback completion tracking queries'
  },

  // Composite indexes for complex queries
  QUIZ_STUDENT_PERFORMANCE_COMPOSITE: {
    table: 'quiz_attempts',
    constraintName: 'idx_quiz_student_performance_composite',
    indexName: 'idx_quiz_student_performance_composite',
    columns: ['student_id', 'quiz_id', 'attempt_number', 'score', 'percentage'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize comprehensive student quiz performance queries'
  },

  ASSIGNMENT_STUDENT_PERFORMANCE_COMPOSITE: {
    table: 'student_assignments',
    constraintName: 'idx_assignment_student_performance_composite',
    indexName: 'idx_assignment_student_performance_composite',
    columns: ['student_id', 'assignment_id', 'attempt_number', 'grade', 'percentage'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize comprehensive student assignment performance queries'
  },

  // Time-based performance indexes
  QUIZ_CREATION_DATE_ANALYTICS: {
    table: 'quizzes',
    constraintName: 'idx_quiz_creation_date_analytics',
    indexName: 'idx_quiz_creation_date_analytics',
    columns: ['created_at', 'teacher_id', 'status', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize quiz creation timeline analytics'
  },

  ASSIGNMENT_CREATION_DATE_ANALYTICS: {
    table: 'assignments',
    constraintName: 'idx_assignment_creation_date_analytics',
    indexName: 'idx_assignment_creation_date_analytics',
    columns: ['created_at', 'teacher_id', 'status', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assignment creation timeline analytics'
  },

  // Foreign key constraint support indexes
  QUIZ_FOREIGN_KEY_SUPPORT: {
    table: 'quizzes',
    constraintName: 'idx_quiz_foreign_key_support',
    indexName: 'idx_quiz_foreign_key_support',
    columns: ['teacher_id', 'course_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Support foreign key constraint checks and joins'
  },

  ASSIGNMENT_FOREIGN_KEY_SUPPORT: {
    table: 'assignments',
    constraintName: 'idx_assignment_foreign_key_support',
    indexName: 'idx_assignment_foreign_key_support',
    columns: ['teacher_id', 'course_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Support foreign key constraint checks and joins'
  },
};
