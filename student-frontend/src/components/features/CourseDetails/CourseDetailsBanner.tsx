import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCommentDots } from 'react-icons/fa';
import Button from '@/components/common/Button/Button';
import { CourseDetailsData } from '@/pages/CourseDetailsPage/mockData';

/**
 * Props for the CourseDetailsBanner component
 */
interface CourseDetailsBannerProps {
  /** Course details data */
  courseDetails: CourseDetailsData;
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
  const progressPercentage = courseDetails.progress?.overall_progress_percentage || 0;
  const instructorName = courseDetails.instructor?.name || 'Unknown Instructor';

  // Format course duration dates (May 2025 - July 2025)
  const startDate = new Date(courseDetails.created_at || new Date());
  const endDate = new Date(courseDetails.updated_at || new Date());
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const courseDuration = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  return (
    <motion.div
      className="relative w-full h-[240px] xs:h-[260px] sm:h-[280px] md:h-[320px] lg:h-[360px] overflow-hidden rounded-t-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/course_details_banner.png)`
        }}
      >
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex justify-between items-center z-10">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          size="lg"
          shape="rounded"
          aria-label="Go back"
          className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white shadow-sm"
        >
          <FaArrowLeft className="text-lg" style={{ color: '#63747D' }} />
        </Button>

        {/* Feedback Button */}
        <Button
          onClick={onFeedback}
          variant="ghost"
          size="lg"
          shape="rounded"
          aria-label="Send feedback"
          className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white shadow-sm"
        >
          <FaCommentDots className="text-lg" style={{ color: '#63747D' }} />
        </Button>
      </div>
      {/* Course Type Badge Positioned on Right */}
      <div className="absolute top-20 right-3 sm:top-24 sm:right-4 md:top-32 md:right-6 z-10">
        <span className="inline-flex items-center px-3 py-1 sm:px-4 md:px-6 bg-blue-100 rounded-md text-xs sm:text-sm md:text-base font-medium text-blue-500 shadow-sm">
          {courseDetails.course_type}
        </span>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-6 md:gap-8">
          {/* Instructor Avatar */}
          <motion.div
            className="flex-shrink-0 -mt-8 sm:-mt-10 md:-mt-12"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 overflow-hidden">
              {courseDetails.instructor?.avatar ? (
                <img
                  src="/female.png"
                  alt={instructorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-semibold">
                  {instructorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
          </motion.div>

          {/* Course Information */}
          <motion.div
            className="flex-1 text-white"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-1 sm:mb-2 md:mb-3 leading-tight">
              {courseDetails.course_name}
            </h1>

            {/* Course Subtitle/Category */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-100 mb-2 sm:mb-3 font-medium">
              Machine Learning, Data Science
            </p>

            {/* Course Duration and Instructor */}
            <div className="flex flex-col text-primary-200 mb-3 sm:mb-4 md:mb-5">
              <span className="text-sm sm:text-base md:text-lg lg:text-xl">{courseDuration}</span>
              <span className="text-sm sm:text-base md:text-lg lg:text-xl mt-1">{instructorName}</span>
            </div>

            {/* Course Progress Section */}
            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              {/* Progress Bar and Course Badge */}
              <div className="relative">
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 sm:h-2 md:h-3 bg-white/20 rounded-full overflow-hidden mt-4 sm:mt-6 md:mt-8">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  />
                </div>
                
                {/* Progress Labels */}
                <div className="flex justify-between mt-1 sm:mt-2 text-xs sm:text-sm text-primary-100">
                  <span>0%</span>
                  <span className="text-white font-medium">{progressPercentage}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailsBanner;
