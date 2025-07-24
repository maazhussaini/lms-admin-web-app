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
          <motion.button
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
              }
            )}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="font-semibold">
                {tab.label}
              </span>
              
              {showCounts && (
                <motion.span
                  className={clsx(
                    'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-medium transition-colors',
                    {
                      'bg-white/20 text-white': isActive,
                      'bg-neutral-100 text-neutral-600': !isActive && !isEmpty,
                      'bg-neutral-50 text-neutral-400': !isActive && isEmpty,
                    }
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {tab.count}
                </motion.span>
              )}
            </span>
            
            {/* Active indicator line */}
            {isActive && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                layoutId="active-indicator"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Export with generic type support
export { ContentSelector };
export default ContentSelector;
