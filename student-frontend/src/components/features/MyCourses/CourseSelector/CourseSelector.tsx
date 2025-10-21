import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { CourseTab, CourseCounts } from '@/types/course.ui.types';

export interface CourseSelectorProps {
  /** Current active tab */
  activeTab: CourseTab;
  /** Handler for tab change */
  onTabChange: (tab: CourseTab) => void;
  /** Course counts for each category */
  counts: CourseCounts;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CourseSelector - Tab selector component for filtering courses
 * 
 * Displays three tabs: All Courses, Enrolled, and Unenrolled with course counts.
 * Features smooth animations and follows the LMS design system.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const CourseSelector: React.FC<CourseSelectorProps> = ({
  activeTab,
  onTabChange,
  counts,
  className
}) => {
  const tabs = [
    {
      key: 'all' as const,
      label: 'All Courses',
      shortLabel: 'All',
      count: counts.all
    },
    {
      key: 'enrolled' as const,
      label: 'Enrolled',
      shortLabel: 'Enrolled',
      count: counts.enrolled
    },
    {
      key: 'unenrolled' as const,
      label: 'Unenrolled',
      shortLabel: 'Available',
      count: counts.unenrolled
    }
  ];

  return (
    <div 
      className={clsx(
        'flex flex-col sm:flex-row bg-white rounded-[15px] p-1.5 w-full sm:w-auto sm:min-w-[480px] laptop:min-w-[420px] xl:min-w-[540px] shadow-sm border border-neutral-200 gap-1.5 sm:gap-0 flex-shrink-0',
        className
      )}
      role="tablist"
      aria-label="Course filter tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.key}-courses-panel`}
            onClick={() => onTabChange(tab.key)}
            className={clsx(
              'relative flex-1 px-6 sm:px-8 laptop:px-6 xl:px-10 py-3.5 sm:py-4 laptop:py-3 xl:py-5 rounded-[15px] font-semibold text-sm sm:text-base laptop:text-sm xl:text-lg transition-all duration-200 ease-in-out cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'hover:scale-[1.02] active:scale-[0.98]',
              {
                'text-white bg-primary-900 shadow-lg': isActive,
                'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100': !isActive
              }
            )}
          >
            {/* Active tab background animation */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary-900 rounded-[15px] shadow-lg"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
            
            {/* Tab content */}
            <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 laptop:gap-2 xl:gap-3 w-full">
              <span className="truncate font-medium">
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
              <span 
                className={clsx(
                  'inline-flex items-center justify-center min-w-[22px] sm:min-w-[24px] laptop:min-w-[22px] xl:min-w-[28px] h-5 sm:h-6 laptop:h-5 xl:h-7 px-1.5 sm:px-2 laptop:px-1.5 xl:px-2.5 rounded-full text-xs sm:text-sm laptop:text-xs xl:text-base font-bold flex-shrink-0',
                  {
                    'bg-white/20 text-white': isActive,
                    'bg-neutral-300 text-neutral-700': !isActive
                  }
                )}
              >
                {String(tab.count).padStart(2, '0')}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CourseSelector;
