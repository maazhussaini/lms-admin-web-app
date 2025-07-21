import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import { CourseDetailsData } from '@/pages/CourseDetailsPage/mockData';

/**
 * Props for the CourseDetailComponent
 */
interface CourseDetailComponentProps {
  /** Course details data */
  courseDetails: CourseDetailsData;
  /** Course ID for navigation */
  courseId: string;
}

/**
 * CourseDetailComponent - Displays course description and modules list
 * 
 * This component shows:
 * - Course name and description with expandable text
 * - Grid of modules that can be clicked to navigate to module details
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const CourseDetailComponent: React.FC<CourseDetailComponentProps> = ({
  courseDetails,
  courseId
}) => {
  const navigate = useNavigate();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Navigate to module details
  const handleModuleClick = (moduleId: number) => {
    navigate(`/courses/${courseId}/modules/${moduleId}`);
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

  return (
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
              onClick={() => handleModuleClick(module.course_module_id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Module {moduleIndex + 1}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-2">
                    {module.course_module_name || `Module ${moduleIndex + 1}`}
                  </p>
                  <p className="text-neutral-500 text-xs">
                    {module.topics?.length || 0} Topics | {
                      module.topics?.reduce((total, topic) => 
                        total + (topic.videos?.length || 0), 0
                      )
                    } Video Lectures
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center">
                    <FaChevronRight className="text-white text-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CourseDetailComponent;
