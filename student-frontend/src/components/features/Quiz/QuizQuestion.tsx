import React from 'react';
import { motion } from 'framer-motion';

interface QuizQuestionProps {
  /**
   * Question text
   */
  questionText: string;
  
  /**
   * Question number (1-indexed)
   */
  questionNumber: number;
  
  /**
   * Total number of questions
   */
  totalQuestions: number;
  
  /**
   * Question image URL (optional)
   */
  imageUrl?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Children (usually QuizOption components)
   */
  children?: React.ReactNode;
}

/**
 * QuizQuestion - Displays a quiz question with optional image
 */
export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  questionText,
  imageUrl,
  className = '',
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {/* Question Text */}
      <div className="space-y-2">
        <p className="text-primary-900 font-semibold text-lg leading-relaxed">
          {questionText}
        </p>
      </div>

      {/* Question Image (if provided) */}
      {imageUrl && (
        <div className="flex justify-center">
          <img
            src={imageUrl}
            alt="Question visual"
            className="max-w-md rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Options Container */}
      {children && (
        <div className="space-y-3">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default QuizQuestion;
