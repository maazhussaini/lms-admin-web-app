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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Topic Header */}
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-4xl font-medium text-primary-900 mb-4">
          {currentTopic.course_topic_name}
        </h2>
        <p className="text-neutral-600 leading-relaxed">
          Topic description will be displayed here when available.
        </p>
      </motion.div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Topic Content Selector */}
      <motion.div
        className="mb-8"
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
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-3xl font-medium text-primary-900 mb-6">Video Lectures</h3>
        
        <div className="space-y-3">
          {currentTopic.videos?.map((video, videoIndex) => (
            <motion.div
              key={video.course_video_id}
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => !video.is_locked && handleVideoClick(video.course_video_id)}
              whileHover={!video.is_locked ? { scale: 1.01 } : {}}
              whileTap={!video.is_locked ? { scale: 0.99 } : {}}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {video.is_locked ? (
                    <FaLock className="text-neutral-400 w-5 h-5" />
                  ) : (
                    <FaPlayCircle className="text-primary-600 w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-medium mb-1 ${
                    video.is_locked ? 'text-neutral-400' : 'text-neutral-900'
                  }`}>
                    Lecture {videoIndex + 1}: {video.video_name}
                  </h4>
                  {video.duration_seconds && (
                    <p className="text-sm text-neutral-500">
                      Duration: {formatDuration(video.duration_seconds)}
                    </p>
                  )}
                </div>

                {video.is_locked && (
                  <Badge color="warning" size="sm">
                    Locked
                  </Badge>
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
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-3xl font-medium text-primary-900 mb-6">Materials</h3>
        
        {currentTopic.documents && currentTopic.documents.length > 0 ? (
          <div className="space-y-3">
            {currentTopic.documents.map((document) => (
              <motion.div
                key={document.course_document_id}
                className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <FaFileAlt className="text-neutral-500 w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-neutral-900 mb-1">
                      {document.document_name}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      Document • Click to download
                    </p>
                  </div>
                  <FaDownload className="text-neutral-400 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-xl p-6 text-center">
            <FaFileAlt className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">No materials available for this topic</p>
          </div>
        )}
        </motion.div>
      )}

      {/* Assignments Section */}
      {activeContent === 'assignments' && (
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-3xl font-medium text-primary-900 mb-6">Assignments</h3>
          <div className="bg-neutral-50 rounded-xl p-6 text-center">
          <FaClipboardList className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">Assignments for this topic will be displayed here</p>
        </div>
        </motion.div>
      )}

      {/* Quizzes Section */}
      {activeContent === 'quizzes' && (
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-3xl font-medium text-primary-900 mb-6">Quizzes</h3>
          <div className="bg-neutral-50 rounded-xl p-6 text-center">
            <FaQuestionCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">Quizzes for this topic will be displayed here</p>
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
          <h3 className="text-3xl font-medium text-primary-900 mb-6">Live Classes</h3>
          <div className="bg-neutral-50 rounded-xl p-6 text-center">
            <FaVideo className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">Live classes for this topic will be displayed here</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TopicComponent;
