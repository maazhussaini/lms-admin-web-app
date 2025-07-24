import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { CourseDetailsBanner } from '@/components/features/CourseDetails/CourseDetailsBanner';
import { CourseDetailComponent } from '@/components/features/CourseDetails';
import { ModuleComponent } from '@/components/features/CourseDetails/ModuleComponent';
import { TopicComponent } from '@/components/features/CourseDetails/TopicComponent';
import { useCourseBasicDetails } from '@/hooks/useCourse';

/**
 * CourseDetailsPage - Container component for complete course details flow
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * Acts as a container that renders different components based on the route parameters:
 * - /courses/:courseId -> CourseDetailComponent (modules list with API integration)
 * - /courses/:courseId/modules/:moduleId -> ModuleComponent (topics list with API integration)
 * - /courses/:courseId/modules/:moduleId/topics/:topicId -> TopicComponent (video lectures with API integration)
 * 
 * All components use real API calls via custom hooks from useCourse.ts:
 * - useCourseBasicDetails for course information
 * - useCourseModules for modules list
 * - useModuleTopics for topics list  
 * - useTopicVideos for video lectures
 */
export const CourseDetailsPage: React.FC = () => {
  const { courseId, moduleId, topicId } = useParams<{ 
    courseId: string; 
    moduleId?: string; 
    topicId?: string; 
  }>();
  const navigate = useNavigate();

  // Parse courseId to number for API call
  const courseIdNum = courseId ? parseInt(courseId) : 0;

  // Fetch course basic details using API
  const { data: courseDetails, loading, error } = useCourseBasicDetails(courseIdNum);

  // Handle back navigation
  const handleBack = () => {
    navigate('/courses');
  };

  // Determine which component to render based on route parameters
  const renderContent = () => {
    if (!courseDetails || !courseId) return null;

    // Convert string parameters to numbers if they exist
    const moduleIdNum = moduleId ? parseInt(moduleId) : undefined;
    const topicIdNum = topicId ? parseInt(topicId) : undefined;

    // Route: /courses/:courseId/modules/:moduleId/topics/:topicId
    if (moduleIdNum && topicIdNum) {
      return (
        <TopicComponent
          courseDetails={courseDetails}
          moduleId={moduleIdNum}
          topicId={topicIdNum}
        />
      );
    }

    // Route: /courses/:courseId/modules/:moduleId
    if (moduleIdNum) {
      return (
        <ModuleComponent
          courseDetails={courseDetails}
          moduleId={moduleIdNum}
        />
      );
    }

    // Route: /courses/:courseId (default - show modules list)
    return (
      <CourseDetailComponent 
        courseDetails={courseDetails}
      />
    );
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
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Error loading course
          </h2>
          <p className="text-neutral-600 mb-4">
            {error.message || 'An error occurred while loading the course details.'}
          </p>
          <Button onClick={() => navigate('/courses')}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  // Error state - course not found
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
      {/* Course Details Banner - Always displayed at the top */}
      <CourseDetailsBanner
        courseDetails={courseDetails}
        onBack={handleBack}
        onFeedback={() => {
          // TODO: Implement feedback functionality
          console.log('Feedback button clicked');
        }}
      />

      {/* Main Content Area - Renders different components based on route */}
      <div className="bg-white -mt-2 relative z-10 rounded-b-3xl">
        {renderContent()}
      </div>
    </motion.div>
  );
};
