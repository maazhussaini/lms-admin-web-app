import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input, { type InputProps } from '@/components/common/Input';
import Button from '@/components/common/Button';
import Calendar from '@/components/common/Calendar';

export interface DateRangePickerProps extends Omit<InputProps, 'onChange' | 'value'> {
  /**
   * Currently selected start date
   */
  startDate: Date | null;
  
  /**
   * Currently selected end date
   */
  endDate: Date | null;
  
  /**
   * Callback when date range changes
   */
  onChange?: (startDate: Date | null, endDate: Date | null) => void;
  
  /**
   * Input date format for display
   * @default "MM/dd/yyyy"
   */
  dateFormat?: string;
  
  /**
   * Placeholder text when no dates are selected
   * @default "Select date range"
   */
  placeholderText?: string;
  
  /**
   * Separator between start and end date in the input
   * @default " - "
   */
  rangeSeparator?: string;
  
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
   * Whether to show calendar icon
   * @default true
   */
  showIcon?: boolean;
  
  /**
   * Whether calendar should show month/year dropdowns
   * @default false
   */
  showMonthYearDropdowns?: boolean;
  
  /**
   * Animation preset for the dropdown
   * @default "fade"
   */
  animationPreset?: 'fade' | 'scale' | 'slide';
  
  /**
   * Display mode for the calendar
   * @default "input"
   */
  mode?: 'input' | 'static';
  
  /**
   * Function to determine if a date should be disabled
   */
  filterDate?: (date: Date) => boolean;
  
  /**
   * Whether to show the "Clear" button
   * @default true
   */
  showClearButton?: boolean;
  
  /**
   * Text for the clear button
   * @default "Clear"
   */
  clearButtonText?: string;
  
  /**
   * Whether to show "Apply" button to confirm selection
   * @default true
   */
  showApplyButton?: boolean;
  
  /**
   * Text for the apply button
   * @default "Apply"
   */
  applyButtonText?: string;
  
  /**
   * Position of the popup calendar
   * @default "bottom"
   */
  popperPlacement?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Whether to close the calendar on range selection
   * @default false
   */
  closeOnSelect?: boolean;
  
  /**
   * Additional class for the calendar popup
   */
  calendarClassName?: string;
  
  /**
   * Whether calendar should show in a single or double view
   * @default "double"
   */
  calendarView?: 'single' | 'double';
  
  /**
   * Whether to auto-focus the input on mount
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * Optional preset ranges (e.g., "Last 7 Days", "This Month")
   */
  presetRanges?: Array<{
    label: string;
    value: [Date, Date];
  }>;
}

/**
 * DateRangePicker component for selecting a range of dates
 * Uses Calendar component with animation and enhanced UX features
 */
const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(
  (
    {
      startDate,
      endDate,
      onChange,
      dateFormat = 'MM/dd/yyyy',
      placeholderText = 'Select date range',
      rangeSeparator = ' - ',
      minDate,
      maxDate,
      openOnFocus = true,
      showIcon = true,
      showMonthYearDropdowns = false,
      animationPreset = 'fade',
      mode = 'input',
      filterDate,
      showClearButton = true,
      clearButtonText = 'Clear',
      showApplyButton = true,
      applyButtonText = 'Apply',
      popperPlacement = 'bottom',
      closeOnSelect = false,
      calendarClassName = '',
      calendarView = 'double',
      autoFocus = false,
      presetRanges,
      // Input props
      disabled = false,
      readOnly = false,
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
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate ?? null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate ?? null);
    
    // Format date for input display
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      
      try {
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

    // Format date range for display in the input
    const formatDateRange = (start: Date | null, end: Date | null): string => {
      if (!start && !end) return '';
      if (start && !end) return formatDate(start);
      if (!start && end) return formatDate(end);
      
      return `${formatDate(start)}${rangeSeparator}${formatDate(end)}`;
    };

    // Update input value when selected dates change
    useEffect(() => {
      setInputValue(formatDateRange(startDate, endDate));
      // Also update temp dates used for preview
      if (startDate !== tempStartDate) setTempStartDate(startDate);
      if (endDate !== tempEndDate) setTempEndDate(endDate);
    }, [startDate, endDate, dateFormat, rangeSeparator]);

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
          handleClose();
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
    
    // Combine external and internal refs
    const combinedRef = (node: HTMLInputElement) => {
      // Apply forwarded ref if available
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      
      // Always update our internal ref
      inputRef.current = node;
    };

    // Handle calendar toggle
    const toggleCalendar = () => {
      if (!disabled && !readOnly) {
        if (!isOpen) {
          openCalendar();
        } else {
          handleClose();
        }
      }
    };
    
    // Open calendar
    const openCalendar = () => {
      if (!disabled && !readOnly && openOnFocus) {
        setTempStartDate(startDate);
        setTempEndDate(endDate);
        setIsOpen(true);
      }
    };
    
    // Close the calendar
    const handleClose = () => {
      // Reset temporary dates if the selection wasn't applied
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setHoverDate(null);
      setIsOpen(false);
    };

    // Apply the selected date range
    const handleApply = () => {
      if (onChange) {
        onChange(tempStartDate, tempEndDate);
      }
      
      setIsOpen(false);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Clear the selected date range
    const handleClear = () => {
      setTempStartDate(null);
      setTempEndDate(null);
      
      if (onChange) {
        onChange(null, null);
      }
      
      if (closeOnSelect) {
        setIsOpen(false);
      }
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Handle date selection from calendar
    const handleDateSelect = (date: Date) => {
      // If no start date is selected or both dates are selected, set start date
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        setTempStartDate(date);
        setTempEndDate(null);
      }
      // If only start date is selected, set end date
      else if (tempStartDate && !tempEndDate) {
        // Ensure start date is before end date
        if (date < tempStartDate) {
          setTempEndDate(tempStartDate);
          setTempStartDate(date);
        } else {
          setTempEndDate(date);
        }
        
        // Apply selection immediately if closeOnSelect is true
        if (closeOnSelect && onChange) {
          onChange(
            date < tempStartDate ? date : tempStartDate,
            date < tempStartDate ? tempStartDate : date
          );
          setIsOpen(false);
        }
      }
    };
    
    // Handle date hover for preview range selection
    const handleDateHover = (date: Date | null) => {
      setHoverDate(date);
    };
    
    // Handle preset range selection
    const handlePresetRangeSelect = (range: [Date, Date]) => {
      setTempStartDate(range[0]);
      setTempEndDate(range[1]);
      
      if (closeOnSelect) {
        if (onChange) {
          onChange(range[0], range[1]);
        }
        setIsOpen(false);
      }
    };
    
    // Calculate the calendar position based on popperPlacement
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
    
    // Calculate width class based on calendar view
    const getCalendarWidthClass = () => {
      return calendarView === 'double' ? 'w-[620px]' : 'w-[310px]';
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
    
    // Input icon for calendar
    const calendarIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
    
    // For double calendar view, calculate the next month date for the second calendar
    const getSecondCalendarDate = () => {
      if (!tempStartDate && !tempEndDate) {
        // If no dates are selected, show current month and next month
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        return nextMonth;
      }
      
      // If dates are selected, base the view on the selected range
      const baseDate = tempStartDate || new Date();
      const nextMonth = new Date(baseDate);
      nextMonth.setMonth(baseDate.getMonth() + 1);
      return nextMonth;
    };
    
    // Handle calendar view changes and sync between the two calendars in double view
    const handleCalendarViewChange = (date: Date, calendarIndex: number) => {
      // If in double view, ensure second calendar is always one month ahead
      if (calendarView === 'double' && calendarIndex === 0) {
        // First calendar changed, adjust second calendar to be one month ahead
        const nextMonth = new Date(date);
        nextMonth.setMonth(date.getMonth() + 1);
        // You would need to update the viewDate prop of the second calendar
      } else if (calendarView === 'double' && calendarIndex === 1) {
        // Second calendar changed, adjust first calendar to be one month behind
        const prevMonth = new Date(date);
        prevMonth.setMonth(date.getMonth() - 1);
        // You would need to update the viewDate prop of the first calendar
      }
    };
    
    // Generate calendar footer with buttons
    const calendarFooter = (
      <div className="flex justify-end space-x-2">
        {showClearButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            disabled={!tempStartDate && !tempEndDate}
          >
            {clearButtonText}
          </Button>
        )}
        {showApplyButton && (
          <Button
            size="sm"
            variant="primary"
            onClick={handleApply}
            disabled={!tempStartDate} // Disable Apply if there's no selection
          >
            {applyButtonText}
          </Button>
        )}
      </div>
    );
    
    // Render static calendar mode
    if (mode === 'static') {
      return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
          <div className={`flex ${calendarView === 'double' ? 'space-x-4' : ''}`}>
            <Calendar
              selectedDates={tempStartDate || tempEndDate ? 
                [
                  ...(tempStartDate ? [tempStartDate] : []),
                  ...(tempEndDate ? [tempEndDate] : [])
                ] : []}
              onSelectDate={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
              showMonthYearDropdowns={showMonthYearDropdowns}
              isDateDisabled={filterDate}
              animationPreset="fade"
              className={`${calendarClassName}`}
              hoverDate={hoverDate}
              onDateHover={handleDateHover}
              onViewChange={(date) => handleCalendarViewChange(date, 0)}
            />
            
            {calendarView === 'double' && (
              <Calendar
                selectedDates={tempStartDate || tempEndDate ? 
                  [
                    ...(tempStartDate ? [tempStartDate] : []),
                    ...(tempEndDate ? [tempEndDate] : [])
                  ] : []}
                onSelectDate={handleDateSelect}
                minDate={minDate}
                maxDate={maxDate}
                showMonthYearDropdowns={showMonthYearDropdowns}
                isDateDisabled={filterDate}
                animationPreset="fade"
                className={`${calendarClassName}`}
                hoverDate={hoverDate}
                onDateHover={handleDateHover}
                viewDate={getSecondCalendarDate()}
                onViewChange={(date) => handleCalendarViewChange(date, 1)}
              />
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-neutral-200">
            {calendarFooter}
          </div>
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
          onChange={() => {}} // We're not supporting manual date entry in the range picker for now
          onFocus={openCalendar}
          onClick={toggleCalendar}
          placeholder={placeholderText}
          rightIcon={showIcon ? calendarIcon : undefined}
          disabled={disabled}
          readOnly={true} // Force read-only for now
          error={error}
          fullWidth={fullWidth}
          aria-haspopup="true"
          aria-expanded={isOpen}
          role="combobox"
        />
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              ref={calendarContainerRef}
              className={`absolute z-50 ${getCalendarWidthClass()} ${getCalendarPosition()} bg-white rounded-lg shadow-lg`}
              variants={calendarAnimationVariants[animationPreset]}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="p-4">
                {/* Preset ranges if provided */}
                {presetRanges && presetRanges.length > 0 && (
                  <div className="mb-4 border-b border-neutral-200 pb-3">
                    <div className="text-sm font-medium text-neutral-700 mb-2">
                      Preset Ranges
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {presetRanges.map((range, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => handlePresetRangeSelect(range.value)}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Selected date range display */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Selected Range:</div>
                    <div className="font-medium">
                      {tempStartDate || tempEndDate ? (
                        <span>
                          {tempStartDate ? formatDate(tempStartDate) : 'Start date'} 
                          {' '}&rarr;{' '} 
                          {tempEndDate ? formatDate(tempEndDate) : 'End date'}
                        </span>
                      ) : (
                        <span className="text-neutral-500">No date range selected</span>
                      )}
                    </div>
                  </div>
                  {(tempStartDate || tempEndDate) && (
                    <Button 
                      size="xs" 
                      variant="ghost"
                      onClick={handleClear}
                      className="text-neutral-500"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                {/* Calendar(s) */}
                <div className={`flex ${calendarView === 'double' ? 'space-x-4' : ''}`}>
                  <Calendar
                    selectedDates={tempStartDate || tempEndDate ? 
                      [
                        ...(tempStartDate ? [tempStartDate] : []),
                        ...(tempEndDate ? [tempEndDate] : [])
                      ] : []}
                    onSelectDate={handleDateSelect}
                    minDate={minDate}
                    maxDate={maxDate}
                    showMonthYearDropdowns={showMonthYearDropdowns}
                    isDateDisabled={filterDate}
                    animationPreset="fade"
                    className={`${calendarClassName}`}
                    hoverDate={hoverDate}
                    onDateHover={handleDateHover}
                    onViewChange={(date) => handleCalendarViewChange(date, 0)}
                  />
                  
                  {calendarView === 'double' && (
                    <Calendar
                      selectedDates={tempStartDate || tempEndDate ? 
                        [
                          ...(tempStartDate ? [tempStartDate] : []),
                          ...(tempEndDate ? [tempEndDate] : [])
                        ] : []}
                      onSelectDate={handleDateSelect}
                      minDate={minDate}
                      maxDate={maxDate}
                      showMonthYearDropdowns={showMonthYearDropdowns}
                      isDateDisabled={filterDate}
                      animationPreset="fade"
                      className={`${calendarClassName}`}
                      hoverDate={hoverDate}
                      onDateHover={handleDateHover}
                      viewDate={getSecondCalendarDate()}
                      onViewChange={(date) => handleCalendarViewChange(date, 1)}
                    />
                  )}
                </div>
                
                {/* Footer with buttons */}
                <div className="mt-4 pt-3 border-t border-neutral-200">
                  {calendarFooter}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DateRangePicker.displayName = 'DateRangePicker';

export default DateRangePicker;