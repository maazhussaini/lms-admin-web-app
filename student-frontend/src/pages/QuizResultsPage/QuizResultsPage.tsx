import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  QuizScoreDisplay,
  QuizResultCard,
} from '@/components/features/Quiz';
import Button from '@/components/common/Button';
import {
  mockQuiz,
  mockQuizQuestions,
  getQuestionOptions,
} from '../QuizAttemptPage/mockData';

interface LocationState {
  score: number;
  totalQuestions: number;
  answers: Record<number, number | null>;
}

/**
 * QuizResultsPage - Displays quiz results with score and question review
 * 
 * Features:
 * - Score display with celebration animation
 * - Question-by-question review
 * - Expandable question details
 * - Color-coded status (correct, wrong, skipped)
 * - Navigate back to courses
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 */
const QuizResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Fallback if no state is provided
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            No Results Available
          </h2>
          <p className="text-neutral-600 mb-4">
            Unable to load quiz results.
          </p>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, answers } = state;

  // Build results data for each question
  const questionResults = mockQuizQuestions.map((question) => {
    const options = getQuestionOptions(question.quiz_question_id);
    const selectedOptionId = answers[question.quiz_question_id];
    const correctOption = options.find((opt) => opt.is_correct);
    
    // Determine status
    let status: 'correct' | 'wrong' | 'skipped';
    if (!selectedOptionId) {
      status = 'skipped';
    } else if (selectedOptionId === correctOption?.quiz_question_option_id) {
      status = 'correct';
    } else {
      status = 'wrong';
    }

    // Check if options are images
    const isImageOption = (text: string) => {
      return text.startsWith('http') && (text.includes('images.unsplash.com') || text.match(/\.(jpg|jpeg|png|gif|webp)/i));
    };

    return {
      questionNumber: question.position,
      questionText: question.question_text,
      status,
      options: options.map((opt) => ({
        optionId: opt.quiz_question_option_id,
        text: isImageOption(opt.option_text) ? undefined : opt.option_text,
        imageUrl: isImageOption(opt.option_text) ? opt.option_text : undefined,
        isCorrect: opt.is_correct,
        isSelected: selectedOptionId === opt.quiz_question_option_id,
      })),
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="bg-page-bg pb-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center justify-center w-10 h-10 bg-white rounded-2xl hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-neutral-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Page Title */}
          <h1 className="text-xl font-bold text-primary-900">{mockQuiz.quiz_name}</h1>

          {/* Time Display */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white border-neutral-300 text-neutral-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-sm">
              {mockQuiz.time_limit_minutes || 5} Mins
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Score Display - Side by Side Layout */}
          <QuizScoreDisplay
            score={score}
            totalScore={totalQuestions}
            quizName={mockQuiz.quiz_name}
            timeLimit={mockQuiz.time_limit_minutes || undefined}
          />

          {/* Questions Review Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Questions</h2>
            
            {questionResults.map((result, index) => (
              <QuizResultCard
                key={index}
                questionNumber={result.questionNumber}
                questionText={result.questionText}
                status={result.status}
                options={result.options}
              />
            ))}
          </div>

          {/* Action Buttons */}
          {/* <div className="flex justify-center gap-4 pb-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/courses')}
            >
              Back to Courses
            </Button>
            {mockQuiz.allow_retake && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(-2)} // Go back to quiz attempt page
              >
                Retake Quiz
              </Button>
            )}
          </div> */}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResultsPage;
