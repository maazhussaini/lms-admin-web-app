import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface QuizTimerProps {
  /**
   * Time remaining in seconds
   */
  timeRemaining: number;
  
  /**
   * Callback when timer reaches zero
   */
  onTimeUp?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuizTimer - Displays countdown timer for quiz attempts
 */
export const QuizTimer: React.FC<QuizTimerProps> = ({
  timeRemaining,
  onTimeUp,
  className = '',
}) => {
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    // Show warning when less than 1 minute remaining
    if (timeRemaining <= 60 && timeRemaining > 0) {
      setIsWarning(true);
    } else {
      setIsWarning(false);
    }

    // Call onTimeUp when timer reaches zero
    if (timeRemaining === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeRemaining, onTimeUp]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
        isWarning 
          ? 'bg-error/10 border-error text-error' 
          : 'bg-white border-neutral-300 text-neutral-700'
      } ${className}`}
      animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: isWarning ? Infinity : 0, duration: 1 }}
    >
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
        {formatTime(timeRemaining)}
      </span>
    </motion.div>
  );
};

export default QuizTimer;
