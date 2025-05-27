/**
 * @file quiz-assignment-entities-checks.types.ts
 * @description Check constraint definitions for quiz and assignment entities.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for quiz and assignment entities
 */
export const QUIZ_ASSIGNMENT_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
  // Quiz validations
  QUIZ_NAME_LENGTH_CHECK: {
    table: 'quizzes',
    constraintName: 'quiz_name_length_valid',
    condition: 'LENGTH(quiz_name) >= 2 AND LENGTH(quiz_name) <= 255',
    description: 'Quiz name must be between 2 and 255 characters'
  },

  QUIZ_TOTAL_MARKS_CHECK: {
    table: 'quizzes',
    constraintName: 'quiz_total_marks_valid',
    condition: 'total_marks > 0',
    description: 'Quiz total marks must be positive'
  },

  QUIZ_MAX_ATTEMPTS_CHECK: {
    table: 'quizzes',
    constraintName: 'quiz_max_attempts_valid',
    condition: 'max_attempts IS NULL OR max_attempts > 0',
    description: 'Quiz max attempts must be positive when provided'
  },

  QUIZ_TIME_LIMIT_CHECK: {
    table: 'quizzes',
    constraintName: 'quiz_time_limit_valid',
    condition: 'time_limit_minutes IS NULL OR time_limit_minutes > 0',
    description: 'Quiz time limit must be positive when provided'
  },

  QUIZ_STATUS_ENUM_CHECK: {
    table: 'quizzes',
    constraintName: 'quiz_status_enum_valid',
    condition: 'status IN (1, 2, 3, 4, 5)',
    description: 'Quiz status must be valid enum value (1-5)'
  },

  // Quiz question validations
  QUIZ_QUESTION_TEXT_LENGTH_CHECK: {
    table: 'quiz_questions',
    constraintName: 'quiz_question_text_length_valid',
    condition: 'LENGTH(question_text) >= 5',
    description: 'Quiz question text must be at least 5 characters'
  },

  QUIZ_QUESTION_MARKS_CHECK: {
    table: 'quiz_questions',
    constraintName: 'quiz_question_marks_valid',
    condition: 'question_marks > 0',
    description: 'Quiz question marks must be positive'
  },

  QUIZ_QUESTION_TYPE_ENUM_CHECK: {
    table: 'quiz_questions',
    constraintName: 'quiz_question_type_enum_valid',
    condition: 'question_type IN (1, 2, 3, 4)',
    description: 'Quiz question type must be valid enum value (1-4)'
  },

  // Quiz attempt validations
  QUIZ_ATTEMPT_NUMBER_CHECK: {
    table: 'quiz_attempts',
    constraintName: 'quiz_attempt_number_valid',
    condition: 'attempt_number > 0',
    description: 'Quiz attempt number must be positive'
  },

  QUIZ_ATTEMPT_SCORE_CHECK: {
    table: 'quiz_attempts',
    constraintName: 'quiz_attempt_score_valid',
    condition: 'score IS NULL OR score >= 0',
    description: 'Quiz attempt score must be non-negative when provided'
  },

  QUIZ_ATTEMPT_TIME_CONSISTENCY_CHECK: {
    table: 'quiz_attempts',
    constraintName: 'quiz_attempt_time_consistency_valid',
    condition: 'submitted_at IS NULL OR submitted_at >= started_at',
    description: 'Quiz submission time must be after or equal to start time'
  },

  // Assignment validations
  ASSIGNMENT_NAME_LENGTH_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_name_length_valid',
    condition: 'LENGTH(assignment_name) >= 2 AND LENGTH(assignment_name) <= 255',
    description: 'Assignment name must be between 2 and 255 characters'
  },

  ASSIGNMENT_TOTAL_MARKS_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_total_marks_valid',
    condition: 'total_marks > 0',
    description: 'Assignment total marks must be positive'
  },

  ASSIGNMENT_TYPE_ENUM_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_type_enum_valid',
    condition: 'assignment_type IN (1)',
    description: 'Assignment type must be valid enum value (currently only 1 for FILE_UPLOAD)'
  },

  ASSIGNMENT_STATUS_ENUM_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_status_enum_valid',
    condition: 'status IN (1, 2, 3, 4, 5)',
    description: 'Assignment status must be valid enum value (1-5)'
  },

  ASSIGNMENT_MAX_FILE_SIZE_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_max_file_size_valid',
    condition: 'max_file_size_mb IS NULL OR max_file_size_mb > 0',
    description: 'Assignment max file size must be positive when provided'
  },

  ASSIGNMENT_DUE_DATE_FUTURE_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_due_date_future_valid',
    condition: 'due_date > created_at',
    description: 'Assignment due date must be in the future when created'
  },

  // Student assignment validations
  STUDENT_ASSIGNMENT_ATTEMPT_NUMBER_CHECK: {
    table: 'student_assignments',
    constraintName: 'student_assignment_attempt_number_valid',
    condition: 'attempt_number > 0',
    description: 'Student assignment attempt number must be positive'
  },

  STUDENT_ASSIGNMENT_GRADE_CHECK: {
    table: 'student_assignments',
    constraintName: 'student_assignment_grade_valid',
    condition: 'grade IS NULL OR grade >= 0',
    description: 'Student assignment grade must be non-negative when provided'
  },

  STUDENT_ASSIGNMENT_STATUS_ENUM_CHECK: {
    table: 'student_assignments',
    constraintName: 'student_assignment_status_enum_valid',
    condition: 'submission_status IN (1, 2, 3, 4, 5)',
    description: 'Student assignment submission status must be valid enum value (1-5)'
  },

  // Assignment file validations
  ASSIGNMENT_FILE_SIZE_CHECK: {
    table: 'assignment_submission_files',
    constraintName: 'assignment_file_size_valid',
    condition: 'file_size_bytes IS NULL OR file_size_bytes > 0',
    description: 'Assignment file size must be positive when provided'
  },

  ASSIGNMENT_FILE_URL_FORMAT_CHECK: {
    table: 'assignment_submission_files',
    constraintName: 'assignment_file_url_format_valid',
    condition: "file_url ~* '^https?://[^\\s/$.?#].[^\\s]*$'",
    description: 'Assignment file URL must be valid HTTP/HTTPS URL'
  },

  // Reference type validations
  QUIZ_REFERENCE_TYPE_ENUM_CHECK: {
    table: 'quiz_mappings',
    constraintName: 'quiz_reference_type_enum_valid',
    condition: 'reference_table_id IN (1, 2, 3)',
    description: 'Quiz reference type must be valid enum value (1-3)'
  },

  ASSIGNMENT_REFERENCE_TYPE_ENUM_CHECK: {
    table: 'assignment_mappings',
    constraintName: 'assignment_reference_type_enum_valid',
    condition: 'reference_table_id IN (1, 2, 3)',
    description: 'Assignment reference type must be valid enum value (1-3)'
  },
};
