import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import type { StudentCourseProgress } from '@shared/types';
import type { ExtendedCourse } from '@/types/course.ui.types';
import { 
  formatCourseDuration, 
  getInstructorAvatarUrl, 
  getProgressBarClass
} from '@/utils/courseUIUtils';
import { DEFAULT_INSTRUCTOR, COURSE_CARD_ANIMATIONS } from '@/constants/courseUI.constants';

/**
 * Props for the CourseCard component
 */
export interface CourseCardProps {
  /**
   * Course data from the API (using ExtendedCourse for UI-specific fields)
   */
  course: ExtendedCourse;
  
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
   * Custom purchase status text to display instead of Free/Paid
   */
  purchaseStatusText?: string;

  /**
   * Whether to show progress bar (typically only for enrolled courses)
   */
  showProgress?: boolean;

  /**
   * Course start date
   */
  startDate?: string;

  /**
   * Course end date
   */
  endDate?: string;

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
  instructor = DEFAULT_INSTRUCTOR,
  programName,
  purchaseStatusText,
  showProgress = false,
  startDate,
  endDate,
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

  // Use shared utility functions instead of local ones
  const instructorAvatar = getInstructorAvatarUrl(instructor.name, instructor.avatar_url);
  
  // Format duration - handle string format from API like "24 hrs"
  const formattedDuration = typeof course.course_total_hours === 'string' 
    ? course.course_total_hours 
    : formatCourseDuration(course.course_total_hours);
  
  // Use purchase_status from API response for display text
  const displayPurchaseStatus = purchaseStatusText || 
    course.purchase_status || 
    (course.is_purchased ? 'Purchased' : (course.is_free ? 'Free' : 'Paid'));
  
  // Determine badge class from purchase_status string
  const getPurchaseStatusClass = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'free') return 'badge-free';
    if (statusLower === 'purchased') return 'badge-purchased';
    return 'badge-buy'; // Default for 'paid', 'buy', or any other value
  };

  const purchaseStatusClass = getPurchaseStatusClass(displayPurchaseStatus);

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
      whileHover={COURSE_CARD_ANIMATIONS.hover}
      whileTap={COURSE_CARD_ANIMATIONS.tap}
      transition={COURSE_CARD_ANIMATIONS.transition}
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
                src={instructorAvatar}
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
              <p className="text-sm font-regular text-[#43277e]">
                {programName}
              </p>
            )}

            {/* Course Date Range */}
            {startDate && endDate && (
              <p className="text-sm text-[#737373] font-regular">
                {startDate} - {endDate}
              </p>
            )}

            {/* Bottom Row: Duration and Price/Status */}
            <div className="flex items-center justify-between pt-2 mt-auto">
              <span className="text-sm text-[#737373] font-regular">
                {formattedDuration}
              </span>
              
              <div
                className={`px-3 py-1 text-sm font-medium rounded-[7px] border ${purchaseStatusClass}`}
              >
                {displayPurchaseStatus}
              </div>
            </div>

            {/* Progress Bar (only show for enrolled courses when showProgress is true) */}
            {showProgress && progress && typeof progress.overall_progress_percentage === 'number' && progress.overall_progress_percentage >= 0 && (
              <div className="space-y-2 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-regular text-neutral-600">Progress</span>
                  <span className="text-sm font-regular text-neutral-600">
                    {Math.round(progress.overall_progress_percentage)}%
                  </span>
                </div>
                <div className="w-full progress-bg rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ease-out ${getProgressBarClass(progress.overall_progress_percentage)}`}
                    style={{ width: `${Math.max(0, progress.overall_progress_percentage)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
