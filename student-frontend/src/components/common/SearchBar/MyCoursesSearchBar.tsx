import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import CourseTypeFilterDropdown, { type CourseTypeFilter } from './CourseTypeFilterDropdown';

/**
 * Props for the MyCoursesSearchBar component
 */
interface MyCoursesSearchBarProps {
  /** Current search value */
  value?: string;
  /** Callback fired when search value changes */
  onSearch?: (query: string) => void;
  /** Callback fired when filter button is clicked */
  onFilterClick?: () => void;
  /** Whether filter is currently active/applied */
  hasActiveFilters?: boolean;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether the search is currently loading */
  loading?: boolean;
  /** Whether the search bar is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Course type filter props */
  selectedCourseType?: CourseTypeFilter;
  /** Callback fired when course type filter changes */
  onCourseTypeSelect?: (courseType: CourseTypeFilter) => void;
  /** Whether the filter dropdown is open */
  isFilterDropdownOpen?: boolean;
  /** Callback fired when filter dropdown should be closed */
  onFilterDropdownClose?: () => void;
}

/**
 * MyCoursesSearchBar - A pixel-perfect search bar component for the My Courses page
 * 
 * Features:
 * - Clean, modern design matching the UI/UX specifications
 * - Debounced search input for performance
 * - Loading state with subtle animation
 * - Responsive design with proper focus states
 * - Accessibility support with ARIA labels
 * 
 * @param props - Component props
 * @returns JSX.Element
 */

const MyCoursesSearchBar: React.FC<MyCoursesSearchBarProps> = ({
  value = '',
  onSearch,
  onFilterClick,
  hasActiveFilters = false,
  placeholder = 'Search here',
  loading = false,
  disabled = false,
  className,
  autoFocus = false,
  debounceMs = 300,
  selectedCourseType = 'all',
  onCourseTypeSelect,
  isFilterDropdownOpen = false,
  onFilterDropdownClose
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        onFilterDropdownClose?.();
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return undefined;
  }, [isFilterDropdownOpen, onFilterDropdownClose]);

  // Debounced search handler
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onSearch?.(query);
      }, debounceMs);
    };
  }, [onSearch, debounceMs]);

  // Container classes with focus and disabled states
  const containerClasses = clsx(
    'relative w-full',
    'bg-white rounded-[15px]',
    'border border-neutral-200',
    'transition-all duration-200 ease-in-out',
    'shadow-sm hover:shadow-md',
    'h-14 sm:h-16', // Increased height
    {
      'ring-2 ring-primary-500 ring-opacity-20 border-primary-300': isFocused && !disabled,
      'opacity-60 cursor-not-allowed': disabled,
      'shadow-lg': isFocused && !disabled
    }
  );

  // Input classes
  const inputClasses = clsx(
    'w-full pl-14 sm:pl-16 pr-6 py-4 sm:py-5', // Increased padding
    'text-neutral-700 placeholder-neutral-400',
    'font-medium text-base sm:text-lg', // Increased font size
    'bg-transparent border-none outline-none',
    'rounded-[15px]',
    {
      'cursor-not-allowed': disabled
    }
  );

  // Search icon classes
  const iconClasses = clsx(
    'absolute left-5 sm:left-6 top-1/2 transform -translate-y-1/2', // Adjusted positioning
    'w-6 h-6 sm:w-7 sm:h-7', // Increased icon size
    'transition-colors duration-200',
    {
      'text-neutral-400': !isFocused && !loading,
      'text-primary-500': isFocused && !disabled,
      'text-neutral-300': disabled,
      'animate-pulse': loading
    }
  );

  /**
   * Handle input value changes with debounced search
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    debouncedSearch(newValue);
  }, [debouncedSearch]);

  /**
   * Handle input focus events
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  /**
   * Handle input blur events
   */
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  /**
   * Handle form submission (prevent default)
   */
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.(searchValue);
  }, [searchValue, onSearch]);

  /**
   * Handle filter button click
   */
  const handleFilterClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onFilterClick?.();
  }, [onFilterClick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx('w-full relative', className)}
    >
      <div className="flex items-center gap-3">
        {/* Search Bar Container */}
        <form onSubmit={handleSubmit} className="flex-1">
          <div className={containerClasses}>
            {/* Search Icon */}
            <div className={iconClasses}>
              <HiOutlineMagnifyingGlass 
                className={clsx(
                  'w-full h-full',
                  {
                    'animate-pulse': loading
                  }
                )}
                aria-hidden="true"
              />
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              className={inputClasses}
              aria-label="Search courses"
              aria-describedby="search-help"
              autoComplete="off"
              spellCheck="false"
            />

            {/* Loading Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-5 sm:right-6 top-1/2 transform -translate-y-1/2" // Adjusted positioning
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-200 border-t-primary-500 rounded-[15px] animate-spin" /> {/* Increased size */}
              </motion.div>
            )}
          </div>
        </form>

        {/* Filter Button */}
        {onFilterClick && (
          <button
            type="button"
            onClick={handleFilterClick}
            disabled={disabled}
            className={clsx(
              'flex items-center justify-center',
              'w-14 h-14 sm:w-16 sm:h-16 rounded-[15px]', // Increased size to match search bar
              'bg-white border border-neutral-200',
              'transition-all duration-200 ease-in-out',
              'shadow-sm hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'hover:scale-105 active:scale-95',
              {
                'bg-primary-50 border-primary-300 text-primary-600': hasActiveFilters || isFilterDropdownOpen,
                'text-neutral-500 hover:text-neutral-700': !hasActiveFilters && !disabled && !isFilterDropdownOpen,
                'opacity-60 cursor-not-allowed': disabled,
                'shadow-lg': hasActiveFilters || isFilterDropdownOpen
              }
            )}
            aria-label={hasActiveFilters ? "Filter active - click to modify" : "Open filter options"}
            title={hasActiveFilters ? "Filter active" : "Filter courses"}
            aria-expanded={isFilterDropdownOpen}
          >
            <HiOutlineAdjustmentsHorizontal 
              className={clsx(
                'w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200', // Increased icon size
                {
                  'scale-110': hasActiveFilters || isFilterDropdownOpen
                }
              )}
            />
            {/* Active filter indicator */}
            {hasActiveFilters && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-white" // Slightly larger indicator
              />
            )}
          </button>
        )}
      </div>

      {/* Course Type Filter Dropdown - Positioned under entire search container */}
      {onCourseTypeSelect && (
        <div ref={filterRef}>
          <CourseTypeFilterDropdown
            selectedCourseType={selectedCourseType}
            onCourseTypeSelect={onCourseTypeSelect}
            isOpen={isFilterDropdownOpen}
            onClose={onFilterDropdownClose!}
          />
        </div>
      )}

      {/* Screen reader help text */}
      <div id="search-help" className="sr-only">
        Enter search terms to filter your courses. Results will appear as you type.
        {onFilterClick && " Use the filter button to access additional filtering options."}
      </div>
    </motion.div>
  );
};

export default MyCoursesSearchBar;
