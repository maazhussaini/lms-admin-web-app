import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFileAlt, 
  FaClipboardList,
  FaQuestionCircle,
  FaVideo,
  FaLock,
  FaUnlock,
  FaChevronRight
} from 'react-icons/fa';
import { CourseBasicDetails } from '@/services/courseService';
import { formatDurationFromSeconds } from '@shared/utils';
import { useTopicVideos, useModuleTopics, useCourseModules } from '@/hooks/useCourse';
import { useCourseNavigation } from '@/hooks/useCourseNavigation';
import TopicContentSelector from './TopicContentSelector';
import TopicSelector from './TopicSelector';
import Breadcrumb, { BreadcrumbItem } from '@/components/common/Breadcrumb';
import type { TopicContentType } from '@/types/courseDetails.ui.types';

/**
 * Video status badge component with custom colors
 */
const VideoStatusBadge: React.FC<{
  status: 'Completed' | 'In Progress' | 'Pending';
}> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#F1FFEE] text-[#0E6100]';
      case 'In Progress':
        return 'bg-[#FFE8ED] text-[#FB3E70]';
      case 'Pending':
        return 'bg-[#FFF4E6] text-[#FA991C]';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[10px] text-xs sm:text-sm font-medium ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

/**
 * Helper function to get video status display information based on Figma design
 * Uses exact hex colors: Completed (#0E6100), Pending (#FA991C), In Progress (#FB3E70)
 */
const getVideoStatusInfo = (video: {
  is_completed: boolean | null;
  completion_percentage: number | null;
  is_video_locked: boolean;
}) => {
  if (video.is_completed) {
    return {
      status: 'Completed' as const,
      iconColor: 'text-blue-500',
      isLocked: false
    };
  } else if (video.completion_percentage && video.completion_percentage > 0) {
    return {
      status: 'In Progress' as const,
      iconColor: video.is_video_locked ? 'text-red-500' : 'text-blue-500',
      isLocked: video.is_video_locked
    };
  } else {
    return {
      status: 'Pending' as const,
      iconColor: video.is_video_locked ? 'text-red-500' : 'text-blue-500',
      isLocked: video.is_video_locked
    };
  }
};

/**
 * Props for the TopicComponent
 */
interface TopicComponentProps {
  /** Course details data */
  courseDetails: CourseBasicDetails;
  /** Module ID */
  moduleId: number;
  /** Topic ID */
  topicId: number;
}

/**
 * TopicComponent - Displays topic details including video lectures, assignments, quizzes, materials, and live classes
 * 
 * This component shows:
 * - Topic information and description
 * - Video lectures list
 * - Assignments list (future implementation)
 * - Quizzes list (future implementation)
 * - Materials/documents list
 * - Live classes list (future implementation)
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const TopicComponent: React.FC<TopicComponentProps> = ({
  courseDetails,
  moduleId,
  topicId
}) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeContent, setActiveContent] = useState<TopicContentType>('lectures');
  
  // Use course navigation hook for simplified navigation
  const { navigateToVideo, navigateToTopic } = useCourseNavigation();

  // Parse courseId from string to number for API calls
  const courseIdNumber = courseId ? parseInt(courseId, 10) : 0;

  // Fetch videos for this topic using the API
  const { data: videosData, loading: videosLoading, error: videosError } = useTopicVideos(topicId);

  // Fetch all topics for this module for the topic selector
  const { data: topicsData, loading: topicsLoading, error: topicsError } = useModuleTopics(moduleId);

  // Fetch course modules to get the current module name for breadcrumbs
  const { data: modulesData } = useCourseModules(courseIdNumber);

  // Get videos and topics from API responses
  const videos = videosData?.items || [];
  const topics = topicsData?.items || [];
  const modules = modulesData?.items || [];

  // Find the current topic from the topics array
  const currentTopic = topics.find(topic => topic.course_topic_id === topicId) || {
    course_topic_id: topicId,
    course_topic_name: `Topic ${topicId}`, // Fallback if topic not found
    course_topic_description: ''
  };

  // Find the current module for breadcrumb display
  const currentModule = modules.find(module => module.course_module_id === moduleId) || {
    course_module_id: moduleId,
    course_module_name: `Module ${moduleId}`, // Fallback if module not found
    course_module_description: ''
  };

  // Navigate to video player
  const handleVideoClick = (videoId: number) => {
    navigateToVideo(moduleId, topicId, videoId);
  };

  // Handle topic selection from TopicSelector
  const handleTopicSelect = (selectedTopicId: number) => {
    navigateToTopic(moduleId, selectedTopicId);
  };

  // Handle content type change
  const handleContentChange = (contentType: TopicContentType) => {
    setActiveContent(contentType);
  };

  // Calculate content counts
  const contentCounts = {
    lectures: videos.length,
    liveClasses: 0, // TODO: Add live classes count when implemented
    assignments: 0, // TODO: Add assignments count when implemented
    quizzes: 0,     // TODO: Add quizzes count when implemented
    materials: 0    // TODO: Add materials count when implemented
  };

  // Loading state for videos or topics - only show spinner if multiple critical resources are loading
  if (videosLoading && topicsLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
          <span className="ml-2 text-neutral-600">Loading topic...</span>
        </div>
      </div>
    );
  }

  // Error state for videos or topics
  if (videosError || topicsError) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error loading topic
          </h2>
          <p className="text-neutral-600">
            {videosError?.message || topicsError?.message || 'Failed to load topic data.'}
          </p>
        </div>
      </div>
    );
  }

  // Breadcrumb items for navigation
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: courseDetails.course_name || 'Course',
      path: `/courses/${courseId}`,
      isActive: false
    },
    {
      label: currentModule.course_module_name || `Module ${moduleId}`,
      path: `/courses/${courseId}/modules/${moduleId}`,
      isActive: false
    },
    {
      label: currentTopic.course_topic_name || `Topic ${topicId}`,
      isActive: true
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Breadcrumb Navigation - Moved to top for better mobile UX */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Topic Header */}
      <motion.div
        className="mb-6 lg:mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-primary-900 mb-3 lg:mb-4 leading-tight">
          {currentTopic.course_topic_name}
        </h2>
        {/* <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
          Topic description will be displayed here when available.
        </p> */}
      </motion.div>

      {/* Topic Selector for Navigation - Always show */}
      {!topicsLoading ? (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          <TopicSelector
            topics={topics}
            currentTopicId={topicId}
            onTopicSelect={handleTopicSelect}
          />
        </motion.div>
      ) : (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          <div className="w-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-lg font-semibold text-primary-900">Module Topics</h3>
              <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse"></div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex gap-4 px-2">
                <div className="min-w-[200px] h-20 bg-neutral-100 rounded-xl animate-pulse"></div>
                <div className="min-w-[200px] h-20 bg-neutral-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Topic Content Selector */}
      <motion.div
        className="mb-6 lg:mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <TopicContentSelector
          activeContent={activeContent}
          onContentChange={handleContentChange}
          counts={contentCounts}
        />
      </motion.div>

      {/* Dynamic Content Based on Selected Tab */}
      {activeContent === 'lectures' && (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Video Lectures</h3>
        
        {videos.length === 0 ? (
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
            <FaVideo className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-neutral-600 text-sm sm:text-base">No video lectures available for this topic</p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video, videoIndex) => {
              const statusInfo = getVideoStatusInfo(video);
              
              return (
                <motion.div
                  key={video.course_video_id}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleVideoClick(video.course_video_id)}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="flex items-center justify-between">
                    {/* Left section: Video Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-medium text-neutral-900 mb-1 truncate">
                        Lecture {videoIndex + 1}: {video.video_name}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        {video.duration_seconds ? formatDurationFromSeconds(video.duration_seconds, 'compact') : '10 Mins'}
                      </p>
                    </div>
                    
                    {/* Right section: Status Pill + Lock/Unlock Icon + Navigation Arrow */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <VideoStatusBadge status={statusInfo.status} />
                      
                      {/* Lock/Unlock Icon */}
                      <div className="flex-shrink-0">
                        {statusInfo.isLocked ? (
                          <FaLock className={`w-4 h-4 sm:w-5 sm:h-5 ${statusInfo.iconColor}`} />
                        ) : (
                          <FaUnlock className={`w-4 h-4 sm:w-5 sm:h-5 ${statusInfo.iconColor}`} />
                        )}
                      </div>
                      
                      <div className="p-1.5 sm:p-2 rounded-[10px] bg-primary-800 text-white">
                        <FaChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
      )}

      {/* Materials Section */}
      {activeContent === 'materials' && (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Materials</h3>
        
        {/* TODO: Implement materials API and uncomment when documents are available */}
        <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
          <FaFileAlt className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-neutral-600 text-sm sm:text-base">Materials for this topic will be displayed here</p>
        </div>
        </motion.div>
      )}

      {/* Assignments Section */}
      {activeContent === 'assignments' && (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Assignments</h3>
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
          <FaClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-neutral-600 text-sm sm:text-base">Assignments for this topic will be displayed here</p>
        </div>
        </motion.div>
      )}

      {/* Quizzes Section */}
      {activeContent === 'quizzes' && (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Quizzes</h3>
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
            <FaQuestionCircle className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-neutral-600 text-sm sm:text-base">Quizzes for this topic will be displayed here</p>
          </div>
        </motion.div>
      )}

      {/* Live Classes Section */}
      {activeContent === 'live-classes' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Live Classes</h3>
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
            <FaVideo className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-neutral-600 text-sm sm:text-base">Live classes for this topic will be displayed here</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TopicComponent;
