import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input, { type InputProps } from '@/components/common/Input';
import Button from '@/components/common/Button';
import Calendar from '@/components/common/Calendar';

export interface DatePickerProps extends Omit<InputProps, 'onChange' | 'value'> {
  /**
   * Selected date
   */
  selected?: Date | null;
  
  /**
   * Callback when date changes
   */
  onChange?: (date: Date | null) => void;
  
  /**
   * Input date format (used for display)
   * @default "MM/dd/yyyy"
   */
  dateFormat?: string;
  
  /**
   * Placeholder text when no date is selected
   * @default "Select a date"
   */
  placeholderText?: string;
  
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  
  /**
   * Whether calendar opens on focus
   * @default true
   */
  openOnFocus?: boolean;
  
  /**
   * Whether to show the calendar icon
   * @default true
   */
  showIcon?: boolean;
  
  /**
   * Whether the calendar should show month/year dropdowns
   * @default false
   */
  showMonthYearDropdowns?: boolean;
  
  /**
   * Animation preset for the dropdown
   * @default "fade"
   */
  animationPreset?: 'fade' | 'scale' | 'slide';
  
  /**
   * Display mode
   * @default "input"
   */
  mode?: 'input' | 'static';
  
  /**
   * Function to determine if a date should be disabled
   */
  filterDate?: (date: Date) => boolean;
  
  /**
   * Whether to show today button
   * @default false
   */
  showTodayButton?: boolean;
  
  /**
   * Whether to show clear button
   * @default true
   */
  showClearButton?: boolean;
  
  /**
   * Today button text
   * @default "Today"
   */
  todayButtonText?: string;
  
  /**
   * Clear button text
   * @default "Clear"
   */
  clearButtonText?: string;
  
  /**
   * Position of the popup calendar
   * @default "bottom"
   */
  popperPlacement?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Whether to close the calendar on date select
   * @default true
   */
  closeOnSelect?: boolean;
  
  /**
   * Additional class for the calendar popup
   */
  calendarClassName?: string;
  
  /**
   * Whether to auto-focus the input on mount
   * @default false
   */
  autoFocus?: boolean;
}

/**
 * DatePicker component for selecting a single date
 * Uses a Calendar component with animation and enhanced UX features
 */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      selected,
      onChange,
      dateFormat = 'MM/dd/yyyy',
      placeholderText = 'Select a date',
      minDate,
      maxDate,
      openOnFocus = true,
      showIcon = true,
      showMonthYearDropdowns = false,
      animationPreset = 'fade',
      mode = 'input',
      filterDate,
      showTodayButton = false,
      showClearButton = true,
      todayButtonText = 'Today',
      clearButtonText = 'Clear',
      popperPlacement = 'bottom',
      closeOnSelect = true,
      calendarClassName = '',
      autoFocus = false,
      disabled = false,
      readOnly = false,
      // Input props
      size = 'md',
      fullWidth = true,
      error,
      className = '',
      ...restProps
    },
    ref
  ) => {
    // Internal refs
    const inputRef = useRef<HTMLInputElement>(null);
    const calendarContainerRef = useRef<HTMLDivElement>(null);
    
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [dateInputError, setDateInputError] = useState<string | undefined>(undefined);
    
    // Combine external and internal refs
    const combinedRef = (node: HTMLInputElement) => {
      // Apply forwarded ref if available
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      
      // Always update our internal ref
      inputRef.current = node;
    };
    
    // Format date for input display
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      
      try {
        // Implement date formatting based on dateFormat
        // For a real implementation, you might want to use a library like date-fns
        // This is a simple implementation
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        let result = dateFormat;
        result = result.replace('dd', day);
        result = result.replace('MM', month);
        result = result.replace('yyyy', year.toString());
        result = result.replace('yy', year.toString().substr(2, 2));
        
        return result;
      } catch (error) {
        return '';
      }
    };
    
    // Parse date from input string
    const parseDate = (value: string): Date | null => {
      if (!value) return null;
      
      try {
        // Try to parse the date based on the format
        // This is a basic implementation and might need adjustments based on format
        const parts = value.split(/[-/]/);
        
        if (dateFormat.indexOf('MM') === 0) {
          // MM/dd/yyyy format
          const month = parseInt(parts[0], 10) - 1;
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
          
          const date = new Date(year, month, day);
          
          // Validate that the date is valid
          if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null; // Invalid date
          }
          
          return date;
        } else if (dateFormat.indexOf('dd') === 0) {
          // dd/MM/yyyy format
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          
          if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
          
          const date = new Date(year, month, day);
          
          // Validate that the date is valid
          if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null; // Invalid date
          }
          
          return date;
        } else if (dateFormat.indexOf('yyyy') === 0) {
          // yyyy/MM/dd format
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          
          if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
          
          const date = new Date(year, month, day);
          
          // Validate that the date is valid
          if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null; // Invalid date
          }
          
          return date;
        }
        
        return null;
      } catch (error) {
        return null;
      }
    };

    // Update input value when selected date changes
    useEffect(() => {
      setInputValue(formatDate(selected || null));
    }, [selected, dateFormat]);
    
    // Handle clicking outside to close the calendar
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isOpen &&
          calendarContainerRef.current &&
          !calendarContainerRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);
    
    // Auto focus if enabled
    useEffect(() => {
      if (autoFocus && inputRef.current && !disabled && !readOnly) {
        inputRef.current.focus();
      }
    }, [autoFocus, disabled, readOnly]);

    // Handle calendar toggle
    const toggleCalendar = () => {
      if (!disabled && !readOnly) {
        setIsOpen(!isOpen);
      }
    };
    
    // Open calendar
    const openCalendar = () => {
      if (!disabled && !readOnly && openOnFocus) {
        setIsOpen(true);
      }
    };

    // Handle date selection from calendar
    const handleDateSelect = (date: Date) => {
      if (onChange) {
        onChange(date);
      }
      
      if (closeOnSelect) {
        setIsOpen(false);
      }
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      
      if (!value) {
        // Clear the date if input is cleared
        setDateInputError(undefined);
        if (onChange) {
          onChange(null);
        }
        return;
      }
      
      // Try to parse the date from input
      const parsedDate = parseDate(value);
      
      if (!parsedDate) {
        setDateInputError('Invalid date format');
        return;
      }
      
      // Check min/max date constraints
      if (minDate && parsedDate < minDate) {
        setDateInputError(`Date cannot be before ${formatDate(minDate)}`);
        return;
      }
      
      if (maxDate && parsedDate > maxDate) {
        setDateInputError(`Date cannot be after ${formatDate(maxDate)}`);
        return;
      }
      
      // Check if date should be filtered (disabled)
      if (filterDate && !filterDate(parsedDate)) {
        setDateInputError('This date is not available');
        return;
      }
      
      // Date is valid
      setDateInputError(undefined);
      if (onChange) {
        onChange(parsedDate);
      }
    };

    // Handle "Today" button click
    const handleTodayClick = () => {
      const today = new Date();
      
      // Check if today is selectable
      if (
        (minDate && today < minDate) ||
        (maxDate && today > maxDate) ||
        (filterDate && !filterDate(today))
      ) {
        setDateInputError('Today is not available');
        return;
      }
      
      if (onChange) {
        onChange(today);
      }
      
      if (closeOnSelect) {
        setIsOpen(false);
      }
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Handle "Clear" button click
    const handleClearClick = () => {
      if (onChange) {
        onChange(null);
      }
      
      setInputValue('');
      setDateInputError(undefined);
      
      if (closeOnSelect) {
        setIsOpen(false);
      }
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Calculate the calendar position
    const getCalendarPosition = () => {
      switch (popperPlacement) {
        case 'top':
          return 'bottom-full mb-1';
        case 'right':
          return 'left-full ml-1';
        case 'left':
          return 'right-full mr-1';
        case 'bottom':
        default:
          return 'top-full mt-1';
      }
    };

    // Calendar animation variants
    const calendarAnimationVariants = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } }
      },
      scale: {
        initial: { opacity: 0, scale: 0.95, transformOrigin: 'top center' },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
      },
      slide: {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
      }
    };

    // Generate calendar footer with buttons if needed
    const calendarFooter = (showTodayButton || showClearButton) ? (
      <div className="flex justify-end space-x-2">
        {showClearButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearClick}
            disabled={!selected}
          >
            {clearButtonText}
          </Button>
        )}
        {showTodayButton && (
          <Button
            size="sm"
            variant="primary"
            onClick={handleTodayClick}
          >
            {todayButtonText}
          </Button>
        )}
      </div>
    ) : null;
    
    // Input icon for calendar
    const calendarIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
    
    // Render static calendar mode
    if (mode === 'static') {
      return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
          <Calendar
            selectedDate={selected || undefined}
            onSelectDate={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            showMonthYearDropdowns={showMonthYearDropdowns}
            isDateDisabled={filterDate}
            animationPreset="fade"
            className={calendarClassName}
            footer={calendarFooter}
          />
        </div>
      );
    }
    
    // Render input mode with dropdown calendar
    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
        <Input
          {...restProps}
          ref={combinedRef}
          size={size}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={openCalendar}
          onBlur={() => setDateInputError(undefined)}
          onClick={toggleCalendar}
          placeholder={placeholderText}
          rightIcon={showIcon ? calendarIcon : undefined}
          disabled={disabled}
          readOnly={readOnly}
          error={dateInputError || error}
          fullWidth={fullWidth}
          aria-haspopup="true"
          aria-expanded={isOpen}
          role="combobox"
        />
                
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              ref={calendarContainerRef}
              className={`absolute z-50 w-72 ${getCalendarPosition()}`}
              variants={calendarAnimationVariants[animationPreset]}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Calendar
                selectedDate={selected || undefined}
                onSelectDate={handleDateSelect}
                minDate={minDate}
                maxDate={maxDate}
                showMonthYearDropdowns={showMonthYearDropdowns}
                isDateDisabled={filterDate}
                className={calendarClassName}
                animationPreset="fade" // Prevent double animation
                footer={calendarFooter}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;