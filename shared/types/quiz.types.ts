import { MultiTenantAuditFields } from './base.types';

/**
 * Quiz status enumeration
 * @description Defines the lifecycle status of a quiz
 */
export const QuizStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  GRADING_IN_PROGRESS: 'GRADING_IN_PROGRESS',
  GRADED: 'GRADED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type QuizStatus = typeof QuizStatus[keyof typeof QuizStatus];

/**
 * Quiz question type enumeration
 * @description Types of quiz questions available
 */
export const QuizQuestionType = {
  MULTIPLE_CHOICE_SINGLE_ANSWER: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
  MULTIPLE_CHOICE_MULTIPLE_ANSWERS: 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER_ESSAY: 'SHORT_ANSWER_ESSAY',
} as const;

export type QuizQuestionType = typeof QuizQuestionType[keyof typeof QuizQuestionType];

/**
 * Quiz attempt status enumeration
 * @description Status of a student's quiz attempt
 */
export const QuizAttemptStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
} as const;

export type QuizAttemptStatus = typeof QuizAttemptStatus[keyof typeof QuizAttemptStatus];

/**
 * Reference table enumeration for quiz mappings
 * @description Entities that can have quizzes mapped to them
 */
export const QuizReferenceTable = {
  COURSE: 'COURSE',
  COURSE_MODULE: 'COURSE_MODULE',
  COURSE_TOPIC: 'COURSE_TOPIC',
} as const;

export type QuizReferenceTable = typeof QuizReferenceTable[keyof typeof QuizReferenceTable];

/**
 * Represents a quiz with multi-tenant isolation
 * @description Main quiz entity with comprehensive information
 */
export interface Quiz extends MultiTenantAuditFields {
  quiz_id: number;
  course_id: number; // Foreign key to Course
  teacher_id: number; // Teacher who owns the quiz content
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
  reference_table_type: QuizReferenceTable;
  reference_id: number; // ID of the referenced entity
  teacher_id: number; // Teacher who created this mapping
}

/**
 * Represents quiz questions with multi-tenant isolation
 * @description Individual questions within a quiz
 */
export interface QuizQuestion extends MultiTenantAuditFields {
  quiz_question_id: number;
  quiz_id: number; // Foreign key to Quiz
  teacher_id: number; // Teacher who created this question
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
  graded_by?: number | null; // Reference to either teacher or admin who graded
  graded_at?: Date | string | null;
  teacher_notes?: string | null; // Notes from teacher for this attempt
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
  reviewed_by_teacher_id?: number | null; // Teacher who reviewed this specific answer
  teacher_comment?: string | null; // Teacher comment on this answer
}

// Type guards for runtime type checking
export const isQuizStatus = (value: any): value is QuizStatus => 
  Object.keys(QuizStatus).map(k => (QuizStatus as any)[k]).indexOf(value) !== -1;

export const isQuizQuestionType = (value: any): value is QuizQuestionType => 
  Object.keys(QuizQuestionType).map(k => (QuizQuestionType as any)[k]).indexOf(value) !== -1;

export const isQuizAttemptStatus = (value: any): value is QuizAttemptStatus => 
  Object.keys(QuizAttemptStatus).map(k => (QuizAttemptStatus as any)[k]).indexOf(value) !== -1;

export const isQuizReferenceTable = (value: any): value is QuizReferenceTable => 
  Object.keys(QuizReferenceTable).map(k => (QuizReferenceTable as any)[k]).indexOf(value) !== -1;