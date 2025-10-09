import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCommentDots } from 'react-icons/fa';
import Button from '@/components/common/Button/Button';
import { CourseBasicDetails } from '@/services/courseService';
import courseDetailsBanner from '@/assets/images/course_details_banner.png';

/**
 * Props for the CourseDetailsBanner component
 */
interface CourseDetailsBannerProps {
  /** Course details data */
  courseDetails: CourseBasicDetails;
  /** Callback function for back navigation */
  onBack: () => void;
  /** Callback function for feedback action */
  onFeedback?: () => void;
}

/**
 * CourseDetailsBanner - Hero banner component for course details page
 * 
 * Features:
 * - Animated background with course banner image
 * - Instructor profile with avatar
 * - Course information display
 * - Progress tracking visualization
 * - Interactive navigation buttons
 * - Pixel-perfect design with curved corners and glass-morphism effects
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const CourseDetailsBanner: React.FC<CourseDetailsBannerProps> = ({
  courseDetails,
  onBack,
  onFeedback
}) => {
  const progressPercentage = courseDetails.overall_progress_percentage || 0;
  const instructorName = courseDetails.teacher_name || 'Unknown Instructor';

  // Format course duration dates from API response (start_date, end_date)
  const startDate = new Date(courseDetails.start_date);
  const endDate = new Date(courseDetails.end_date);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const courseDuration = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  // Determine course type from purchase status and payment info
  const getCourseType = () => {
    if (courseDetails.is_free) return 'FREE';
    if (courseDetails.is_purchased) return 'PURCHASED';
    return 'PAID';
  };
  const courseType = getCourseType();

  /**
   * Get purchase status badge CSS class based on course type
   */
  const getPurchaseStatusClass = () => {
    if (courseType === 'PURCHASED') {
      return 'badge-purchased';
    }
    
    if (courseType === 'PAID') {
      return 'badge-buy';
    }
    
    // FREE or default
    return 'badge-free';
  };

  /**
   * Get progress bar CSS class based on completion percentage
   */
  const getProgressBarClass = (percentage: number) => {
    if (percentage <= 0) {
      return 'progress-neutral';
    } else if (percentage >= 100) {
      return 'progress-complete';
    } else {
      return 'progress-active';
    }
  };

  return (
    <motion.div
      className="relative w-full min-h-[150px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px] laptop:min-h-[220px] overflow-hidden rounded-t-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${courseDetailsBanner})`
        }}
      >
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Top Navigation with Full Content */}
      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="ghost"
            size="lg"
            shape="rounded"
            aria-label="Go back"
            className="
              w-9 h-9
              sm:w-10 sm:h-10
              md:w-11 md:h-11
              lg:w-14 lg:h-14
              bg-white shadow-sm flex-shrink-0
            "
          >
            <FaArrowLeft className="text-base sm:text-lg md:text-xl" style={{ color: '#63747D' }} />
          </Button>

            {/* Main Content - Between Buttons */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 sm:gap-4">
              
            {/* Instructor Avatar */}
            <motion.div
              className="flex-shrink-0 hidden sm:block"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 laptop:w-20 laptop:h-20 xl:w-28 xl:h-28 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 overflow-hidden">
                {courseDetails.profile_picture_url ? (
                  <img
                    src={courseDetails.profile_picture_url}
                    alt={instructorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs sm:text-sm md:text-base lg:text-lg laptop:text-base xl:text-xl font-regular">
                    {instructorName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Course Information */}
            <motion.div
              className="flex-1 text-white min-w-0"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >

            {/* Course Title */}
            <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl laptop:text-2xl xl:text-4xl font-regular leading-tight mb-1 sm:mb-2">
              {courseDetails.course_name}
            </h1>

            {/* Course Subtitle/Category */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg laptop:text-base xl:text-xl text-primary-100 font-regular mb-1 sm:mb-2">
              Machine Learning, Data Science
            </p>

            {/* Course Duration and Instructor */}
            <div className="flex flex-col text-primary-200 mb-2 sm:mb-3 text-[10px] sm:text-xs md:text-sm lg:text-base laptop:text-sm xl:text-lg font-regular">
              <span>{courseDuration}</span>
              <span>{instructorName}</span>
            </div>

              {/* Progress Bar */}
              <div className="max-w-6xl w-full">
                <div className="w-full h-1 sm:h-1.5 md:h-2 laptop:h-1.5 progress-bg rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${getProgressBarClass(progressPercentage)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  />
                </div>
                {/* Progress Labels */}
                <div className="flex justify-between mt-0.5 text-[9px] sm:text-xs md:text-sm laptop:text-xs text-primary-100">
                  <span>0%</span>
                  <span className="text-white font-medium">{progressPercentage}%</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side - Feedback Button and Badge Column */}
        <div className="flex flex-col items-end gap-2 sm:gap-3">
          {/* Feedback Button */}
          <Button
            onClick={onFeedback}
            variant="ghost"
            size="lg"
            shape="rounded"
            aria-label="Send feedback"
            className="
              w-9 h-9
              sm:w-8 sm:h-8
              md:w-11 md:h-11
              lg:w-14 lg:h-14
              bg-white shadow-sm flex-shrink-0
            "
          >
            <FaCommentDots className="text-base sm:text-lg md:text-xl" style={{ color: '#63747D' }} />
          </Button>

            {/* Course Type Badge */}
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-2 py-1 sm:px-3 md:px-4 lg:px-6 rounded-md text-xs sm:text-sm md:text-base font-medium shadow-sm border ${getPurchaseStatusClass()}`}>
                {courseType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailsBanner;
