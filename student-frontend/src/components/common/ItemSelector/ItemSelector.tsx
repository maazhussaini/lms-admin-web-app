/**
 * @file components/common/ItemSelector/ItemSelector.tsx
 * @description Generic item selector component with drag-to-scroll
 * Replaces ModuleSelector and TopicSelector with unified implementation
 */

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useDragToScroll } from '@/hooks/useDragToScroll';
import { COURSE_DETAILS_STYLES, COURSE_DETAILS_ANIMATIONS } from '@/constants/courseDetails.constants';
import type { SelectorItem } from '@/types/courseDetails.ui.types';

export interface ItemSelectorProps {
  /** Array of items to display */
  items: SelectorItem[];
  /** Currently active item ID */
  currentItemId: number;
  /** Handler for item selection */
  onItemSelect: (itemId: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Label for accessibility */
  ariaLabel: string;
  /** Whether to show item counts */
  showCounts?: boolean;
  /** Whether to show item subtitles */
  showSubtitles?: boolean;
  /** Custom render function for item content */
  renderItem?: (item: SelectorItem, isActive: boolean) => React.ReactNode;
}

/**
 * ItemSelector - Generic horizontal selector with drag-to-scroll functionality
 * 
 * Features:
 * - Drag-to-scroll horizontal navigation
 * - Configurable item display with counts and subtitles
 * - Current item highlighting with smooth animations
 * - Smart click vs drag detection
 * - Responsive design with touch-friendly interactions
 * - Custom render support for flexible item display
 * - Full accessibility support
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const ItemSelector: React.FC<ItemSelectorProps> = ({
  items,
  currentItemId,
  onItemSelect,
  className,
  ariaLabel,
  showCounts = true,
  showSubtitles = true,
  renderItem,
}) => {
  const { scrollContainerRef, isDragging, eventHandlers } = useDragToScroll();
  const currentIndex = items.findIndex(item => item.id === currentItemId);

  // Handle item click (only if not dragging)
  const handleItemClick = (itemId: number) => {
    if (!isDragging) {
      onItemSelect(itemId);
    }
  };

  // Default item renderer
  const defaultRenderItem = (item: SelectorItem, isActive: boolean) => (
    <>
      {/* Item number and name */}
      <div className="flex items-center gap-3">
        <div 
          className={clsx(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
            {
              'bg-primary-600 text-white': isActive,
              'bg-neutral-100 text-neutral-600': !isActive,
            }
          )}
        >
          {items.findIndex(i => i.id === item.id) + 1}
        </div>
        <div className="min-w-0 flex-1">
          <h3 
            className={clsx(
              'font-semibold text-sm truncate transition-colors',
              {
                'text-primary-900': isActive,
                'text-neutral-700': !isActive,
              }
            )}
          >
            {item.name}
          </h3>
          {showSubtitles && item.subtitle && (
            <p 
              className={clsx(
                'text-xs truncate transition-colors',
                {
                  'text-primary-600': isActive,
                  'text-neutral-500': !isActive,
                }
              )}
            >
              {item.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Count badge */}
      {showCounts && typeof item.count !== 'undefined' && (
        <motion.div
          className={clsx(
            'flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium transition-colors',
            {
              'bg-primary-100 text-primary-700': isActive,
              'bg-neutral-100 text-neutral-600': !isActive,
            }
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {item.count}
        </motion.div>
      )}
    </>
  );

  // Always render the selector, even with empty arrays for consistent UI
  const hasItems = items.length > 0;
  const displayItems = hasItems ? items : [];

  return (
    <div className={clsx('w-full', className)}>
      <div
        ref={scrollContainerRef}
        className={clsx(
          COURSE_DETAILS_STYLES.SELECTOR.CONTAINER,
          'select-none' // Prevent text selection during drag
        )}
        role="tablist"
        aria-label={ariaLabel}
        {...eventHandlers}
      >
        {hasItems ? (
          displayItems.map((item, index) => {
            const isActive = item.id === currentItemId;
            
            return (
              <motion.div
                key={item.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${item.id}-content-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleItemClick(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(item.id);
                  }
                }}
                className={clsx(
                  COURSE_DETAILS_STYLES.SELECTOR.ITEM_BASE,
                  {
                    [COURSE_DETAILS_STYLES.SELECTOR.ITEM_ACTIVE]: isActive,
                    [COURSE_DETAILS_STYLES.SELECTOR.ITEM_INACTIVE]: !isActive,
                    'cursor-pointer': !isDragging,
                    'cursor-grabbing': isDragging,
                  }
                )}
                whileHover={!isDragging ? COURSE_DETAILS_ANIMATIONS.SELECTOR_ITEM.WHILEHOVER : undefined}
                whileTap={!isDragging ? COURSE_DETAILS_ANIMATIONS.SELECTOR_ITEM.WHILETAP : undefined}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  ...COURSE_DETAILS_ANIMATIONS.SELECTOR_ITEM.TRANSITION,
                  delay: index * 0.05 
                }}
              >
                {renderItem ? renderItem(item, isActive) : defaultRenderItem(item, isActive)}

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary-400 pointer-events-none"
                    layoutId="active-border"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8 text-neutral-500">
            <p>No items available</p>
          </div>
        )}
      </div>

      {/* Current item indicator */}
      {hasItems && currentIndex !== -1 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-1">
            {displayItems.map((_, index) => (
              <div
                key={index}
                className={clsx(
                  'w-2 h-2 rounded-full transition-colors',
                  {
                    'bg-primary-600': index === currentIndex,
                    'bg-neutral-200': index !== currentIndex,
                  }
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { ItemSelector };
export default ItemSelector;
