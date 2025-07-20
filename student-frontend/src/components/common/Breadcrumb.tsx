import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
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
 * Breadcrumb - Navigation breadcrumb component for hierarchical navigation
 * 
 * Displays a horizontal breadcrumb trail with clickable links and separators.
 * The last item is typically the current page and appears non-clickable.
 * Features smooth animations and follows the LMS design system.
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

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.nav
      className={clsx(
        'flex items-center space-x-2 text-sm mb-6',
        className
      )}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = item.path && !item.isActive && !isLast;

          return (
            <li key={index} className="flex items-center space-x-2">
              {/* Breadcrumb Item */}
              <motion.span
                className={clsx(
                  'transition-all duration-200 ease-in-out',
                  {
                    // Clickable item styles
                    'text-primary-600 hover:text-primary-700 cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-1': isClickable,
                    // Active/current item styles
                    'text-neutral-900 font-medium': isLast || item.isActive,
                    // Regular non-clickable styles
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
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export { Breadcrumb };
export default Breadcrumb;
