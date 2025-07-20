import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLock,
  FaChevronDown,
  FaPlayCircle,
  FaFileAlt,
  FaDownload
} from 'react-icons/fa';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import { CourseDetailsBanner } from '@/components/features/CourseDetailsBanner';
import { CourseDetailsData, getMockCourseDetails } from './mockData';

/**
 * CourseDetailsPage - Comprehensive course details view for students
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * Displays detailed course information, modules, progress tracking, and content access.
 */
export const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // For now, disable API calls and use mock data only
  // This prevents the "undefined" courseId issue while we're in development
  const loading = false;

  // Use mock data for development/demo purposes
  const courseDetails: CourseDetailsData | null = courseId ? getMockCourseDetails(parseInt(courseId)) : null;

  // Handle module expansion
  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Navigate to video player
  const handleVideoClick = (moduleId: number, topicId: number, videoId: number) => {
    navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}/videos/${videoId}`);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/courses');
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

  // Truncate description text
  const truncateText = (text: string, maxLength: number = 300): { truncated: string; isTruncated: boolean } => {
    if (text.length <= maxLength) {
      return { truncated: text, isTruncated: false };
    }
    return { 
      truncated: text.substring(0, maxLength) + '...', 
      isTruncated: true 
    };
  };

  // Handle description expansion
  const handleReadMore = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (!courseDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Course not found
          </h2>
          <p className="text-neutral-600 mb-4">
            The requested course could not be found.
          </p>
          <Button onClick={() => navigate('/courses')}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-page-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Course Details Banner */}
      <CourseDetailsBanner
        courseDetails={courseDetails}
        onBack={handleBack}
        onFeedback={() => {
          // TODO: Implement feedback functionality
          console.log('Feedback button clicked');
        }}
      />

      <div className="bg-white -mt-2 relative z-10 rounded-b-3xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Description Section */}
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-4xl font-medium text-primary-900 mb-4">
            {courseDetails.course_name}
          </h2>
          <div className="text-neutral-600 leading-relaxed mb-4">
            {(() => {
              const description = courseDetails.course_description || '';
              const { truncated, isTruncated } = truncateText(description, 300);
              
              return (
                <>
                  <p className="mb-4">
                    {isDescriptionExpanded ? description : truncated}
                  </p>
                  {isTruncated && (
                    <button 
                      onClick={handleReadMore}
                      className="text-primary-900 hover:text-primary-900 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                    >
                      {isDescriptionExpanded ? 'Read Less ←' : 'Read More →'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </motion.div>

        {/* Modules Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-medium text-primary-900 mb-6">Modules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseDetails.modules?.map((module, moduleIndex) => (
              <motion.div
                key={module.course_module_id}
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleModule(module.course_module_id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Module {moduleIndex + 1}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {module.topics?.length || 0} Topics | {
                        module.topics?.reduce((total, topic) => 
                          total + (topic.videos?.length || 0), 0
                        )
                      } Video Lectures
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <FaChevronDown className="text-white text-sm" />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedModules.has(module.course_module_id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-neutral-200"
                    >
                      <div className="space-y-3">
                        {module.topics?.map((topic) => (
                          <div key={topic.course_topic_id} className="space-y-2">
                            <h4 className="font-medium text-neutral-800 text-sm">
                              {topic.course_topic_name}
                            </h4>
                            
                            {/* Videos */}
                            {topic.videos?.map((video) => (
                              <div 
                                key={video.course_video_id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVideoClick(
                                    module.course_module_id, 
                                    topic.course_topic_id, 
                                    video.course_video_id
                                  );
                                }}
                              >
                                <div className="relative">
                                  {video.is_locked ? (
                                    <FaLock className="text-neutral-400 w-4 h-4" />
                                  ) : (
                                    <FaPlayCircle className="text-primary-600 w-4 h-4 group-hover:text-primary-700" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm truncate ${
                                    video.is_locked ? 'text-neutral-400' : 'text-neutral-700 group-hover:text-neutral-900'
                                  }`}>
                                    {video.video_name}
                                  </p>
                                  {video.duration_seconds && (
                                    <p className="text-xs text-neutral-500">
                                      {formatDuration(video.duration_seconds)}
                                    </p>
                                  )}
                                </div>

                                {video.is_locked && (
                                  <Badge color="warning" size="sm">
                                    Locked
                                  </Badge>
                                )}
                              </div>
                            ))}

                            {/* Documents */}
                            {topic.documents?.map((document) => (
                              <div 
                                key={document.course_document_id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaFileAlt className="text-neutral-500 w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-neutral-700 group-hover:text-neutral-900 truncate">
                                    {document.document_name}
                                  </p>
                                </div>
                                <FaDownload className="text-neutral-400 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
