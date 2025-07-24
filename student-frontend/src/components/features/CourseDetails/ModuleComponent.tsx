import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaClipboardList, FaQuestionCircle } from 'react-icons/fa';
import { CourseBasicDetails } from '@/services/courseService';
import { useModuleTopics, useCourseModules } from '@/hooks/useCourse';
import { ModuleContentSelector, ModuleContentType } from './ModuleContentSelector';
import { ModuleSelector } from './ModuleSelector';
import Breadcrumb, { BreadcrumbItem } from '@/components/common/Breadcrumb';

/**
 * Props for the ModuleComponent
 */
interface ModuleComponentProps {
  /** Course details data */
  courseDetails: CourseBasicDetails;
  /** Module ID */
  moduleId: number;
}

/**
 * ModuleComponent - Displays module details including topics, assignments, and quizzes
 * 
 * This component shows:
 * - Module information and description
 * - Topics list that can be clicked to navigate to topic details
 * - Assignments list (future implementation)
 * - Quizzes list (future implementation)
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const ModuleComponent: React.FC<ModuleComponentProps> = ({
  courseDetails,
  moduleId
}) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeContent, setActiveContent] = useState<ModuleContentType>('topics');

  // Parse courseId from string to number for API calls
  const courseIdNumber = courseId ? parseInt(courseId, 10) : 0;

  // Fetch topics for this module using the API
  const { data: topicsData, loading: topicsLoading, error: topicsError } = useModuleTopics(moduleId);
  
  // Fetch all course modules for the module selector
  const { data: modulesData, loading: modulesLoading, error: modulesError } = useCourseModules(courseIdNumber);

  // Get topics and modules from API responses
  const topics = topicsData?.items || [];
  const modules = modulesData?.items || [];

  // Find the current module from the modules array
  const currentModule = modules.find(module => module.course_module_id === moduleId) || {
    course_module_id: moduleId,
    course_module_name: `Module ${moduleId}`, // Fallback if module not found
    course_module_description: ''
  };

  // Navigate to topic details
  const handleTopicClick = (topicId: number) => {
    navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}`);
  };

  // Handle module selection from ModuleSelector
  const handleModuleSelect = (selectedModuleId: number) => {
    navigate(`/courses/${courseId}/modules/${selectedModuleId}`);
  };

  // Handle content type change
  const handleContentChange = (contentType: ModuleContentType) => {
    setActiveContent(contentType);
  };

  // Calculate content counts
  const contentCounts = {
    topics: topics.length,
    assignments: 0, // TODO: Add assignments count when implemented
    quizzes: 0      // TODO: Add quizzes count when implemented
  };

  // Loading state for topics or modules - only show spinner if BOTH are loading
  if (topicsLoading && modulesLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
          <span className="ml-2 text-neutral-600">Loading module...</span>
        </div>
      </div>
    );
  }

  // Error state for topics or modules
  if (topicsError || modulesError) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error loading module
          </h2>
          <p className="text-neutral-600">
            {topicsError?.message || modulesError?.message || 'Failed to load module data.'}
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
      isActive: true
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Breadcrumb Navigation - Moved to top for better mobile UX */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Module Header */}
      <motion.div
        className="mb-6 lg:mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-primary-900 mb-3 lg:mb-4 leading-tight">
          {currentModule.course_module_name || `Module ${moduleId}`}
        </h2>
        <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
          Module description will be displayed here when available.
        </p>
      </motion.div>

      {/* Module Selector for Navigation - Always show */}
      {!modulesLoading ? (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <ModuleSelector
            modules={modules}
            currentModuleId={moduleId}
            onModuleSelect={handleModuleSelect}
          />
        </motion.div>
      ) : (
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <div className="w-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-lg font-semibold text-primary-900">Course Modules</h3>
              <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse"></div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex gap-4 px-2">
                <div className="min-w-[200px] h-20 bg-neutral-100 rounded-xl animate-pulse"></div>
                <div className="min-w-[200px] h-20 bg-neutral-100 rounded-xl animate-pulse"></div>
                <div className="min-w-[200px] h-20 bg-neutral-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Module Content Selector */}
      <motion.div
        className="mb-6 lg:mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ModuleContentSelector
          activeContent={activeContent}
          onContentChange={handleContentChange}
          counts={contentCounts}
        />
      </motion.div>

      {/* Dynamic Content Based on Selected Tab */}
      {activeContent === 'topics' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Topics</h3>
          
          {topics.length === 0 ? (
            <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
              <p className="text-neutral-600 text-sm sm:text-base">No topics available for this module</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {topics.map((topic, topicIndex) => (
                <motion.div
                  key={topic.course_topic_id}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTopicClick(topic.course_topic_id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2 truncate">
                        Topic {topicIndex + 1}
                      </h4>
                      <p className="text-neutral-600 text-sm mb-2 line-clamp-2">
                        {topic.course_topic_name}
                      </p>
                      <p className="text-neutral-500 text-xs">
                        Click to view videos and materials
                      </p>
                    </div>
                    <div className="ml-3 sm:ml-4 flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-800 rounded-full flex items-center justify-center">
                        <FaChevronRight className="text-white text-xs sm:text-sm" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Assignments Section */}
      {activeContent === 'assignments' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Assignments</h3>
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
            <FaClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-neutral-600 text-sm sm:text-base">Assignments for this module will be displayed here</p>
          </div>
        </motion.div>
      )}

      {/* Quizzes Section */}
      {activeContent === 'quizzes' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-medium text-primary-900 mb-4 sm:mb-6">Quizzes</h3>
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 text-center">
            <FaQuestionCircle className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-neutral-600 text-sm sm:text-base">Quizzes for this module will be displayed here</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ModuleComponent;
