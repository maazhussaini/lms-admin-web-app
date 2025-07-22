import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { CourseDetailsBanner } from '@/components/features/CourseDetails/CourseDetailsBanner';
import { 
  CourseDetailComponent, 
  ModuleComponent, 
  TopicComponent 
} from '@/components/features/CourseDetails';
import { CourseDetailsData, getMockCourseDetails } from './mockData';

/**
 * CourseDetailsPage - Container component for course details flow
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * Acts as a container that renders different components based on the route parameters:
 * - /courses/:courseId -> CourseDetailComponent (modules list)
 * - /courses/:courseId/modules/:moduleId -> ModuleComponent (topics, assignments, quizzes)
 * - /courses/:courseId/modules/:moduleId/topics/:topicId -> TopicComponent (lectures, materials, etc.)
 */
export const CourseDetailsPage: React.FC = () => {
  const { courseId, moduleId, topicId } = useParams<{ 
    courseId: string; 
    moduleId?: string; 
    topicId?: string; 
  }>();
  const navigate = useNavigate();

  // For now, disable API calls and use mock data only
  // This prevents the "undefined" courseId issue while we're in development
  const loading = false;

  // Use mock data for development/demo purposes
  const courseDetails: CourseDetailsData | null = courseId ? getMockCourseDetails(parseInt(courseId)) : null;

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
        courseId={courseId}
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
