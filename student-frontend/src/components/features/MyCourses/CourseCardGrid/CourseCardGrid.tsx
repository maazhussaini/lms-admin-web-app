import React from 'react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/features/MyCourses/CourseCard';
import Spinner from '@/components/common/Spinner';
import type { StudentCourseProgress } from '@shared/types/course.types';
import type { ExtendedCourse, CourseTab } from '@/types/course.ui.types';
import { getProgressForCourse } from '@/utils/courseDataTransformers';
import { GRID_LAYOUTS } from '@/constants/courseUI.constants';

export interface CourseCardGridProps {
  /**
   * Array of courses to display
   */
  courses: ExtendedCourse[];
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Progress data for enrolled courses
   */
  progressData?: StudentCourseProgress[];
  
  /**
   * Course click handler
   */
  onCourseClick: (courseId: number) => void;
  
  /**
   * Currently active tab (affects how courses are displayed)
   */
  activeTab: CourseTab;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * CourseCardGrid - Displays courses in a responsive grid layout
 * 
 * This component renders a grid of course cards with proper loading states
 * and responsive design. It handles different display modes based on the
 * active tab (all, enrolled, unenrolled).
 * 
 * Security: Only displays courses that the authenticated user has access to.
 */
const CourseCardGrid: React.FC<CourseCardGridProps> = ({
  courses,
  loading = false,
  progressData = [],
  onCourseClick,
  activeTab,
  className = ''
}) => {
  // Use shared utility function for progress lookup
  const getCourseProgress = (courseId: number): StudentCourseProgress | undefined => {
    return getProgressForCourse(courseId, progressData);
  };

  if (loading) {
    return (
      <div className={`flex justify-center py-12 ${className}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h3 className="text-xl font-medium text-gray-900 mb-4">No courses found</h3>
        <p className="text-gray-600">
          {activeTab === 'enrolled' && 'You are not enrolled in any courses yet.'}
          {activeTab === 'unenrolled' && 'No available courses to enroll in.'}
          {activeTab === 'all' && 'No courses available at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium text-gray-900">
          {activeTab === 'enrolled' && 'Enrolled Courses'}
          {activeTab === 'unenrolled' && 'Available Courses'}
          {activeTab === 'all' && 'All Courses'}
        </h2>
        <span className="text-sm text-gray-500">
          {courses.length} course{courses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Course Grid */}
      <motion.div
        className={GRID_LAYOUTS.COURSES}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {courses.map((course) => {
          const progress = getCourseProgress(course.course_id);
          
          return (
            <motion.div
              key={course.course_id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <CourseCard
                course={course}
                progress={progress}
                instructor={{
                  name: course.teacher_name || 'Unknown Instructor',
                  title: course.teacher_qualification || 'Instructor',
                  avatar_url: course.profile_picture_url || undefined
                }}
                programName={course.program_name}
                isFree={course.course_type === 'FREE'}
                purchaseStatusText={course.purchase_status}
                showProgress={activeTab === 'enrolled' && !!progress}
                startDate={course.start_date}
                endDate={course.end_date}
                onClick={onCourseClick}
                className="h-full"
              />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default CourseCardGrid;
