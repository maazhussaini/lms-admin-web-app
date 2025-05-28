import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Foreign key constraints for quiz and assignment entities
 */
export const ASSESSMENT_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Quiz-specific constraints
  QUIZ_TENANT_CONSTRAINT: {
    table: 'quizzes',
    constraintName: 'fk_quiz_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz belongs to tenant'
  },

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

  QUIZ_TEACHER_CONSTRAINT: {
    table: 'quizzes',
    constraintName: 'fk_quiz_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz owned by teacher'
  },

  // Quiz mapping constraints
  QUIZ_MAPPING_TENANT_CONSTRAINT: {
    table: 'quiz_mappings',
    constraintName: 'fk_quiz_mapping_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz mapping belongs to tenant'
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

  QUIZ_MAPPING_TEACHER_CONSTRAINT: {
    table: 'quiz_mappings',
    constraintName: 'fk_quiz_mapping_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz mapping created by teacher'
  },

  // Quiz question constraints
  QUIZ_QUESTION_TENANT_CONSTRAINT: {
    table: 'quiz_questions',
    constraintName: 'fk_quiz_question_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz question belongs to tenant'
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

  QUIZ_QUESTION_TEACHER_CONSTRAINT: {
    table: 'quiz_questions',
    constraintName: 'fk_quiz_question_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz question created by teacher'
  },

  // Quiz option constraints
  QUIZ_OPTION_TENANT_CONSTRAINT: {
    table: 'quiz_question_options',
    constraintName: 'fk_quiz_option_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz option belongs to tenant'
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

  // Quiz answer constraints
  QUIZ_ANSWER_TENANT_CONSTRAINT: {
    table: 'quiz_question_answers',
    constraintName: 'fk_quiz_answer_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz answer belongs to tenant'
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
  QUIZ_ATTEMPT_TENANT_CONSTRAINT: {
    table: 'quiz_attempts',
    constraintName: 'fk_quiz_attempt_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz attempt belongs to tenant'
  },

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

  // Quiz attempt answer constraints
  QUIZ_ATTEMPT_ANSWER_TENANT_CONSTRAINT: {
    table: 'quiz_attempt_answers',
    constraintName: 'fk_quiz_attempt_answer_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Quiz attempt answer belongs to tenant'
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

  QUIZ_ATTEMPT_ANSWER_REVIEWING_TEACHER_CONSTRAINT: {
    table: 'quiz_attempt_answers',
    constraintName: 'fk_quiz_attempt_answer_reviewing_teacher',
    column: 'reviewed_by_teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Quiz attempt answer reviewed by teacher (optional)'
  },

  // Assignment-specific constraints
  ASSIGNMENT_TENANT_CONSTRAINT: {
    table: 'assignments',
    constraintName: 'fk_assignment_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment belongs to tenant'
  },

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

  ASSIGNMENT_TEACHER_CONSTRAINT: {
    table: 'assignments',
    constraintName: 'fk_assignment_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment owned by teacher'
  },

  // Assignment mapping constraints
  ASSIGNMENT_MAPPING_TENANT_CONSTRAINT: {
    table: 'assignment_mappings',
    constraintName: 'fk_assignment_mapping_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment mapping belongs to tenant'
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

  ASSIGNMENT_MAPPING_TEACHER_CONSTRAINT: {
    table: 'assignment_mappings',
    constraintName: 'fk_assignment_mapping_teacher',
    column: 'teacher_id',
    referencedTable: 'teachers',
    referencedColumn: 'teacher_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment mapping created by teacher'
  },

  // Student assignment constraints
  STUDENT_ASSIGNMENT_TENANT_CONSTRAINT: {
    table: 'student_assignments',
    constraintName: 'fk_student_assignment_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Student assignment belongs to tenant'
  },

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
  ASSIGNMENT_FILE_TENANT_CONSTRAINT: {
    table: 'assignment_submission_files',
    constraintName: 'fk_assignment_file_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assignment file belongs to tenant'
  },

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