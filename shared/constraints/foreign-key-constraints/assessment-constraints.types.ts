import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Foreign key constraints for quiz and assignment entities
 */
export const ASSESSMENT_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Generic quiz and assignment constraints
  QUIZ_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_quiz_reference',
    column: 'quiz_id',
    referencedTable: 'quizzes',
    referencedColumn: 'quiz_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz reference'
  },

  ASSIGNMENT_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_assignment_reference',
    column: 'assignment_id',
    referencedTable: 'assignments',
    referencedColumn: 'assignment_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment reference'
  },

  // Quiz-specific constraints
  QUIZ_COURSE_CONSTRAINT: {
    table: 'quizzes',
    constraintName: 'fk_quiz_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz belongs to course (cascade delete)'
  },

  QUIZ_MAPPING_QUIZ_CONSTRAINT: {
    table: 'quiz_mappings',
    constraintName: 'fk_quiz_mapping_quiz',
    column: 'quiz_id',
    referencedTable: 'quizzes',
    referencedColumn: 'quiz_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz mapping belongs to quiz (cascade delete)'
  },

  QUIZ_QUESTION_QUIZ_CONSTRAINT: {
    table: 'quiz_questions',
    constraintName: 'fk_quiz_question_quiz',
    column: 'quiz_id',
    referencedTable: 'quizzes',
    referencedColumn: 'quiz_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz question belongs to quiz (cascade delete)'
  },

  QUIZ_OPTION_QUESTION_CONSTRAINT: {
    table: 'quiz_question_options',
    constraintName: 'fk_quiz_option_question',
    column: 'quiz_question_id',
    referencedTable: 'quiz_questions',
    referencedColumn: 'quiz_question_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz option belongs to question (cascade delete)'
  },

  QUIZ_ANSWER_QUESTION_CONSTRAINT: {
    table: 'quiz_question_answers',
    constraintName: 'fk_quiz_answer_question',
    column: 'quiz_question_id',
    referencedTable: 'quiz_questions',
    referencedColumn: 'quiz_question_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz answer belongs to question (cascade delete)'
  },

  // Quiz attempt constraints
  QUIZ_ATTEMPT_QUIZ_CONSTRAINT: {
    table: 'quiz_attempts',
    constraintName: 'fk_quiz_attempt_quiz',
    column: 'quiz_id',
    referencedTable: 'quizzes',
    referencedColumn: 'quiz_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz attempt belongs to quiz (cascade delete)'
  },

  QUIZ_ATTEMPT_STUDENT_CONSTRAINT: {
    table: 'quiz_attempts',
    constraintName: 'fk_quiz_attempt_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz attempt belongs to student (cascade delete)'
  },

  QUIZ_ATTEMPT_GRADER_CONSTRAINT: {
    table: 'quiz_attempts',
    constraintName: 'fk_quiz_attempt_grader',
    column: 'graded_by',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Quiz attempt graded by system user (optional)'
  },

  QUIZ_ATTEMPT_ANSWER_ATTEMPT_CONSTRAINT: {
    table: 'quiz_attempt_answers',
    constraintName: 'fk_quiz_attempt_answer_attempt',
    column: 'quiz_attempt_id',
    referencedTable: 'quiz_attempts',
    referencedColumn: 'quiz_attempt_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz attempt answer belongs to attempt (cascade delete)'
  },

  QUIZ_ATTEMPT_ANSWER_QUESTION_CONSTRAINT: {
    table: 'quiz_attempt_answers',
    constraintName: 'fk_quiz_attempt_answer_question',
    column: 'quiz_question_id',
    referencedTable: 'quiz_questions',
    referencedColumn: 'quiz_question_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz attempt answer references question'
  },

  QUIZ_ATTEMPT_ANSWER_OPTION_CONSTRAINT: {
    table: 'quiz_attempt_answers',
    constraintName: 'fk_quiz_attempt_answer_option',
    column: 'quiz_question_option_id',
    referencedTable: 'quiz_question_options',
    referencedColumn: 'quiz_question_option_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Quiz attempt answer references option (optional for essay questions)'
  },

  // Assignment-specific constraints
  ASSIGNMENT_COURSE_CONSTRAINT: {
    table: 'assignments',
    constraintName: 'fk_assignment_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment belongs to course (cascade delete)'
  },

  ASSIGNMENT_MAPPING_ASSIGNMENT_CONSTRAINT: {
    table: 'assignment_mappings',
    constraintName: 'fk_assignment_mapping_assignment',
    column: 'assignment_id',
    referencedTable: 'assignments',
    referencedColumn: 'assignment_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment mapping belongs to assignment (cascade delete)'
  },

  // Student assignment constraints
  STUDENT_ASSIGNMENT_ASSIGNMENT_CONSTRAINT: {
    table: 'student_assignments',
    constraintName: 'fk_student_assignment_assignment',
    column: 'assignment_id',
    referencedTable: 'assignments',
    referencedColumn: 'assignment_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student assignment belongs to assignment (cascade delete)'
  },

  STUDENT_ASSIGNMENT_STUDENT_CONSTRAINT: {
    table: 'student_assignments',
    constraintName: 'fk_student_assignment_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student assignment belongs to student (cascade delete)'
  },

  STUDENT_ASSIGNMENT_GRADER_CONSTRAINT: {
    table: 'student_assignments',
    constraintName: 'fk_student_assignment_grader',
    column: 'graded_by',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Student assignment graded by system user (optional)'
  },

  // Assignment file constraints
  ASSIGNMENT_FILE_SUBMISSION_CONSTRAINT: {
    table: 'assignment_submission_files',
    constraintName: 'fk_assignment_file_submission',
    column: 'student_assignment_id',
    referencedTable: 'student_assignments',
    referencedColumn: 'student_assignment_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment file belongs to submission (cascade delete)'
  },
};