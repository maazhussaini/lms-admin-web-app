import React from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '@/components/common/ProgressBar';

interface QuizProgressProps {
  /**
   * Current question number (1-indexed)
   */
  currentQuestion: number;
  
  /**
   * Total number of questions
   */
  totalQuestions: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuizProgress - Displays quiz progress with question counter and progress bar
 */
export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  className = '',
}) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-2 ${className}`}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-primary-900">
          Question {currentQuestion} Of {totalQuestions}
        </span>
      </div>
      <ProgressBar
        value={progress}
        variant="primary"
        size="sm"
        rounded
        className="w-full"
      />
    </motion.div>
  );
};

export default QuizProgress;
