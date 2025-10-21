import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizOption from './QuizOption';

type QuestionStatus = 'correct' | 'wrong' | 'skipped';

interface QuizResultCardProps {
  /**
   * Question number (1-indexed)
   */
  questionNumber: number;
  
  /**
   * Question text
   */
  questionText: string;
  
  /**
   * Question status (correct, wrong, skipped)
   */
  status: QuestionStatus;
  
  /**
   * Array of options with their details
   */
  options: Array<{
    optionId: number;
    text?: string;
    imageUrl?: string;
    isCorrect: boolean;
    isSelected: boolean;
  }>;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuizResultCard - Expandable card showing individual question results
 */
export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  questionNumber,
  questionText,
  status,
  options,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'correct':
        return 'bg-success/10 border-success text-success';
      case 'wrong':
        return 'bg-error/10 border-error text-error';
      case 'skipped':
        return 'bg-warning/10 border-warning text-warning';
      default:
        return 'bg-neutral-100 border-neutral-300 text-neutral-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'correct':
        return (
          <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case 'wrong':
        return (
          <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      case 'skipped':
        return (
          <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'correct':
        return 'Correct';
      case 'wrong':
        return 'Wrong';
      case 'skipped':
        return 'Skipped';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg overflow-hidden ${className}`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full px-6 py-4 flex items-center justify-between transition-colors cursor-pointer
          ${getStatusColor()} hover:opacity-90
        `}
      >
        <div className="flex items-center gap-4 flex-1">
          <span className="font-semibold">Question {questionNumber} Of 5</span>
          {getStatusIcon()}
          <span className="font-bold capitalize">{getStatusLabel()}</span>
        </div>
        
        {/* Expand Icon */}
        <motion.svg
          className="w-5 h-5"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white"
          >
            <div className="px-6 py-6 space-y-4">
              {/* Question Text */}
              <p className="text-primary-900 font-medium">
                {questionText}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {options.map((option) => (
                  <QuizOption
                    key={option.optionId}
                    optionId={option.optionId}
                    text={option.text}
                    imageUrl={option.imageUrl}
                    isSelected={option.isSelected}
                    isCorrect={option.isCorrect}
                    showAnswer={true}
                    onClick={() => {}} // No-op in results view
                    disabled={true}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizResultCard;
