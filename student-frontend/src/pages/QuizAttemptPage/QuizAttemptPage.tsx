import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  QuizTimer,
  QuizProgress,
  QuizQuestion,
  QuizOption,
  ExitConfirmationModal,
} from '@/components/features/Quiz';
import Button from '@/components/common/Button';
import {
  mockQuiz,
  mockQuizQuestions,
  getQuestionOptions,
} from './mockData';

/**
 * QuizAttemptPage - Main quiz-taking interface
 * 
 * Features:
 * - Progress tracking with question counter
 * - Timer countdown
 * - Question display with multiple choice options
 * - Navigation (Exit, Skip, Next)
 * - Exit confirmation modal
 * - Answer tracking
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 */
const QuizAttemptPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeRemaining, setTimeRemaining] = useState(
    (mockQuiz.time_limit_minutes || 5) * 60
  );
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Get current question and options
  const currentQuestion = mockQuizQuestions[currentQuestionIndex];
  const currentOptions = currentQuestion ? getQuestionOptions(currentQuestion.quiz_question_id) : [];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.quiz_question_id] : undefined;
  
  // Determine if option is text or image based on URL pattern
  const isImageOption = (text: string) => {
    return text.startsWith('http') && (text.includes('images.unsplash.com') || text.match(/\.(jpg|jpeg|png|gif|webp)/i));
  };

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Handle option selection
  const handleOptionSelect = (optionId: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.quiz_question_id]: optionId,
    }));
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < mockQuizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question - submit quiz
      handleSubmitQuiz();
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Handle skip question
  const handleSkip = () => {
    if (!currentQuestion) return;
    // Mark as skipped (no answer)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.quiz_question_id]: null,
    }));
    handleNext();
  };

  // Handle exit quiz
  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    // Submit quiz with current answers
    handleSubmitQuiz();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // Handle quiz submission
  const handleSubmitQuiz = () => {
    // Calculate score
    let score = 0;
    mockQuizQuestions.forEach((question) => {
      const selectedOptionId = answers[question.quiz_question_id];
      if (selectedOptionId) {
        const options = getQuestionOptions(question.quiz_question_id);
        const selectedOption = options.find(
          (opt) => opt.quiz_question_option_id === selectedOptionId
        );
        if (selectedOption?.is_correct) {
          score++;
        }
      }
    });

    // Navigate to results page with score and answers
    navigate(`/quizzes/${quizId}/results`, {
      state: {
        score,
        totalQuestions: mockQuizQuestions.length,
        answers,
      },
    });
  };

  // Handle time up
  const handleTimeUp = () => {
    handleSubmitQuiz();
  };

  // Safety check - render error state if no question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Quiz Not Found
          </h2>
          <p className="text-neutral-600 mb-4">
            The requested quiz could not be loaded.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

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
            onClick={handleExit}
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

          {/* Quiz Title */}
          <h1 className="text-xl font-bold text-primary-900">
            {mockQuiz.quiz_name}
          </h1>

          {/* Timer */}
          <QuizTimer timeRemaining={timeRemaining} onTimeUp={handleTimeUp} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Progress */}
          <QuizProgress
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={mockQuizQuestions.length}
          />

          {/* Question */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <QuizQuestion
              questionText={currentQuestion.question_text}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={mockQuizQuestions.length}
            >
              {currentOptions.map((option) => {
                const isImage = isImageOption(option.option_text);
                return (
                  <QuizOption
                    key={option.quiz_question_option_id}
                    optionId={option.quiz_question_option_id}
                    text={isImage ? undefined : option.option_text}
                    imageUrl={isImage ? option.option_text : undefined}
                    isSelected={selectedAnswer === option.quiz_question_option_id}
                    onClick={handleOptionSelect}
                  />
                );
              })}
            </QuizQuestion>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Exit Button */}
            <Button
              variant="danger"
              size="lg"
              onClick={handleExit}
              className="w-full sm:w-auto py-2 px-6 sm:px-12 lg:px-18 rounded-xl border-2"
            >
              Exit
            </Button>

            {/* Skip, Previous and Next Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkip}
                className="w-full sm:w-auto py-2 px-6 sm:px-12 lg:px-18 rounded-xl border-2"
              >
                Skip
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`w-full sm:w-auto py-2 px-6 sm:px-12 lg:px-18 rounded-xl border-2 ${
                  currentQuestionIndex === 0
                    ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' 
                    : 'border-primary-800 text-primary-800 hover:bg-purple-50'
                }`}
                leftIcon={
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                }
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="w-full sm:w-auto py-2 px-6 sm:px-12 lg:px-18 rounded-xl border-2 bg-primary-800 hover:bg-primary-900 text-white border-primary-900"
                rightIcon={
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                }
              >
                {currentQuestionIndex < mockQuizQuestions.length - 1
                  ? 'Next'
                  : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={showExitModal}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </motion.div>
  );
};

export default QuizAttemptPage;
