import React from 'react';
import { motion } from 'framer-motion';
import type { CourseVideo } from '@shared/types';
import { CourseDetailsData } from '@/pages/CourseDetailsPage/mockData';

interface NavigationContext {
  courseDetails: CourseDetailsData;
  currentModule?: CourseDetailsData['modules'][0];
  currentTopic?: CourseDetailsData['modules'][0]['topics'][0];
  currentVideo: CourseVideo;
}

interface VideoPlayerInfoProps {
  /** Navigation context containing course, module, topic, and video data */
  navigationContext: NavigationContext;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VideoPlayerInfo - Information component for video player
 * 
 * Displays:
 * - Course topic and lecture information
 * - Instructor details
 * - Video description (if available)
 * - Course context
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const VideoPlayerInfo: React.FC<VideoPlayerInfoProps> = ({
  navigationContext,
  className = ''
}) => {
  const { courseDetails, currentTopic, currentVideo } = navigationContext;
  const instructorName = courseDetails.instructor?.name || 'Unknown Instructor';

  return (
    <motion.div
      className={`px-4 sm:px-6 lg:px-8 py-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Topic and Lecture Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            Topic 1: {currentTopic?.course_topic_name || 'Computer Science'}
          </h1>
          <h2 className="text-xl sm:text-2xl font-medium text-primary-900">
            Lecture 1: {currentVideo.video_name || 'Basic Programming'}
          </h2>
        </div>

        {/* Instructor Information */}
        <motion.div
          className="flex items-center space-x-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Instructor Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
            <img
              src={courseDetails.instructor?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
              alt={instructorName}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Instructor Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 truncate">
              {instructorName}
            </h3>
            <p className="text-neutral-600 text-sm">
              Computer Science Professor
            </p>
          </div>
        </motion.div>

        {/* Video Description or Course Context */}
        {courseDetails.course_description && (
          <motion.div
            className="prose prose-neutral max-w-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-neutral-700 leading-relaxed">
              {courseDetails.course_description.substring(0, 300)}
              {courseDetails.course_description.length > 300 && '...'}
            </p>
          </motion.div>
        )}

        {/* Additional Video Metadata */}
        {currentVideo.duration_seconds && (
          <motion.div
            className="mt-6 flex flex-wrap items-center gap-4 text-sm text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              <span>
                Duration: {Math.floor(currentVideo.duration_seconds / 60)} mins {currentVideo.duration_seconds % 60} secs
              </span>
            </div>
            
            {currentVideo.position && (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-neutral-400 rounded-full"></span>
                <span>Lecture {currentVideo.position}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>HD Quality</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoPlayerInfo;
