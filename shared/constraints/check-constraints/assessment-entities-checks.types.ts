/**
 * @file assessment-entities-checks.types.ts
 * @description Check constraint definitions for quiz and assignment entities.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for quiz and assignment entities
 */
export const ASSESSMENT_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
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

  QUIZ_PASSING_MARKS_CHECK: {
    table: 'quizzes',
    constraintName: 'quiz_passing_marks_valid',
    condition: 'passing_marks IS NULL OR (passing_marks >= 0 AND passing_marks <= total_marks)',
    description: 'Quiz passing marks must be between 0 and total marks when provided'
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

  QUIZ_QUESTION_POSITION_CHECK: {
    table: 'quiz_questions',
    constraintName: 'quiz_question_position_valid',
    condition: 'position > 0',
    description: 'Quiz question position must be positive'
  },

  // Quiz option validations
  QUIZ_OPTION_TEXT_LENGTH_CHECK: {
    table: 'quiz_question_options',
    constraintName: 'quiz_option_text_length_valid',
    condition: 'LENGTH(option_text) >= 1',
    description: 'Quiz option text must not be empty'
  },

  QUIZ_OPTION_POSITION_CHECK: {
    table: 'quiz_question_options',
    constraintName: 'quiz_option_position_valid',
    condition: 'position > 0',
    description: 'Quiz option position must be positive'
  },

  // Quiz answer validations
  QUIZ_ANSWER_TEXT_LENGTH_CHECK: {
    table: 'quiz_question_answers',
    constraintName: 'quiz_answer_text_length_valid',
    condition: 'LENGTH(answer_text) >= 1',
    description: 'Quiz answer text must not be empty'
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

  QUIZ_ATTEMPT_PERCENTAGE_CHECK: {
    table: 'quiz_attempts',
    constraintName: 'quiz_attempt_percentage_valid',
    condition: 'percentage IS NULL OR (percentage >= 0 AND percentage <= 100)',
    description: 'Quiz attempt percentage must be between 0 and 100 when provided'
  },

  QUIZ_ATTEMPT_TIME_CONSISTENCY_CHECK: {
    table: 'quiz_attempts',
    constraintName: 'quiz_attempt_time_consistency_valid',
    condition: 'submitted_at IS NULL OR submitted_at >= started_at',
    description: 'Quiz submission time must be after or equal to start time'
  },

  QUIZ_ATTEMPT_TIME_TAKEN_CHECK: {
    table: 'quiz_attempts',
    constraintName: 'quiz_attempt_time_taken_valid',
    condition: 'time_taken_minutes IS NULL OR time_taken_minutes >= 0',
    description: 'Quiz time taken must be non-negative when provided'
  },

  // Quiz attempt answer validations
  QUIZ_ATTEMPT_ANSWER_MARKS_CHECK: {
    table: 'quiz_attempt_answers',
    constraintName: 'quiz_attempt_answer_marks_valid',
    condition: 'marks_obtained IS NULL OR marks_obtained >= 0',
    description: 'Quiz attempt answer marks must be non-negative when provided'
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

  ASSIGNMENT_PASSING_MARKS_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_passing_marks_valid',
    condition: 'passing_marks IS NULL OR (passing_marks >= 0 AND passing_marks <= total_marks)',
    description: 'Assignment passing marks must be between 0 and total marks when provided'
  },

  ASSIGNMENT_MAX_FILE_SIZE_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_max_file_size_valid',
    condition: 'max_file_size_mb IS NULL OR max_file_size_mb > 0',
    description: 'Assignment max file size must be positive when provided'
  },

  ASSIGNMENT_MAX_ATTEMPTS_CHECK: {
    table: 'assignments',
    constraintName: 'assignment_max_attempts_valid',
    condition: 'max_attempts IS NULL OR max_attempts > 0',
    description: 'Assignment max attempts must be positive when provided'
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

  STUDENT_ASSIGNMENT_PERCENTAGE_CHECK: {
    table: 'student_assignments',
    constraintName: 'student_assignment_percentage_valid',
    condition: 'percentage IS NULL OR (percentage >= 0 AND percentage <= 100)',
    description: 'Student assignment percentage must be between 0 and 100 when provided'
  },

  STUDENT_ASSIGNMENT_GRADING_CONSISTENCY_CHECK: {
    table: 'student_assignments',
    constraintName: 'student_assignment_grading_consistency_valid',
    condition: 'graded_at IS NULL OR (graded_by IS NOT NULL AND grade IS NOT NULL)',
    description: 'Graded assignments must have both grader and grade'
  },

  // Assignment file validations
  ASSIGNMENT_FILE_NAME_LENGTH_CHECK: {
    table: 'assignment_submission_files',
    constraintName: 'assignment_file_name_length_valid',
    condition: 'LENGTH(original_file_name) >= 1 AND LENGTH(original_file_name) <= 255',
    description: 'Assignment file name must be between 1 and 255 characters'
  },

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
  QUIZ_REFERENCE_ID_CHECK: {
    table: 'quiz_mappings',
    constraintName: 'quiz_reference_id_valid',
    condition: 'reference_id > 0',
    description: 'Quiz reference ID must be positive'
  },

  ASSIGNMENT_REFERENCE_ID_CHECK: {
    table: 'assignment_mappings',
    constraintName: 'assignment_reference_id_valid',
    condition: 'reference_id > 0',
    description: 'Assignment reference ID must be positive'
  },
};
