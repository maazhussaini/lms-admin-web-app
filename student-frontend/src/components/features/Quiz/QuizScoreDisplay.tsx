import React from 'react';
import { motion } from 'framer-motion';

interface QuizScoreDisplayProps {
  /**
   * Score obtained
   */
  score: number;
  
  /**
   * Total possible score
   */
  totalScore: number;
  
  /**
   * Quiz name
   */
  quizName: string;
  
  /**
   * Time limit in minutes
   */
  timeLimit?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuizScoreDisplay - Celebration display showing quiz results
 */
export const QuizScoreDisplay: React.FC<QuizScoreDisplayProps> = ({
  score,
  totalScore,
  quizName: _quizName,
  timeLimit: _timeLimit,
  className = '',
}) => {
  const percentage = Math.round((score / totalScore) * 100);
  const isPassing = percentage >= 60; // Assuming 60% is passing

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-12 ${className}`}
    >
      {/* Left Side - Celebration Graphic */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="flex-shrink-0"
      >
        <div className="relative inline-block">
          {/* Main Circle */}
          <div className="w-48 h-48 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-2xl">
            {/* Party Icons */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0"
            >
              {/* Confetti/decorative elements */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-110px)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      i % 2 === 0 ? 'bg-yellow-400' : i % 3 === 0 ? 'bg-pink-400' : 'bg-purple-400'
                    }`}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Party Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg
                className="w-24 h-24 text-yellow-300 relative z-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </motion.div>
          </div>

          {/* Confetti ribbons */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`ribbon-${i}`}
              className="absolute"
              style={{
                top: '20%',
                left: '50%',
                width: '3px',
                height: '20px',
                background: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444'][i],
                borderRadius: '2px',
                transform: `rotate(${i * 60}deg) translateY(-140px)`,
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Right Side - Score Display */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 flex flex-col items-end text-right"
      >
        <p className="text-neutral-600 font-medium mb-3">Your Score</p>
        <p className="text-6xl font-bold text-primary-900 mb-3">
          {score.toString().padStart(2, '0')}/{totalScore.toString().padStart(2, '0')}
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-2xl font-bold ${
            isPassing ? 'text-success' : 'text-warning'
          }`}
        >
          {isPassing ? 'Great Job!' : 'Keep Practicing!'}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default QuizScoreDisplay;
