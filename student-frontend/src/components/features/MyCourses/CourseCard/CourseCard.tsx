import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import type { Course, StudentCourseProgress } from '@shared/types';

/**
 * Props for the CourseCard component
 */
export interface CourseCardProps {
  /**
   * Course data from the API
   */
  course: Course;
  
  /**
   * Optional progress data for the student
   */
  progress?: StudentCourseProgress;
  
  /**
   * Instructor information (temporary until proper instructor data is available)
   */
  instructor?: {
    name: string;
    title: string;
    avatar_url?: string;
  };
  
  /**
   * Program/specialization name for display
   */
  programName?: string;
  
  /**
   * Whether the course is free or paid
   */
  isFree?: boolean;
  
  /**
   * Click handler for the card
   */
  onClick?: (courseId: number) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * CourseCard - Displays course information in a card format
 * 
 * Security: This component displays course data and should only show courses
 * that the authenticated student has permission to view.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const CourseCard: React.FC<CourseCardProps> = ({
  course,
  progress,
  instructor = {
    name: 'Chris Evans',
    title: 'CS Professor',
    avatar_url: undefined
  },
  programName,
  isFree = true,
  onClick,
  className = '',
  loading = false
}) => {
  /**
   * Handle card click
   */
  const handleClick = () => {
    if (onClick && !loading) {
      onClick(course.course_id);
    }
  };

  /**
   * Format duration for display to match design exactly
   */
  const formatDuration = (hours?: number | null): string => {
    if (!hours) return 'Duration TBD';
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes} Min`;
    }
    
    if (minutes === 0) {
      return `${wholeHours} Hrs`;
    }
    
    return `${wholeHours} Hrs ${minutes} Min`;
  };

  /**
   * Get instructor avatar or default placeholder
   */
  const getInstructorAvatar = (): string => {
    if (instructor.avatar_url) {
      return instructor.avatar_url;
    }
    
    // Generate a placeholder avatar based on instructor name using API service with pink background to match design
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=ffc0cb&color=fff&bold=true&format=svg`;
  };

  if (loading) {
    return (
      <Card className={`animate-pulse rounded-[30px] ${className}`}>
        <div className="p-2 sm:p-3 space-y-2">
          {/* Instructor info skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 bg-neutral-200 rounded-full animate-pulse"></div>
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-24"></div>
              <div className="h-3 bg-neutral-100 rounded animate-pulse w-16"></div>
            </div>
          </div>
          
          {/* Course info skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-neutral-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-neutral-100 rounded animate-pulse w-1/2"></div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 bg-neutral-100 rounded animate-pulse w-16"></div>
              <div className="h-6 bg-neutral-100 rounded-full animate-pulse w-12"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={className}
    >
      <Card
        className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white border border-neutral-100 overflow-hidden rounded-[30px]"
        onClick={handleClick}
      >
        <div className="p-1 sm:p-2 space-y-2 h-full flex flex-col">
          {/* Instructor Information */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={getInstructorAvatar()}
                alt={`${instructor.name} avatar`}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to a simple colored circle with initials
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const initials = instructor.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase();
                    parent.innerHTML = `
                      <div class="w-16 h-16 rounded-full bg-[#ffc0cb] flex items-center justify-center text-white font-semibold text-lg">
                        ${initials}
                      </div>
                    `;
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-regular text-[#43277e] truncate">
                {instructor.name}
              </h3>
              <p className="text-xs text-[#737373] truncate">
                {instructor.title}
              </p>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-2 flex-1">
            {/* Course Title - Exactly match the purple color from the design */}
            <h2 className="text-base sm:text-lg font-regular text-[#43277e] leading-tight">
              {course.course_name}
            </h2>

            {/* Program/Category */}
            {programName && (
              <p className="text-xs font-regular text-[#43277e]">
                {programName}
              </p>
            )}

            {/* Bottom Row: Duration and Price/Status */}
            <div className="flex items-center justify-between pt-2 mt-auto">
              <span className="text-xs text-[#737373] font-regular">
                {formatDuration(course.course_total_hours)}
              </span>
              
              <Badge
                color={isFree ? 'info' : 'warning'}
                size="md"
                className="px-3 py-1 text-xs font-medium"
              >
                {isFree ? 'Free' : 'Paid'}
              </Badge>
            </div>

            {/* Progress Bar (if enrolled and has progress) */}
            {/* {progress && progress.overall_progress_percentage > 0 && (
              <div className="space-y-2 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-neutral-600">Progress</span>
                  <span className="text-base font-semibold text-[#7040e6]">
                    {Math.round(progress.overall_progress_percentage)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div
                    className="bg-[#7040e6] h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress.overall_progress_percentage}%` }}
                  />
                </div>
              </div>
            )} */}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
