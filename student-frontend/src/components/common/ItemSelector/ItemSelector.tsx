/**
 * @file components/common/ItemSelector/ItemSelector.tsx
 * @description Generic item selector component following business-approved design pattern
 * Based on approved ModuleSelector and TopicSelector implementation
 */

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Item {
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  // Allow other properties without using 'any'
  [key: string]: unknown;
}

export interface ItemSelectorProps {
  /** Array of items to display */
  items: Item[];
  /** Currently selected item ID */
  selectedItemId: string | null;
  /** Handler for item selection */
  onItemSelect: (item: Item) => void;
  /** Title for the selector section */
  title: string;
  /** Total count of items for display */
  totalCount: number;
  /** Current index for display (1-based) */
  currentIndex: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ItemSelector - Generic horizontal selector with drag-to-scroll functionality
 * 
 * Features:
 * - Business-approved white container with shadow design
 * - Header with title and "X of Y" counter
 * - Custom drag-to-scroll implementation
 * - Active item highlighting with blue color scheme
 * - Responsive design with minimum item widths
 * - Smooth animations with Framer Motion
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const ItemSelector: React.FC<ItemSelectorProps> = ({
  items,
  selectedItemId,
  onItemSelect,
  title,
  totalCount,
  currentIndex,
  className
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={clsx('bg-white rounded-[30px] shadow-lg border border-gray-100 overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            {currentIndex} of {totalCount}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => {
            const isActive = item.id === selectedItemId;

            return (
              <motion.button
                key={item.id}
                onClick={() => onItemSelect(item)}
                className={clsx(
                  'relative flex-shrink-0 min-w-[280px] p-6 rounded-2xl border-0 text-left transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-primary-800 text-white shadow-lg'
                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                )}
                whileHover={!isActive ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-3">
                  {/* Module/Topic Title with pill badge */}
                  <div className="flex items-center justify-between">
                    <h4 className={clsx(
                      'font-semibold text-lg transition-colors',
                      isActive ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.title}
                    </h4>
                    {item.count && (
                      <div className={clsx(
                        'backdrop-blur-sm px-3 py-1 rounded-full transition-all duration-200',
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-primary-100/80'
                      )}>
                        <span className={clsx(
                          'text-xs font-medium transition-colors',
                          isActive ? 'text-white' : 'text-gray-700'
                        )}>
                          {item.count} {item.countLabel || 'Items'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description/Subtitle */}
                  {item.subtitle && (
                    <h5 className={clsx(
                      'font-medium text-base transition-colors',
                      isActive ? 'text-white/90' : 'text-gray-800'
                    )}>
                      {item.subtitle}
                    </h5>
                  )}

                  {/* Additional description or count */}
                  {item.description && (
                    <p className={clsx(
                      'text-sm transition-colors',
                      isActive ? 'text-white' : 'text-purple-600'
                    )}>
                      {item.description}
                    </p>
                  )}
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeItem"
                    className="absolute inset-0 rounded-2xl bg-primary-800 shadow-lg"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                    style={{ zIndex: -1 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { ItemSelector };
export default ItemSelector;
