import React from 'react';
import { motion } from 'framer-motion';

interface QuizOptionProps {
  /**
   * Option ID
   */
  optionId: number;
  
  /**
   * Option text content
   */
  text?: string;
  
  /**
   * Option image URL
   */
  imageUrl?: string;
  
  /**
   * Whether this option is selected
   */
  isSelected: boolean;
  
  /**
   * Whether this option is correct (for results view)
   */
  isCorrect?: boolean;
  
  /**
   * Whether to show answer state (for results view)
   */
  showAnswer?: boolean;
  
  /**
   * Click handler
   */
  onClick: (optionId: number) => void;
  
  /**
   * Whether the option is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuizOption - Individual quiz option component supporting text and images
 */
export const QuizOption: React.FC<QuizOptionProps> = ({
  optionId,
  text,
  imageUrl,
  isSelected,
  isCorrect,
  showAnswer = false,
  onClick,
  disabled = false,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(optionId);
    }
  };

  // Determine background color based on state
  const getBackgroundColor = () => {
    if (showAnswer && isCorrect) {
      return 'bg-success/10 border-success';
    }
    if (showAnswer && isSelected && !isCorrect) {
      return 'bg-error/10 border-error';
    }
    if (isSelected) {
      return 'bg-primary-100 border-primary-500';
    }
    return 'bg-white border-neutral-300 hover:border-primary-400';
  };

  // Determine text color
  const getTextColor = () => {
    if (showAnswer && isCorrect) {
      return 'text-success';
    }
    if (showAnswer && isSelected && !isCorrect) {
      return 'text-error';
    }
    if (isSelected) {
      return 'text-primary-900';
    }
    return 'text-neutral-700';
  };

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={handleClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all cursor-pointer
        ${getBackgroundColor()}
        ${disabled ? 'cursor-not-allowed opacity-70' : ''}
        ${className}
      `}
    >
      {/* Image Option */}
      {imageUrl && (
        <div className="mb-3">
          <img
            src={imageUrl}
            alt={text || 'Quiz option'}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}

      {/* Text Content */}
      {text && (
        <div className="flex items-center gap-3">
          <p className={`flex-1 ${getTextColor()} font-medium`}>
            {text}
          </p>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${showAnswer && isCorrect ? 'bg-success' : showAnswer && !isCorrect ? 'bg-error' : 'bg-primary-500'}
          `}>
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
        </motion.div>
      )}

      {/* Correct Answer Indicator (when not selected) */}
      {showAnswer && isCorrect && !isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
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
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizOption;
