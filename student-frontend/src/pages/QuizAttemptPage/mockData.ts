import type { Quiz, QuizQuestion, QuizQuestionOption, QuizAttempt } from '@shared/types';

/**
 * Base audit fields for mock data
 */
const baseAuditFields = {
  tenant_id: 1,
  is_active: true,
  is_deleted: false,
  created_by: 1,
  created_ip: '127.0.0.1',
  updated_by: 1,
  updated_ip: '127.0.0.1',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
};

/**
 * Mock quiz data for testing and development
 */
export const mockQuiz: Quiz = {
  quiz_id: 1,
  course_id: 1,
  teacher_id: 1,
  quiz_name: 'Quiz 1: Basic Programming',
  quiz_description: 'Test your knowledge of basic programming concepts',
  total_marks: 5,
  passing_marks: 3,
  time_limit_minutes: 5,
  max_attempts: 3,
  allow_retake: true,
  randomize_questions: false,
  due_date: null,
  status: 'PUBLISHED',
  instructions: 'Answer all questions to the best of your ability. Each question carries 1 mark.',
  ...baseAuditFields,
};

/**
 * Mock quiz questions with Lorem Ipsum text and images
 */
export const mockQuizQuestions: QuizQuestion[] = [
  {
    quiz_question_id: 1,
    quiz_id: 1,
    teacher_id: 1,
    question_text: 'Lorem Ipsum Dolor Sit Amet Consectetur. Arcu Bibendum Nullam Dui Parturient Tincidunt At Ipsum Sed.',
    question_type: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
    question_marks: 1,
    position: 1,
    ...baseAuditFields,
  },
  {
    quiz_question_id: 2,
    quiz_id: 1,
    teacher_id: 1,
    question_text: 'Lorem Ipsum Dolor Sit Amet Consectetur. Arcu Bibendum Nullam Dui Parturient Tincidunt At Ipsum Sed.',
    question_type: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
    question_marks: 1,
    position: 2,
    ...baseAuditFields,
  },
  {
    quiz_question_id: 3,
    quiz_id: 1,
    teacher_id: 1,
    question_text: 'Lorem Ipsum Dolor Sit Amet Consectetur. Arcu Bibendum Nullam Dui Parturient Tincidunt At Ipsum Sed.',
    question_type: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
    question_marks: 1,
    position: 3,
    ...baseAuditFields,
  },
  {
    quiz_question_id: 4,
    quiz_id: 1,
    teacher_id: 1,
    question_text: 'Lorem Ipsum Dolor Sit Amet Consectetur. Arcu Bibendum Nullam Dui Parturient Tincidunt At Ipsum Sed.',
    question_type: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
    question_marks: 1,
    position: 4,
    ...baseAuditFields,
  },
  {
    quiz_question_id: 5,
    quiz_id: 1,
    teacher_id: 1,
    question_text: 'Lorem Ipsum Dolor Sit Amet Consectetur. Arcu Bibendum Nullam Dui Parturient Tincidunt At Ipsum Sed.',
    question_type: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
    question_marks: 1,
    position: 5,
    ...baseAuditFields,
  },
];

/**
 * Mock quiz options - Text options for Question 1
 */
export const mockQuestion1Options: QuizQuestionOption[] = [
  {
    quiz_question_option_id: 1,
    quiz_question_id: 1,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 1,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 2,
    quiz_question_id: 1,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 2,
    is_correct: true,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 3,
    quiz_question_id: 1,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 3,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 4,
    quiz_question_id: 1,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 4,
    is_correct: false,
    ...baseAuditFields,
  },
];

/**
 * Mock quiz options - Image options for Question 2
 * Using placeholder images from Unsplash
 */
export const mockQuestion2Options: QuizQuestionOption[] = [
  {
    quiz_question_option_id: 5,
    quiz_question_id: 2,
    option_text: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=800&fit=crop',
    position: 1,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 6,
    quiz_question_id: 2,
    option_text: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
    position: 2,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 7,
    quiz_question_id: 2,
    option_text: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop',
    position: 3,
    is_correct: true,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 8,
    quiz_question_id: 2,
    option_text: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=800&fit=crop',
    position: 4,
    is_correct: false,
    ...baseAuditFields,
  },
];

/**
 * Mock quiz options - Text options for remaining questions
 */
export const mockQuestion3Options: QuizQuestionOption[] = [
  {
    quiz_question_option_id: 9,
    quiz_question_id: 3,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 1,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 10,
    quiz_question_id: 3,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 2,
    is_correct: true,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 11,
    quiz_question_id: 3,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 3,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 12,
    quiz_question_id: 3,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 4,
    is_correct: false,
    ...baseAuditFields,
  },
];

export const mockQuestion4Options: QuizQuestionOption[] = [
  {
    quiz_question_option_id: 13,
    quiz_question_id: 4,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 1,
    is_correct: true,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 14,
    quiz_question_id: 4,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 2,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 15,
    quiz_question_id: 4,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 3,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 16,
    quiz_question_id: 4,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 4,
    is_correct: false,
    ...baseAuditFields,
  },
];

export const mockQuestion5Options: QuizQuestionOption[] = [
  {
    quiz_question_option_id: 17,
    quiz_question_id: 5,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 1,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 18,
    quiz_question_id: 5,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 2,
    is_correct: true,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 19,
    quiz_question_id: 5,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 3,
    is_correct: false,
    ...baseAuditFields,
  },
  {
    quiz_question_option_id: 20,
    quiz_question_id: 5,
    option_text: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
    position: 4,
    is_correct: false,
    ...baseAuditFields,
  },
];

/**
 * Helper to get options for a specific question
 */
export const getQuestionOptions = (questionId: number): QuizQuestionOption[] => {
  const optionsMap: Record<number, QuizQuestionOption[]> = {
    1: mockQuestion1Options,
    2: mockQuestion2Options,
    3: mockQuestion3Options,
    4: mockQuestion4Options,
    5: mockQuestion5Options,
  };
  return optionsMap[questionId] || [];
};

/**
 * Mock quiz attempt
 */
export const mockQuizAttempt: QuizAttempt = {
  quiz_attempt_id: 1,
  quiz_id: 1,
  student_id: 1,
  attempt_number: 1,
  started_at: new Date(),
  submitted_at: null,
  score: null,
  percentage: null,
  status: 'IN_PROGRESS',
  time_taken_minutes: null,
  graded_by: null,
  graded_at: null,
  teacher_notes: null,
  ...baseAuditFields,
};
