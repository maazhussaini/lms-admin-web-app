import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import clsx from 'clsx';

/**
 * Course type filter options
 */
export type CourseTypeFilter = 'all' | 'free' | 'paid';

/**
 * Props for the CourseTypeFilterDropdown component
 */
interface CourseTypeFilterDropdownProps {
  /** Currently selected course type filter */
  selectedCourseType: CourseTypeFilter;
  /** Callback fired when a course type filter is selected */
  onCourseTypeSelect: (courseType: CourseTypeFilter) => void;
  /** Whether the dropdown is currently open */
  isOpen: boolean;
  /** Callback fired when the dropdown should be closed */
  onClose: () => void;
}

/**
 * Filter option configuration
 */
const FILTER_OPTIONS = [
  {
    id: 'all' as CourseTypeFilter,
    label: 'All Courses',
    icon: HiOutlineDocumentText,
    description: 'Show all available courses'
  },
  {
    id: 'free' as CourseTypeFilter,
    label: 'Free Courses',
    icon: HiOutlineDocumentText,
    description: 'Show only free courses'
  },
  {
    id: 'paid' as CourseTypeFilter,
    label: 'Paid Courses',
    icon: HiOutlineCurrencyDollar,
    description: 'Show only paid courses'
  }
];

/**
 * CourseTypeFilterDropdown - A dropdown component for filtering courses by type
 * 
 * Features:
 * - Clean, modern design matching the overall UI
 * - Smooth animations with Framer Motion
 * - Proper accessibility with ARIA labels
 * - Click outside to close functionality
 * - Responsive design
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const CourseTypeFilterDropdown: React.FC<CourseTypeFilterDropdownProps> = ({
  selectedCourseType,
  onCourseTypeSelect,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  /**
   * Handle filter option click
   */
  const handleOptionClick = (courseType: CourseTypeFilter) => {
    onCourseTypeSelect(courseType);
    onClose();
  };

  return (
    <>
      {/* Desktop Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="hidden sm:block absolute top-full mt-2 right-0 z-50 w-64 bg-white rounded-[15px] shadow-lg border border-neutral-200 overflow-hidden"
      >
        {/* Desktop Header */}
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
          <h3 className="text-sm font-semibold text-neutral-700">Filter by Course Type</h3>
        </div>

        {/* Desktop Filter Options */}
        <div className="py-2">
          {FILTER_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedCourseType === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3',
                  'text-left transition-all duration-200',
                  'hover:bg-neutral-50 focus:outline-none focus:bg-neutral-50',
                  {
                    'bg-primary-50 text-primary-700': isSelected,
                    'text-neutral-700': !isSelected
                  }
                )}
                aria-label={`Filter by ${option.label}`}
                role="radio"
                aria-checked={isSelected}
              >
                {/* Icon */}
                <div
                  className={clsx(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                    'transition-colors duration-200',
                    {
                      'bg-primary-100': isSelected,
                      'bg-neutral-100': !isSelected
                    }
                  )}
                >
                  <IconComponent
                    className={clsx(
                      'w-5 h-5',
                      {
                        'text-primary-600': isSelected,
                        'text-neutral-500': !isSelected
                      }
                    )}
                  />
                </div>

                {/* Label and Description */}
                <div className="flex-1 min-w-0">
                  <div
                    className={clsx(
                      'font-medium text-sm',
                      {
                        'text-primary-700': isSelected,
                        'text-neutral-700': !isSelected
                      }
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {option.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Footer */}
        <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
          <p className="text-xs text-neutral-500">
            Select a filter to narrow down your course results
          </p>
        </div>
      </motion.div>

      {/* Mobile Dropdown - Clean and simple */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="sm:hidden absolute top-full mt-2 left-0 right-0 z-50 bg-white rounded-[15px] shadow-lg border border-neutral-200 overflow-hidden"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50">
          <h3 className="text-sm font-semibold text-neutral-700">Filter by Course Type</h3>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 transition-colors duration-200"
            aria-label="Close filter dropdown"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Filter Options */}
        <div className="py-2">
          {FILTER_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedCourseType === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3',
                  'text-left transition-all duration-200',
                  'hover:bg-neutral-50 focus:outline-none focus:bg-neutral-50',
                  {
                    'bg-primary-50 text-primary-700': isSelected,
                    'text-neutral-700': !isSelected
                  }
                )}
                aria-label={`Filter by ${option.label}`}
                role="radio"
                aria-checked={isSelected}
              >
                {/* Icon */}
                <div
                  className={clsx(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                    'transition-colors duration-200',
                    {
                      'bg-primary-100': isSelected,
                      'bg-neutral-100': !isSelected
                    }
                  )}
                >
                  <IconComponent
                    className={clsx(
                      'w-5 h-5',
                      {
                        'text-primary-600': isSelected,
                        'text-neutral-500': !isSelected
                      }
                    )}
                  />
                </div>

                {/* Label and Description */}
                <div className="flex-1 min-w-0">
                  <div
                    className={clsx(
                      'font-medium text-sm',
                      {
                        'text-primary-700': isSelected,
                        'text-neutral-700': !isSelected
                      }
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {option.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default CourseTypeFilterDropdown;
