import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaChevronLeft, FaHome } from 'react-icons/fa';
import clsx from 'clsx';

export interface BreadcrumbItem {
  /** Display label for the breadcrumb item */
  label: string;
  /** Navigation path - if provided, item will be clickable */
  path?: string;
  /** Whether this is the current/active item */
  isActive?: boolean;
}

export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Breadcrumb - Modern responsive navigation breadcrumb component
 * 
 * Features adaptive design:
 * - Mobile (< 768px): Compact back button with previous item
 * - Tablet (768px - 1024px): Horizontal scroll with fade indicators
 * - Desktop (> 1024px): Full breadcrumb trail
 * 
 * Includes smooth animations and follows modern UX patterns.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className
}) => {
  const navigate = useNavigate();

  // Handle breadcrumb item click
  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.path && !item.isActive) {
      navigate(item.path);
    }
  };

  // Handle back navigation (mobile)
  const handleBackClick = () => {
    if (items.length > 1) {
      const previousItem = items[items.length - 2];
      if (previousItem?.path) {
        navigate(previousItem.path);
      }
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[items.length - 1];
  const previousItem = items.length > 1 ? items[items.length - 2] : null;
  const hasMultipleItems = items.length > 1;

  return (
    <motion.nav
      className={clsx(
        'mb-6',
        className
      )}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      aria-label="Breadcrumb navigation"
    >
      {/* Mobile View: Compact back button */}
      <div className="md:hidden">
        {hasMultipleItems && previousItem ? (
          <motion.button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-3 py-2 -ml-3 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Go back to ${previousItem.label}`}
          >
            <FaChevronLeft className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium truncate max-w-[200px]">
              {previousItem.label}
            </span>
          </motion.button>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-neutral-600 px-3 py-2">
            <FaHome className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium truncate">
              {currentItem?.label || 'Current Page'}
            </span>
          </div>
        )}
      </div>

      {/* Tablet View: Horizontal scroll */}
      <div className="hidden md:block lg:hidden">
        <div className="relative">
          <div className="flex items-center space-x-2 text-sm overflow-x-auto scrollbar-hide pb-2">
            <div className="flex items-center space-x-2 min-w-max">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isClickable = item.path && !item.isActive && !isLast;

                return (
                  <div key={index} className="flex items-center space-x-2">
                    {/* Breadcrumb Item */}
                    <motion.span
                      className={clsx(
                        'transition-all duration-200 ease-in-out whitespace-nowrap px-2 py-1 rounded-md',
                        {
                          'text-primary-600 hover:text-primary-700 hover:bg-primary-50 cursor-pointer': isClickable,
                          'text-neutral-900 font-medium bg-neutral-100': isLast || item.isActive,
                          'text-neutral-600': !isClickable && !isLast && !item.isActive
                        }
                      )}
                      onClick={() => handleItemClick(item)}
                      whileHover={isClickable ? { scale: 1.02 } : {}}
                      whileTap={isClickable ? { scale: 0.98 } : {}}
                      role={isClickable ? 'button' : 'text'}
                      tabIndex={isClickable ? 0 : -1}
                      onKeyDown={(e) => {
                        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleItemClick(item);
                        }
                      }}
                    >
                      {item.label}
                    </motion.span>

                    {/* Separator */}
                    {!isLast && (
                      <FaChevronRight 
                        className="text-neutral-400 w-3 h-3 flex-shrink-0" 
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Fade indicators for scroll */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Desktop View: Full breadcrumb trail */}
      <div className="hidden lg:block">
        <ol className="flex items-center space-x-2 text-sm flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isClickable = item.path && !item.isActive && !isLast;

            return (
              <li key={index} className="flex items-center space-x-2">
                {/* Breadcrumb Item */}
                <motion.span
                  className={clsx(
                    'transition-all duration-200 ease-in-out px-2 py-1 rounded-md',
                    {
                      'text-primary-600 hover:text-primary-700 hover:bg-primary-50 cursor-pointer': isClickable,
                      'text-neutral-900 font-medium bg-neutral-100': isLast || item.isActive,
                      'text-neutral-600 hover:bg-neutral-50': !isClickable && !isLast && !item.isActive
                    }
                  )}
                  onClick={() => handleItemClick(item)}
                  whileHover={isClickable ? { scale: 1.02 } : {}}
                  whileTap={isClickable ? { scale: 0.98 } : {}}
                  role={isClickable ? 'button' : 'text'}
                  tabIndex={isClickable ? 0 : -1}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleItemClick(item);
                    }
                  }}
                >
                  {item.label}
                </motion.span>

                {/* Separator */}
                {!isLast && (
                  <FaChevronRight 
                    className="text-neutral-400 w-3 h-3 flex-shrink-0" 
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
};

export { Breadcrumb };
export default Breadcrumb;
