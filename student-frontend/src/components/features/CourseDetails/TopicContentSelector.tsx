import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type TopicContentType = 'lectures' | 'live-classes' | 'assignments' | 'quizzes' | 'materials';

export interface TopicContentSelectorProps {
  /** Currently active content type */
  activeContent: TopicContentType;
  /** Handler for content type change */
  onContentChange: (contentType: TopicContentType) => void;
  /** Content counts for each section */
  counts: {
    lectures: number;
    liveClasses: number;
    assignments: number;
    quizzes: number;
    materials: number;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * TopicContentSelector - Selector component for switching between topic content types
 * 
 * Displays tabs for Lectures, Live Classes, Assignments, Quizzes, and Materials within a topic.
 * Features smooth animations and follows the LMS design system.
 * Shows content counts for each section.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const TopicContentSelector: React.FC<TopicContentSelectorProps> = ({
  activeContent,
  onContentChange,
  counts,
  className
}) => {
  const contentTabs = [
    {
      key: 'lectures' as const,
      label: 'Lectures',
      count: counts.lectures
    },
    {
      key: 'live-classes' as const,
      label: 'Live Classes',
      count: counts.liveClasses
    },
    {
      key: 'assignments' as const,
      label: 'Assignments',
      count: counts.assignments
    },
    {
      key: 'quizzes' as const,
      label: 'Quizzes',
      count: counts.quizzes
    },
    {
      key: 'materials' as const,
      label: 'Materials',
      count: counts.materials
    }
  ];

  return (
    <div 
      className={clsx(
        'flex flex-col sm:flex-row bg-white rounded-[15px] p-1.5 w-full shadow-sm border border-neutral-200 gap-1.5 sm:gap-0',
        className
      )}
      role="tablist"
      aria-label="Topic content tabs"
    >
      {contentTabs.map((tab) => {
        const isActive = activeContent === tab.key;
        
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.key}-content-panel`}
            onClick={() => onContentChange(tab.key)}
            className={clsx(
              'relative flex-1 px-4 sm:px-6 py-3.5 sm:py-4 rounded-[15px] font-semibold text-sm sm:text-base transition-all duration-200 ease-in-out cursor-pointer',
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
                layoutId="activeTopicContent"
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
            <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 w-full">
              <span className="truncate font-semibold">
                {tab.label}
              </span>
              <span 
                className={clsx(
                  'inline-flex items-center justify-center min-w-[22px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 rounded-full text-xs sm:text-sm font-bold flex-shrink-0',
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

export { TopicContentSelector };
export default TopicContentSelector;
