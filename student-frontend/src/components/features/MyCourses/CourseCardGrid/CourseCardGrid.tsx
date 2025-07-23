import React from 'react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/features/MyCourses/CourseCard';
import Spinner from '@/components/common/Spinner';
import type { StudentCourseProgress } from '@shared/types/course.types';

// Extended Course type for UI display
type ExtendedCourse = {
  course_id: number;
  course_name: string;
  course_description: string;
  main_thumbnail_url: string | null;
  course_total_hours: number;
  teacher_name?: string;
  teacher_qualification?: string | null;
  purchase_status?: string;
  is_purchased?: boolean;
  program_name?: string;
  profile_picture_url?: string | null;
  start_date?: string;
  end_date?: string;
  course_type: 'FREE' | 'PAID';
  course_price: number;
  specialization_id: number;
};

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
  activeTab: 'all' | 'enrolled' | 'unenrolled';
  
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
  /**
   * Get progress data for a specific course
   */
  const getProgressForCourse = (courseId: number): StudentCourseProgress | undefined => {
    return progressData.find(progress => progress.course_id === courseId);
  };

  /**
   * Convert ExtendedCourse to Course type for CourseCard
   */
  const convertToCourse = (extendedCourse: ExtendedCourse) => ({
    course_id: extendedCourse.course_id,
    course_name: extendedCourse.course_name,
    course_description: extendedCourse.course_description,
    main_thumbnail_url: extendedCourse.main_thumbnail_url,
    course_total_hours: extendedCourse.course_total_hours,
    course_type: extendedCourse.course_type,
    course_price: extendedCourse.course_price,
    specialization_id: extendedCourse.specialization_id,
    course_status: 'PUBLIC' as const,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  });

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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
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
          const progress = getProgressForCourse(course.course_id);
          
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
                course={convertToCourse(course)}
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
