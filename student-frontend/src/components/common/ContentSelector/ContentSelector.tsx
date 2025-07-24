/**
 * @file components/common/ContentSelector/ContentSelector.tsx
 * @description Generic content selector component
 * Replaces ModuleContentSelector and TopicContentSelector with unified implementation
 */

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { COURSE_DETAILS_STYLES } from '@/constants/courseDetails.constants';
import type { ContentTab, ContentType } from '@/types/courseDetails.ui.types';

export interface ContentSelectorProps<T extends ContentType> {
  /** Currently active content type */
  activeContent: T;
  /** Handler for content type change */
  onContentChange: (contentType: T) => void;
  /** Array of content tabs with labels and counts */
  contentTabs: ContentTab<T>[];
  /** Aria label for the tab list */
  ariaLabel: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show count badges */
  showCounts?: boolean;
  /** Whether to disable tabs with zero counts */
  disableEmptyTabs?: boolean;
}

/**
 * ContentSelector - Generic tab selector component for content types
 * 
 * Features:
 * - Configurable tabs with counts
 * - Smooth animations and transitions
 * - Full accessibility support
 * - Responsive design
 * - Optional count badges
 * - Disabled state for empty tabs
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
function ContentSelector<T extends ContentType>({
  activeContent,
  onContentChange,
  contentTabs,
  ariaLabel,
  className,
  showCounts = true,
  disableEmptyTabs = false,
}: ContentSelectorProps<T>) {
  return (
    <div 
      className={clsx(
        COURSE_DETAILS_STYLES.CONTENT_SELECTOR.CONTAINER,
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {contentTabs.map((tab) => {
        const isActive = activeContent === tab.key;
        const isDisabled = disableEmptyTabs && tab.count === 0;
        const isEmpty = tab.count === 0;
        
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.key}-content-panel`}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => !isDisabled && onContentChange(tab.key)}
            className={clsx(
              COURSE_DETAILS_STYLES.CONTENT_SELECTOR.TAB_BASE,
              {
                [COURSE_DETAILS_STYLES.CONTENT_SELECTOR.TAB_ACTIVE]: isActive,
                [COURSE_DETAILS_STYLES.CONTENT_SELECTOR.TAB_INACTIVE]: !isActive,
                'opacity-50 cursor-not-allowed': isDisabled,
                'cursor-pointer': !isDisabled,
                'hover:scale-[1.02] active:scale-[0.98]': !isDisabled,
              }
            )}
          >
            {/* Active tab background animation */}
            {isActive && (
              <motion.div
                layoutId="activeContentTab"
                className="absolute inset-0 bg-primary-900 rounded-[12px] shadow-lg"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
            
            {/* Tab content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="font-semibold">
                {tab.label}
              </span>
              
              {showCounts && (
                <span
                  className={clsx(
                    'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-medium transition-colors',
                    {
                      'bg-white/20 text-white': isActive,
                      'bg-neutral-100 text-neutral-600': !isActive && !isEmpty,
                      'bg-neutral-50 text-neutral-400': !isActive && isEmpty,
                    }
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Export with generic type support
export { ContentSelector };
export default ContentSelector;
