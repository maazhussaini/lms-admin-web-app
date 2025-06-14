import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, SortAscendingIcon, SortDescendingIcon, TableIcon } from '@/components/common/Icons';
import Shimmer from '@/components/common/Shimmer';
import Tooltip from '@/components/common/Tooltip';

/**
 * Filter icon component
 */
const FilterIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Custom styled dropdown component
 */
interface DropdownProps {
  id: string;
  value: string | number;
  options: Array<{ 
    label: string; 
    value: string | number; 
    icon?: React.ReactNode;
    tooltip?: string;
  }>;
  onChange: (value: string | number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  mobileLabel?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  id,
  value,
  options,
  onChange,
  label,
  disabled = false,
  className = '',
  tooltip,
  mobileLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLLIElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  // Set focus to first option when opening dropdown
  useEffect(() => {
    if (isOpen && firstOptionRef.current) {
      requestAnimationFrame(() => {
        firstOptionRef.current?.focus();
      });
    }
  }, [isOpen]);
  const handleOptionClick = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, optionValue?: string | number) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
        } else if (optionValue !== undefined) {
          // Focus the next option
          const currentIndex = options.findIndex(o => o.value === optionValue);
          const nextOption = options[currentIndex + 1];
          if (nextOption) {
            document.getElementById(`${id}-option-${nextOption.value}`)?.focus();
          }
        }
        break;
      case 'ArrowUp':
        if (optionValue !== undefined) {
          // Focus the previous option
          const currentIndex = options.findIndex(o => o.value === optionValue);
          const prevOption = options[currentIndex - 1];
          if (prevOption) {
            document.getElementById(`${id}-option-${prevOption.value}`)?.focus();
          }
        }
        break;
      case 'Enter':
      case ' ':
        if (optionValue !== undefined) {
          e.preventDefault();
          handleOptionClick(optionValue);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>      {label && (
        <label 
          id={`${id}-label`}
          htmlFor={id} 
          className="text-sm text-neutral-600 mb-1 whitespace-nowrap hidden sm:flex"
        >
          {label}:
        </label>
      )}
      
      {/* Mobile label is shown on small screens */}
      {mobileLabel && (
        <label 
          htmlFor={id} 
          className="text-sm text-neutral-600 mb-1 whitespace-nowrap sm:hidden flex"
        >
          {mobileLabel}:
        </label>
      )}
      
      {tooltip ? (
        <Tooltip text={tooltip}>
          <button
            id={id}
            ref={menuButtonRef}
            type="button"
            className={`
              flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium 
              rounded-md border border-neutral-300 bg-white text-neutral-700
              focus:outline-none focus:ring focus:ring-primary-200 focus:border-primary-500
              transition-all duration-200 ease-in-out
              ${disabled ? 'opacity-60 cursor-not-allowed bg-neutral-100' : 'hover:border-primary-400 hover:bg-neutral-50 cursor-pointer'}
            `}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={e => handleKeyDown(e)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? `${id}-label` : undefined}
          >
            <span className="truncate">{selectedOption?.label || 'Select...'}</span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="ml-2"
            >
              <ChevronDownIcon className="w-4 h-4 text-neutral-500" />
            </motion.span>
          </button>
        </Tooltip>
      ) : (
        <button
          id={id}
          ref={menuButtonRef}
          type="button"
          className={`
            flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium 
            rounded-md border border-neutral-300 bg-white text-neutral-700
            focus:outline-none focus:ring focus:ring-primary-200 focus:border-primary-500
            transition-all duration-200 ease-in-out
            ${disabled ? 'opacity-60 cursor-not-allowed bg-neutral-100' : 'hover:border-primary-400 hover:bg-neutral-50 cursor-pointer'}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={e => handleKeyDown(e)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          <span className="truncate">{selectedOption?.label || 'Select...'}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="ml-2"
          >
            <ChevronDownIcon className="w-4 h-4 text-neutral-500" />
          </motion.span>
        </button>
      )}
        <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="absolute z-10 w-full mt-1 py-1 bg-white border border-neutral-200 rounded-md shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="listbox"
          >
            {options.map((option, index) => {
              const OptionItem = (
                <motion.li
                  id={`${id}-option-${option.value}`}
                  key={option.value.toString()}
                  ref={index === 0 ? firstOptionRef : undefined}
                  whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center text-sm
                    ${option.value === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-700'}
                    outline-none focus:bg-primary-50 focus:text-primary-700 focus:ring-1 focus:ring-primary-400
                    transition-colors duration-150 w-full
                  `}
                  onClick={() => handleOptionClick(option.value)}
                  onKeyDown={(e) => handleKeyDown(e, option.value)}
                  role="option"
                  aria-selected={option.value === value}
                  tabIndex={0}
                >
                  {option.icon && <span className="mr-2 flex-shrink-0">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </motion.li>
              );
              
              return option.tooltip ? (
                <Tooltip key={option.value.toString()} text={option.tooltip}>
                  {OptionItem}
                </Tooltip>
              ) : OptionItem;
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface SortOption<T> {
  label: string;
  value: keyof T | string;
  direction: 'asc' | 'desc';
}

export interface PageSizeOption {
  label: string;
  value: number;
}

export interface TableToolbarProps<T> {
  /**
   * Total number of records (total data size, not just current page)
   */
  totalRecords?: number;
  
  /**
   * Available sort options for the table
   */
  sortOptions?: SortOption<T>[];
  
  /**
   * Current sort option
   */
  currentSort?: SortOption<T>;
  
  /**
   * Handler for sort change
   */
  onSortChange?: (sortOption: SortOption<T>) => void;
  
  /**
   * Available page size options
   */
  pageSizeOptions?: PageSizeOption[];
  
  /**
   * Current page size
   */
  currentPageSize?: number;
  
  /**
   * Handler for page size change
   */
  onPageSizeChange?: (pageSize: number) => void;
  
  /**
   * Whether the table is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Additional classes for the toolbar container
   */
  className?: string;
}

/**
 * Table toolbar component for sorting, page size selection, and displaying record count
 */
function TableToolbar<T>({
  totalRecords,
  sortOptions = [],
  currentSort,
  onSortChange,
  pageSizeOptions = [
    { label: '10 per page', value: 10 },
    { label: '25 per page', value: 25 },
    { label: '50 per page', value: 50 },
    { label: '100 per page', value: 100 },
  ],
  currentPageSize = 10,
  onPageSizeChange,
  isLoading = false,
  className = '',
}: TableToolbarProps<T>) {
  // Add state for mobile filters toggle
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Format sort options for the dropdown
  const formattedSortOptions = sortOptions.map((option) => ({
    label: `${option.label} ${option.direction === 'asc' ? '↑' : '↓'}`,
    value: `${String(option.value)}_${option.direction}`,
    icon: option.direction === 'asc' 
      ? <SortAscendingIcon className="w-4 h-4 text-neutral-500" /> 
      : <SortDescendingIcon className="w-4 h-4 text-neutral-500" />,
    tooltip: `Sort by ${option.label} in ${option.direction === 'asc' ? 'ascending' : 'descending'} order`
  }));

  // Handler for sort change from dropdown
  const handleSortChange = (value: string | number) => {
    if (!onSortChange || !sortOptions.length) return;
    
    const selectedValue = value.toString();
    const selectedSortOption = sortOptions.find(
      option => `${String(option.value)}_${option.direction}` === selectedValue
    );
    
    if (selectedSortOption) {
      onSortChange(selectedSortOption);
    }
  };
    // Handler for page size change from dropdown
  const handlePageSizeChange = (value: string | number) => {
    if (!onPageSizeChange) return;
    const newPageSize = Number(value);
    
    // Save the page size preference to localStorage
    try {
      localStorage.setItem('tablePreferredPageSize', newPageSize.toString());
    } catch (e) {
      // Silently fail if localStorage is not available
    }
    
    onPageSizeChange(newPageSize);
  };
  
  // Load saved page size from localStorage when component mounts
  useEffect(() => {
    if (!onPageSizeChange) return;
    
    try {
      const savedPageSize = localStorage.getItem('tablePreferredPageSize');
      if (savedPageSize && pageSizeOptions.some(opt => opt.value === Number(savedPageSize))) {
        onPageSizeChange(Number(savedPageSize));
      }
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }, []);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1 
      }
    }
  };
  
  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Has any filters to show
  const hasFilters = (sortOptions.length > 0 && onSortChange) || (pageSizeOptions.length > 0 && onPageSizeChange);

  // Filters animation variants
  const filtersVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    }
  };
  
  return (    <motion.div
      className={`
        flex flex-col gap-4 mb-4 rounded-lg p-2 
        bg-white border-neutral-100 text-neutral-900
        border shadow-sm w-full max-w-full
        ${className}
      `}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      role="toolbar"
      aria-label="Table controls"
    ><div className="flex flex-wrap items-center justify-between gap-3">
        <motion.div className="flex items-center" variants={itemVariants}>
          {totalRecords !== undefined && (
            <Tooltip text={isLoading ? "Loading data..." : `Total of ${totalRecords.toLocaleString()} records in this view`}>            <motion.div
              className={`
                flex items-center px-3 py-1.5 rounded-md transition-colors duration-200
                bg-neutral-50 border-neutral-200 hover:bg-white hover:border-neutral-300
                border
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >              <TableIcon className="w-4 h-4 mr-2 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">
                {isLoading ? (
                  <Shimmer width={40} height={20} className="ml-1" />
                ) : (
                  <span className="tabular-nums">
                    {totalRecords.toLocaleString()}
                    <span className="font-normal hidden sm:inline-block ml-1 text-neutral-500">records</span>
                  </span>
                )}
              </span>
            </motion.div>
          </Tooltip>
        )}
      </motion.div>

        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          {hasFilters && (
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className={`
                sm:hidden p-2 rounded-md border transition-colors
                bg-white border-neutral-300 hover:bg-neutral-50
                ${showFiltersMobile ? 'bg-primary-50 border-primary-300 text-primary-600' : ''}
              `}
              aria-expanded={showFiltersMobile}
              aria-controls="mobile-filters"
            >
              <FilterIcon className={`w-5 h-5 ${showFiltersMobile ? 'text-primary-500' : 'text-neutral-500'}`} />
              <span className="sr-only">{showFiltersMobile ? 'Hide filters' : 'Show filters'}</span>
            </motion.button>
          )}

          {/* Desktop filters */}
          <div className="hidden sm:flex items-center gap-3">
            {sortOptions.length > 0 && onSortChange && (
              <motion.div variants={itemVariants}>
                <Dropdown
                  id="sort-select"
                  label="Sort by"
                  mobileLabel="Sort"
                  tooltip="Choose field and direction to sort data"
                  value={currentSort ? `${String(currentSort.value)}_${currentSort.direction}` : formattedSortOptions[0]?.value || ''}
                  options={formattedSortOptions}
                  onChange={handleSortChange}
                  disabled={isLoading}
                  className="min-w-[150px]"
                />
              </motion.div>
            )}
            
            {pageSizeOptions.length > 0 && onPageSizeChange && (
              <motion.div variants={itemVariants}>
                <Dropdown
                  id="page-size-select"
                  label="Show"
                  mobileLabel="Items"
                  tooltip="Select number of items to display per page"
                  value={currentPageSize}
                  options={pageSizeOptions.map(option => ({
                    label: option.label,
                    value: option.value,
                    tooltip: `Display ${option.value} items per page`
                  }))}
                  onChange={handlePageSizeChange}
                  disabled={isLoading}
                  className="sm:min-w-[120px]"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters (collapsible) */}
      {hasFilters && (
        <AnimatePresence>
          {showFiltersMobile && (
            <motion.div
              id="mobile-filters"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={filtersVariants}
              className="sm:hidden w-full"
            >
              <div className="flex flex-col gap-3 pt-2 border-t border-neutral-200">
                {sortOptions.length > 0 && onSortChange && (
                  <Dropdown
                    id="mobile-sort-select"
                    mobileLabel="Sort"
                    value={currentSort ? `${String(currentSort.value)}_${currentSort.direction}` : formattedSortOptions[0]?.value || ''}
                    options={formattedSortOptions}
                    onChange={handleSortChange}
                    disabled={isLoading}
                  />
                )}
                
                {pageSizeOptions.length > 0 && onPageSizeChange && (
                  <Dropdown
                    id="mobile-page-size-select"
                    mobileLabel="Items"
                    value={currentPageSize}
                    options={pageSizeOptions.map(option => ({
                      label: option.label,
                      value: option.value
                    }))}
                    onChange={handlePageSizeChange}
                    disabled={isLoading}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export default TableToolbar;
