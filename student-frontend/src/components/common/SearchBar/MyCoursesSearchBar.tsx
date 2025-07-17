import React, { useState, useCallback, useMemo } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Props for the MyCoursesSearchBar component
 */
interface MyCoursesSearchBarProps {
  /** Current search value */
  value?: string;
  /** Callback fired when search value changes */
  onSearch?: (query: string) => void;
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
  placeholder = 'Search here',
  loading = false,
  disabled = false,
  className,
  autoFocus = false,
  debounceMs = 300
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

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

  // Container classes with focus and disabled states
  const containerClasses = clsx(
    'relative w-full max-w-md mx-auto',
    'bg-white rounded-full',
    'border border-neutral-200',
    'transition-all duration-200 ease-in-out',
    'shadow-sm hover:shadow-md',
    {
      'ring-2 ring-primary-500 ring-opacity-20 border-primary-300': isFocused && !disabled,
      'opacity-60 cursor-not-allowed': disabled,
      'shadow-lg': isFocused && !disabled
    },
    className
  );

  // Input classes
  const inputClasses = clsx(
    'w-full pl-12 pr-4 py-3',
    'text-neutral-700 placeholder-neutral-400',
    'font-medium text-sm',
    'bg-transparent border-none outline-none',
    'rounded-full',
    {
      'cursor-not-allowed': disabled
    }
  );

  // Search icon classes
  const iconClasses = clsx(
    'absolute left-4 top-1/2 transform -translate-y-1/2',
    'w-5 h-5',
    'transition-colors duration-200',
    {
      'text-neutral-400': !isFocused && !loading,
      'text-primary-500': isFocused && !disabled,
      'text-neutral-300': disabled,
      'animate-pulse': loading
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="w-full">
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </motion.div>
          )}
        </div>
      </form>

      {/* Screen reader help text */}
      <div id="search-help" className="sr-only">
        Enter search terms to filter your courses. Results will appear as you type.
      </div>
    </motion.div>
  );
};

export default MyCoursesSearchBar;
