import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import clsx from 'clsx';
import Button from '@/components/common/Button';

export interface CalendarProps {
  /**
   * Selected date
   */
  selectedDate?: Date;
  
  /**
   * Multiple selected dates (for range picker)
   */
  selectedDates?: Date[];
  
  /**
   * Callback when a date is selected
   */
  onSelectDate?: (date: Date) => void;
  
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Animation preset for the calendar
   * @default "fade"
   */
  animationPreset?: 'fade' | 'slide' | 'scale';
  
  /**
   * Whether to show month and year dropdowns for quick navigation
   * @default false
   */
  showMonthYearDropdowns?: boolean;
  
  /**
   * Function to determine if a date should be disabled
   */
  isDateDisabled?: (date: Date) => boolean;
  
  /**
   * Function to add custom classes to specific dates
   */
  dayClassName?: (date: Date) => string;
  
  /**
   * Whether a date is being hovered (for range selection)
   */
  hoverDate?: Date | null;
  
  /**
   * Handler for date hover events (for range selection)
   */
  onDateHover?: (date: Date | null) => void;
  
  /**
   * Additional footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Currently viewed month/year
   */
  viewDate?: Date;
  
  /**
   * Callback when view changes (month/year navigation)
   */
  onViewChange?: (date: Date) => void;
}

/**
 * Calendar component for displaying and selecting dates
 * Used by DatePicker and DateRangePicker but can be used standalone
 */
const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  selectedDates = [],
  onSelectDate,
  minDate,
  maxDate,
  className = '',
  animationPreset = 'fade',
  showMonthYearDropdowns = false,
  isDateDisabled,
  dayClassName,
  hoverDate,
  onDateHover,
  footer,
  viewDate: externalViewDate,
  onViewChange,
}) => {
  // Track internally which month/year is being displayed
  const [internalViewDate, setInternalViewDate] = useState(() => {
    // If there's a selected date, start there
    if (selectedDate) return selectedDate;
    // If there are selected dates (range), use the first one
    if (selectedDates.length > 0) return selectedDates[0];
    // Otherwise use today
    return new Date();
  });
  
  // Use external viewDate if provided, otherwise use internal state
  const viewDate = externalViewDate || internalViewDate;
  
  // Animation variants for different animation presets
  const calendarVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, transition: { duration: 0.2 } }
    },
    slide: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    }
  };

  // Month navigation
  const navigateMonth = (step: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + step);
    
    if (onViewChange) {
      onViewChange(newDate);
    } else {
      setInternalViewDate(newDate);
    }
  };

  // Handler for prev/next month buttons
  const goToPrevMonth = () => navigateMonth(-1);
  const goToNextMonth = () => navigateMonth(1);
  
  // Month and year options for dropdowns
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1); // Year doesn't matter here
      return {
        value: i,
        label: date.toLocaleString('default', { month: 'long' }),
      };
    });
  }, []);
  
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = minDate ? minDate.getFullYear() : currentYear - 100;
    const maxYear = maxDate ? maxDate.getFullYear() : currentYear + 100;
    
    return Array.from(
      { length: maxYear - minYear + 1 },
      (_, i) => ({
        value: minYear + i,
        label: String(minYear + i),
      })
    );
  }, [minDate, maxDate]);

  // Handle dropdown changes
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(parseInt(e.target.value, 10));
    
    if (onViewChange) {
      onViewChange(newDate);
    } else {
      setInternalViewDate(newDate);
    }
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(parseInt(e.target.value, 10));
    
    if (onViewChange) {
      onViewChange(newDate);
    } else {
      setInternalViewDate(newDate);
    }
  };

  // Generate days of the month to display
  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysCount = lastDay.getDate();
    
    // Calculate days from previous month to fill first row
    const firstDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const prevMonthDays = [];
    
    if (firstDayOfWeek > 0) { // If month doesn't start on Sunday, add prev month days
      const prevMonth = new Date(year, month, 0);
      const prevMonthDaysCount = prevMonth.getDate();
      
      for (let i = 0; i < firstDayOfWeek; i++) {
        const day = prevMonthDaysCount - firstDayOfWeek + i + 1;
        const date = new Date(year, month - 1, day);
        prevMonthDays.push({ date, isPrevMonth: true });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      currentMonthDays.push({ date, isCurrentMonth: true });
    }
    
    // Next month days to fill last row
    const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalDaysSoFar; // 6 rows, 7 days per row
    const nextMonthDays = [];
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      nextMonthDays.push({ date, isNextMonth: true });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [viewDate]);

  // Check if a specific date is selected
  const isDateSelected = useCallback((date: Date) => {
    if (selectedDate) {
      return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    }
    
    if (selectedDates.length > 0) {
      return selectedDates.some(
        (selectedDate) =>
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()
      );
    }
    
    return false;
  }, [selectedDate, selectedDates]);

  // Check if a date is the hovered date (for range selection)
  const isDateHovered = useCallback((date: Date) => {
    if (!hoverDate) return false;
    
    return (
      date.getDate() === hoverDate.getDate() &&
      date.getMonth() === hoverDate.getMonth() &&
      date.getFullYear() === hoverDate.getFullYear()
    );
  }, [hoverDate]);

  // Check if a date is in the hovered range (between start date and hover date)
  const isDateInHoveredRange = useCallback((date: Date) => {
    if (!hoverDate || selectedDates.length !== 1) return false;
    
    const startDate = selectedDates[0];
    const isAfterStart = date.getTime() >= startDate.getTime();
    const isBeforeHover = date.getTime() <= hoverDate.getTime();
    const isBeforeStart = date.getTime() <= startDate.getTime();
    const isAfterHover = date.getTime() >= hoverDate.getTime();
    
    return (
      (isAfterStart && isBeforeHover) || 
      (isBeforeStart && isAfterHover)
    );
  }, [hoverDate, selectedDates]);

  // Check if a date is in selected range
  const isDateInSelectedRange = useCallback((date: Date) => {
    if (selectedDates.length !== 2) return false;
    
    const [start, end] = selectedDates;
    return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
  }, [selectedDates]);

  // Check if a date is the start or end of a selected range
  const isRangeStartOrEnd = useCallback((date: Date) => {
    if (selectedDates.length === 0) return false;
    
    return selectedDates.some(
      (selectedDate) =>
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
    );
  }, [selectedDates]);

  // Check if a date is disabled
  const isDisabled = useCallback((date: Date) => {
    if (isDateDisabled && isDateDisabled(date)) return true;
    
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return false;
  }, [isDateDisabled, minDate, maxDate]);

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;
    
    if (onSelectDate) {
      onSelectDate(date);
    }
  };

  // Handle date hover (for range selection)
  const handleDateMouseEnter = (date: Date) => {
    if (isDisabled(date)) return;
    
    if (onDateHover) {
      onDateHover(date);
    }
  };
  
  const handleDateMouseLeave = () => {
    if (onDateHover) {
      onDateHover(null);
    }
  };

  // Names of weekdays for header
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(2021, 0, 3 + i); // Jan 3, 2021 was a Sunday
      days.push(date.toLocaleString('default', { weekday: 'short' }));
    }
    return days;
  }, []);

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md p-4 ${className}`}
      variants={calendarVariants[animationPreset]}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevMonth}
          aria-label="Previous month"
          className="text-neutral-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        
        {showMonthYearDropdowns ? (
          <div className="flex space-x-2">
            <select
              className="text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={viewDate.getMonth()}
              onChange={handleMonthChange}
              aria-label="Select month"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              className="text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={viewDate.getFullYear()}
              onChange={handleYearChange}
              aria-label="Select year"
            >
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <h2 className="text-base font-medium text-neutral-800">
            {viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h2>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="text-neutral-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
      
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-neutral-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map(({ date, isCurrentMonth }, index) => {
          // Calculate various states for the day
          const isSelected = isDateSelected(date);
          const isCurrentDay = isSameDay(date, new Date());
          const hovered = isDateHovered(date);
          const inHoveredRange = isDateInHoveredRange(date);
          const inSelectedRange = isDateInSelectedRange(date);
          const isRangeEdge = isRangeStartOrEnd(date);
          const disabled = isDisabled(date);
          const customClass = dayClassName?.(date) || '';

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => handleDateMouseEnter(date)}
              onMouseLeave={handleDateMouseLeave}
              disabled={disabled}
              className={clsx(
                'p-2 text-sm rounded-md transition-colors',
                !isCurrentMonth && 'text-neutral-400',
                isSelected && 'bg-primary-100 text-primary-700',
                isCurrentDay && !isSelected && 'bg-neutral-100',
                inSelectedRange && !isSelected && 'bg-primary-50',
                inHoveredRange && !isSelected && !inSelectedRange && 'bg-neutral-50',
                hovered && !isSelected && 'bg-neutral-100',
                isRangeEdge && 'ring-2 ring-primary-500',
                disabled && 'opacity-50 cursor-not-allowed',
                !isSelected && !isCurrentDay && !disabled && 'hover:bg-neutral-50',
                customClass
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
      
      {/* Optional footer */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Calendar;