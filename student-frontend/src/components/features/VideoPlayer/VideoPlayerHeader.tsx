import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCommentDots } from 'react-icons/fa';
import Button from '@/components/common/Button';
import type { CourseVideo } from '@shared/types';
import { CourseDetailsData } from '@/pages/CourseDetailsPage/mockData';
import { VideoDetails } from '@/services/courseService';

interface NavigationContext {
  courseDetails: CourseDetailsData;
  currentModule?: CourseDetailsData['modules'][0];
  currentTopic?: CourseDetailsData['modules'][0]['topics'][0];
  currentVideo: CourseVideo;
}

interface VideoPlayerHeaderProps {
  /** Navigation context containing course, module, topic, and video data */
  navigationContext: NavigationContext;
  /** Video details from API with teacher information */
  videoDetails: VideoDetails;
  /** Topic name for display */
  topicName?: string;
  /** Callback function for back navigation */
  onBack: () => void;
  /** Callback function for feedback action */
  onFeedback?: () => void;
}

/**
 * VideoPlayerHeader - Header component for video player page
 * 
 * Features:
 * - Back navigation button
 * - Teacher thumbnail and information from API
 * - Topic and lecture information from API
 * - Feedback button
 * - Clean design matching the LMS system
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const VideoPlayerHeader: React.FC<VideoPlayerHeaderProps> = ({
  navigationContext,
  videoDetails,
  topicName,
  onBack,
  onFeedback
}) => {
  const { currentVideo } = navigationContext;
  
  // Use API data for teacher information
  const instructorName = videoDetails.teacher_name || 'Unknown Instructor';
  const instructorQualification = videoDetails.teacher_qualification || 'Instructor';
  const instructorAvatar = videoDetails.profile_picture_url;
  
  // Use API data for content information
  const videoName = videoDetails.video_name || currentVideo.video_name;
  const topicDisplayName = topicName || 'Course Topic';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Navigation with Teacher Info */}
      <div className="flex justify-between items-center p-4">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          size="lg"
          shape="rounded"
          aria-label="Go back"
          className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white shadow-sm"
        >
          <FaArrowLeft className="text-lg" style={{ color: '#63747D' }} />
        </Button>

        {/* Teacher Info (Left-aligned) */}
        <div className="flex items-center space-x-4 flex-1 ml-4">
          {/* Teacher Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
            {instructorAvatar ? (
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-medium">
                {instructorName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Teacher Details */}
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-primary-900 mb-1">
              {instructorName}
            </h2>
            <p className="text-gray-600 text-base">
              {instructorQualification}
            </p>
          </div>
        </div>

        {/* Feedback Button */}
        <Button
          onClick={onFeedback}
          variant="ghost"
          size="lg"
          shape="rounded"
          aria-label="Send feedback"
          className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white shadow-sm"
        >
          <FaCommentDots className="text-lg" style={{ color: '#63747D' }} />
        </Button>
      </div>

      {/* Topic and Lecture Section */}
      <div className="px-6 pb-6">
        <h3 className="text-lg text-gray-600 mb-2">
          {topicDisplayName}
        </h3>
        <h1 className="text-2xl font-medium text-primary-900">
          {videoName}
        </h1>
      </div>
    </motion.div>
  );
};

export default VideoPlayerHeader;
