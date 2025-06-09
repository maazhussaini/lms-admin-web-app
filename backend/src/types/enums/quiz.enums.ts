/**
 * Quiz status enumeration
 * @description Defines the lifecycle status of a quiz
 */
export enum QuizStatus {
  DRAFT,
  PUBLISHED,
  GRADING_IN_PROGRESS,
  GRADED,
  ARCHIVED,
}

/**
 * Quiz question type enumeration
 * @description Types of quiz questions available
 */
export enum QuizQuestionType {
  MULTIPLE_CHOICE_SINGLE_ANSWER,
  MULTIPLE_CHOICE_MULTIPLE_ANSWERS,
  TRUE_FALSE,
  SHORT_ANSWER_ESSAY,
}

/**
 * Quiz attempt status enumeration
 * @description Status of a student's quiz attempt
 */
export enum QuizAttemptStatus {
  NOT_STARTED,
  IN_PROGRESS,
  SUBMITTED,
  GRADED,
}

/**
 * Reference table enumeration for quiz mappings
 * @description Entities that can have quizzes mapped to them
 */
export enum QuizReferenceTable {
  COURSE,
  COURSE_MODULE,
  COURSE_TOPIC,
}