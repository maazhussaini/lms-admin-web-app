import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import type { CourseVideo } from '@shared/types';

interface VideoPlayerControlsProps {
  /** Current video index in the playlist */
  currentVideoIndex: number;
  /** Total number of videos in the playlist */
  totalVideos: number;
  /** Whether there is a previous video */
  hasPrevious: boolean;
  /** Whether there is a next video */
  hasNext: boolean;
  /** Callback for previous video navigation */
  onPrevious: () => void;
  /** Callback for next video navigation */
  onNext: () => void;
  /** Previous video data for display */
  previousVideo: CourseVideo | null;
  /** Next video data for display */
  nextVideo: CourseVideo | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VideoPlayerControls - Navigation controls for video player
 * 
 * Features:
 * - Previous/Next video navigation
 * - Video information display
 * - Progress indication
 * - Responsive design matching the LMS theme
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  currentVideoIndex,
  totalVideos,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  previousVideo,
  nextVideo,
  className = ''
}) => {
  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} Mins ${remainingSeconds} Secs`;
  };

  return (
    <motion.div
      className={`w-full px-4 py-6 sm:px-8 lg:px-16 sm:py-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="w-full">
        {/* Navigation Buttons and Video Information */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full gap-4 sm:gap-0">
          {/* Previous Button and Info */}
          <div className="flex flex-col items-start w-full sm:w-auto">
            <motion.div
              className="mb-3 w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onPrevious}
                disabled={!hasPrevious}
                variant="outline"
                size="lg"
                className={`w-full sm:w-auto py-2 px-6 sm:px-12 lg:px-24 rounded-xl border-2 ${
                  !hasPrevious 
                    ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' 
                    : 'border-primary-800 text-primary-800 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {/* Previous icon */}
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
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
                  <span className="font-medium text-sm sm:text-base">Previous</span>
                </div>
              </Button>
            </motion.div>
            
            {/* Previous Video Info */}
            {hasPrevious && previousVideo && (
              <motion.div
                className="text-center w-full sm:w-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="font-regular text-primary-700 text-sm mb-1 truncate">
                  {previousVideo.video_name}
                </div>
                <div className="text-xs text-neutral-500">
                  {previousVideo.duration_seconds 
                    ? formatDuration(previousVideo.duration_seconds)
                    : '30 Mins 12 Secs'
                  }
                </div>
              </motion.div>
            )}
          </div>

          {/* Next Button and Info */}
          <div className="flex flex-col items-end w-full sm:w-auto">
            <motion.div
              className="mb-3 w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onNext}
                disabled={!hasNext}
                variant={hasNext ? "primary" : "outline"}
                size="lg"
                className={`w-full sm:w-auto py-2 px-6 sm:px-12 lg:px-24 rounded-xl ${
                  !hasNext 
                    ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' 
                    : 'bg-primary-800 hover:bg-primary-900 text-white border-primary-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-medium text-sm sm:text-base">Next</span>
                  {/* Next icon */}
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
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
                </div>
              </Button>
            </motion.div>
            
            {/* Next Video Info */}
            {hasNext && nextVideo && (
              <motion.div
                className="text-center w-full sm:w-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="font-regular text-primary-700 text-sm mb-1 truncate">
                  {nextVideo.video_name}
                </div>
                <div className="text-xs text-neutral-500">
                  {nextVideo.duration_seconds 
                    ? formatDuration(nextVideo.duration_seconds)
                    : '30 Mins 12 Secs'
                  }
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="inline-flex items-center space-x-2 text-sm text-neutral-600">
            <span>Video</span>
            <span className="font-semibold text-primary-600">
              {currentVideoIndex + 1}
            </span>
            <span>of</span>
            <span className="font-semibold">
              {totalVideos}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full max-w-xs mx-auto bg-neutral-200 rounded-full h-1">
            <div 
              className="bg-primary-600 h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${totalVideos > 0 ? ((currentVideoIndex + 1) / totalVideos) * 100 : 0}%` 
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoPlayerControls;
