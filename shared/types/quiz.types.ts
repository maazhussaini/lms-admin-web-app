import { MultiTenantAuditFields } from './base.types';

/**
 * Quiz status enumeration
 * @description Defines the lifecycle status of a quiz
 */
export enum QuizStatus {
  DRAFT = 1,
  PUBLISHED = 2,
  GRADING_IN_PROGRESS = 3,
  GRADED = 4,
  ARCHIVED = 5,
}

/**
 * Quiz question type enumeration
 * @description Types of quiz questions available
 */
export enum QuizQuestionType {
  MULTIPLE_CHOICE_SINGLE_ANSWER = 1,
  MULTIPLE_CHOICE_MULTIPLE_ANSWERS = 2,
  TRUE_FALSE = 3,
  SHORT_ANSWER_ESSAY = 4,
}

/**
 * Quiz attempt status enumeration
 * @description Status of a student's quiz attempt
 */
export enum QuizAttemptStatus {
  NOT_STARTED = 1,
  IN_PROGRESS = 2,
  SUBMITTED = 3,
  GRADED = 4,
}

/**
 * Reference table enumeration for quiz mappings
 * @description Entities that can have quizzes mapped to them
 */
export enum QuizReferenceTable {
  COURSE = 1,
  COURSE_MODULE = 2,
  COURSE_TOPIC = 3,
}

/**
 * Represents a quiz with multi-tenant isolation
 * @description Main quiz entity with comprehensive information
 */
export interface Quiz extends MultiTenantAuditFields {
  quiz_id: number;
  course_id: number; // Foreign key to Course
  quiz_name: string;
  quiz_description?: string | null;
  total_marks: number;
  passing_marks?: number | null;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  allow_retake: boolean;
  randomize_questions: boolean;
  due_date?: Date | string | null;
  status: QuizStatus;
  instructions?: string | null;
}

/**
 * Represents quiz mappings with multi-tenant isolation
 * @description Maps quizzes to different entities (course, module, topic)
 */
export interface QuizMapping extends MultiTenantAuditFields {
  quiz_mapping_id: number;
  quiz_id: number; // Foreign key to Quiz
  reference_table_id: QuizReferenceTable;
  reference_id: number; // ID of the referenced entity
}

/**
 * Represents quiz questions with multi-tenant isolation
 * @description Individual questions within a quiz
 */
export interface QuizQuestion extends MultiTenantAuditFields {
  quiz_question_id: number;
  quiz_id: number; // Foreign key to Quiz
  question_text: string;
  question_type: QuizQuestionType;
  question_marks: number;
  position: number;
}

/**
 * Represents quiz question options with multi-tenant isolation
 * @description Multiple choice options for quiz questions
 */
export interface QuizQuestionOption extends MultiTenantAuditFields {
  quiz_question_option_id: number;
  quiz_question_id: number; // Foreign key to QuizQuestion
  option_text: string;
  position: number;
  is_correct: boolean;
}

/**
 * Represents quiz question answers with multi-tenant isolation
 * @description Correct answers for quiz questions (essays, short answers)
 */
export interface QuizQuestionAnswer extends MultiTenantAuditFields {
  quiz_question_answer_id: number;
  quiz_question_id: number; // Foreign key to QuizQuestion
  answer_text: string;
}

/**
 * Represents quiz attempts with multi-tenant isolation
 * @description Student attempts to complete quizzes
 */
export interface QuizAttempt extends MultiTenantAuditFields {
  quiz_attempt_id: number;
  quiz_id: number; // Foreign key to Quiz
  student_id: number; // Foreign key to Student
  attempt_number: number;
  started_at: Date | string;
  submitted_at?: Date | string | null;
  score?: number | null;
  percentage?: number | null;
  status: QuizAttemptStatus;
  time_taken_minutes?: number | null;
  graded_by?: number | null; // Foreign key to SystemUser
  graded_at?: Date | string | null;
}

/**
 * Represents quiz attempt answers with multi-tenant isolation
 * @description Student answers for individual quiz questions
 */
export interface QuizAttemptAnswer extends MultiTenantAuditFields {
  quiz_attempt_answer_id: number;
  quiz_attempt_id: number; // Foreign key to QuizAttempt
  quiz_question_id: number; // Foreign key to QuizQuestion
  quiz_question_option_id?: number | null; // Foreign key to QuizQuestionOption (for MC questions)
  answer_text?: string | null; // For essay/short answer questions
  is_correct?: boolean | null;
  marks_obtained?: number | null;
}

// Type guards for runtime type checking
export const isQuizStatus = (value: any): value is QuizStatus => 
  Object.values(QuizStatus).includes(value);

export const isQuizQuestionType = (value: any): value is QuizQuestionType => 
  Object.values(QuizQuestionType).includes(value);

export const isQuizAttemptStatus = (value: any): value is QuizAttemptStatus => 
  Object.values(QuizAttemptStatus).includes(value);

export const isQuizReferenceTable = (value: any): value is QuizReferenceTable => 
  Object.values(QuizReferenceTable).includes(value);