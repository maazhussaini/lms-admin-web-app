/**
 * @file assessment-unique-constraints.types.ts
 * @description Unique constraints for assessment entities (quizzes and assignments).
 */

import { UniqueConstraint } from '../base-constraint.types';

/**
 * Assessment unique constraints
 */
export const ASSESSMENT_UNIQUE_CONSTRAINTS: Record<string, UniqueConstraint> = {
  // Quiz unique constraints
  QUIZ_NAME_COURSE_UNIQUE: {
    table: 'quizzes',
    constraintName: 'uq_quiz_name_course',
    columns: ['quiz_name', 'course_id'],
    description: 'Quiz name must be unique within course'
  },

  QUIZ_MAPPING_UNIQUE: {
    table: 'quiz_mappings',
    constraintName: 'uq_quiz_mapping',
    columns: ['quiz_id', 'reference_table_id', 'reference_id'],
    description: 'Quiz can only be mapped once to each reference entity'
  },

  QUIZ_QUESTION_POSITION_UNIQUE: {
    table: 'quiz_questions',
    constraintName: 'uq_quiz_question_position',
    columns: ['quiz_id', 'position'],
    description: 'Quiz question position must be unique within quiz'
  },

  QUIZ_OPTION_POSITION_UNIQUE: {
    table: 'quiz_question_options',
    constraintName: 'uq_quiz_option_position',
    columns: ['quiz_question_id', 'position'],
    description: 'Quiz option position must be unique within question'
  },

  QUIZ_QUESTION_ANSWER_UNIQUE: {
    table: 'quiz_question_answers',
    constraintName: 'uq_quiz_question_answer',
    columns: ['quiz_question_id'],
    description: 'Each quiz question can have only one correct answer record'
  },

  QUIZ_ATTEMPT_UNIQUE: {
    table: 'quiz_attempts',
    constraintName: 'uq_quiz_attempt',
    columns: ['quiz_id', 'student_id', 'attempt_number'],
    description: 'Quiz attempt number must be unique per student per quiz'
  },

  QUIZ_ATTEMPT_ANSWER_UNIQUE: {
    table: 'quiz_attempt_answers',
    constraintName: 'uq_quiz_attempt_answer',
    columns: ['quiz_attempt_id', 'quiz_question_id'],
    description: 'Student can have only one answer per question per attempt'
  },

  // Assignment unique constraints
  ASSIGNMENT_NAME_COURSE_UNIQUE: {
    table: 'assignments',
    constraintName: 'uq_assignment_name_course',
    columns: ['assignment_name', 'course_id'],
    description: 'Assignment name must be unique within course'
  },

  ASSIGNMENT_MAPPING_UNIQUE: {
    table: 'assignment_mappings',
    constraintName: 'uq_assignment_mapping',
    columns: ['assignment_id', 'reference_table_id', 'reference_id'],
    description: 'Assignment can only be mapped once to each reference entity'
  },

  STUDENT_ASSIGNMENT_ATTEMPT_UNIQUE: {
    table: 'student_assignments',
    constraintName: 'uq_student_assignment_attempt',
    columns: ['assignment_id', 'student_id', 'attempt_number'],
    description: 'Assignment attempt number must be unique per student per assignment'
  },
};
