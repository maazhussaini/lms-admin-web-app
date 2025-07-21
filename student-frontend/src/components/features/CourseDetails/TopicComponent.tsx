import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaPlayCircle, 
  FaLock, 
  FaFileAlt, 
  FaDownload, 
  FaClipboardList,
  FaQuestionCircle,
  FaVideo
} from 'react-icons/fa';
import Badge from '@/components/common/Badge';
import { CourseDetailsData } from '@/pages/CourseDetailsPage/mockData';
import { TopicContentSelector, TopicContentType } from './TopicContentSelector';
import { TopicSelector } from './TopicSelector';
import Breadcrumb, { BreadcrumbItem } from '@/components/common/Breadcrumb';

/**
 * Props for the TopicComponent
 */
interface TopicComponentProps {
  /** Course details data */
  courseDetails: CourseDetailsData;
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
  const navigate = useNavigate();
  const [activeContent, setActiveContent] = useState<TopicContentType>('lectures');

  // Find the current module and topic
  const currentModule = courseDetails.modules?.find(
    module => module.course_module_id === moduleId
  );
  const currentTopic = currentModule?.topics?.find(
    topic => topic.course_topic_id === topicId
  );

  // Navigate to video player
  const handleVideoClick = (videoId: number) => {
    navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}/videos/${videoId}`);
  };

  // Navigate to different topic
  const handleTopicSelect = (newTopicId: number) => {
    navigate(`/courses/${courseId}/modules/${moduleId}/topics/${newTopicId}`);
  };

  // Handle content type change
  const handleContentChange = (contentType: TopicContentType) => {
    setActiveContent(contentType);
  };

  // Calculate content counts
  const contentCounts = {
    lectures: currentTopic?.videos?.length || 0,
    liveClasses: 0, // TODO: Add live classes count when implemented
    assignments: 0, // TODO: Add assignments count when implemented
    quizzes: 0,     // TODO: Add quizzes count when implemented
    materials: currentTopic?.documents?.length || 0
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!currentTopic) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Topic not found
          </h2>
          <p className="text-neutral-600">
            The requested topic could not be found.
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
      label: currentModule?.course_module_name || `Module ${moduleId}`,
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
        <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
          Topic description will be displayed here when available.
        </p>
      </motion.div>

      {/* Topic Selector for Navigation */}
      <motion.div
        className="mb-6 lg:mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
      >
        <TopicSelector
          courseDetails={courseDetails}
          moduleId={moduleId}
          currentTopicId={topicId}
          onTopicSelect={handleTopicSelect}
        />
      </motion.div>

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
        
        <div className="space-y-3">
          {currentTopic.videos?.map((video, videoIndex) => (
            <motion.div
              key={video.course_video_id}
              className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => !video.is_locked && handleVideoClick(video.course_video_id)}
              whileHover={!video.is_locked ? { scale: 1.01 } : {}}
              whileTap={!video.is_locked ? { scale: 0.99 } : {}}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  {video.is_locked ? (
                    <FaLock className="text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <FaPlayCircle className="text-primary-800 w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-base sm:text-lg font-medium mb-1 line-clamp-2 ${
                    video.is_locked ? 'text-neutral-400' : 'text-neutral-900'
                  }`}>
                    Lecture {videoIndex + 1}: {video.video_name}
                  </h4>
                  {video.duration_seconds && (
                    <p className="text-xs sm:text-sm text-neutral-500">
                      Duration: {formatDuration(video.duration_seconds)}
                    </p>
                  )}
                </div>

                {video.is_locked && (
                  <div className="flex-shrink-0">
                    <Badge color="warning" size="sm">
                      Locked
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
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
        
        {currentTopic.documents && currentTopic.documents.length > 0 ? (
          <div className="space-y-3">
            {currentTopic.documents.map((document) => (
              <motion.div
                key={document.course_document_id}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <FaFileAlt className="text-neutral-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-medium text-neutral-900 mb-1 line-clamp-2">
                      {document.document_name}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-500">
                      Document • Click to download
                    </p>
                  </div>
                  <FaDownload className="text-neutral-400 w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
            <FaFileAlt className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-neutral-600 text-sm sm:text-base">No materials available for this topic</p>
          </div>
        )}
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
