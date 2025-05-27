/**
 * @file assessment-enum-constraints.types.ts
 * @description Assessment entity enum constraints for quizzes and assignments.
 */

import { EnumConstraint } from '../base-constraint.types';

/**
 * Assessment entity enum constraints
 */
export const ASSESSMENT_ENUM_CONSTRAINTS: Record<string, EnumConstraint> = {
  // Quiz status enum
  QUIZ_STATUS_ENUM: {
    table: 'quizzes',
    constraintName: 'chk_quiz_status_valid',
    column: 'status',
    enumName: 'QuizStatus',
    enumValues: { DRAFT: 1, PUBLISHED: 2, GRADING_IN_PROGRESS: 3, GRADED: 4, ARCHIVED: 5 },
    description: 'Quiz status enumeration constraint'
  },

  // Quiz question type enum
  QUIZ_QUESTION_TYPE_ENUM: {
    table: 'quiz_questions',
    constraintName: 'chk_quiz_question_type_valid',
    column: 'question_type',
    enumName: 'QuizQuestionType',
    enumValues: {
      MULTIPLE_CHOICE_SINGLE_ANSWER: 1,
      MULTIPLE_CHOICE_MULTIPLE_ANSWERS: 2,
      TRUE_FALSE: 3,
      SHORT_ANSWER_ESSAY: 4
    },
    description: 'Quiz question type enumeration constraint'
  },

  // Quiz attempt status enum
  QUIZ_ATTEMPT_STATUS_ENUM: {
    table: 'quiz_attempts',
    constraintName: 'chk_quiz_attempt_status_valid',
    column: 'status',
    enumName: 'QuizAttemptStatus',
    enumValues: { NOT_STARTED: 1, IN_PROGRESS: 2, SUBMITTED: 3, GRADED: 4 },
    description: 'Quiz attempt status enumeration constraint'
  },

  // Quiz reference table enum
  QUIZ_REFERENCE_TABLE_ENUM: {
    table: 'quiz_mappings',
    constraintName: 'chk_quiz_reference_table_valid',
    column: 'reference_table_id',
    enumName: 'QuizReferenceTable',
    enumValues: { COURSE: 1, COURSE_MODULE: 2, COURSE_TOPIC: 3 },
    description: 'Quiz reference table enumeration constraint'
  },

  // Assignment type enum
  ASSIGNMENT_TYPE_ENUM: {
    table: 'assignments',
    constraintName: 'chk_assignment_type_valid',
    column: 'assignment_type',
    enumName: 'AssignmentType',
    enumValues: { FILE_UPLOAD: 1 },
    description: 'Assignment type enumeration constraint'
  },

  // Assignment status enum
  ASSIGNMENT_STATUS_ENUM: {
    table: 'assignments',
    constraintName: 'chk_assignment_status_valid',
    column: 'status',
    enumName: 'AssignmentStatus',
    enumValues: { DRAFT: 1, PUBLISHED: 2, GRADING_IN_PROGRESS: 3, GRADED: 4, ARCHIVED: 5 },
    description: 'Assignment status enumeration constraint'
  },

  // Assignment reference table enum
  ASSIGNMENT_REFERENCE_TABLE_ENUM: {
    table: 'assignment_mappings',
    constraintName: 'chk_assignment_reference_table_valid',
    column: 'reference_table_id',
    enumName: 'AssignmentReferenceTable',
    enumValues: { COURSE: 1, COURSE_MODULE: 2, COURSE_TOPIC: 3 },
    description: 'Assignment reference table enumeration constraint'
  },

  // Submission status enum
  SUBMISSION_STATUS_ENUM: {
    table: 'student_assignments',
    constraintName: 'chk_submission_status_valid',
    column: 'submission_status',
    enumName: 'SubmissionStatus',
    enumValues: { NOT_SUBMITTED: 1, SUBMITTED: 2, LATE_SUBMISSION: 3, GRADED: 4, RESUBMITTED: 5 },
    description: 'Assignment submission status enumeration constraint'
  },
};
