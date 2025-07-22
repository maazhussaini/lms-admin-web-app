/**
 * Utility functions for date and time formatting
 */

/**
 * Format date to "Month Year" format (e.g., "May 2025")
 * @param date Date to format (can be Date object, string, or null)
 * @returns Formatted date string or null if date is null/invalid
 */
export function formatDateToMonthYear(date: Date | string | null): string | null {
  if (!date) {
    return null;
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${month} ${year}`;
  } catch (error) {
    return null;
  }
}

/**
 * Format date range to "Month Year" format
 * @param startDate Start date
 * @param endDate End date
 * @returns Object with formatted start and end dates
 */
export function formatDateRange(
  startDate: Date | string | null,
  endDate: Date | string | null
): { start_date: string | null; end_date: string | null } {
  return {
    start_date: formatDateToMonthYear(startDate),
    end_date: formatDateToMonthYear(endDate)
  };
}

/**
 * Format decimal hours to "X hrs Y min" format
 * @param decimalHours Decimal hours (e.g., 1.25 = 1 hour 15 minutes)
 * @returns Formatted string (e.g., "1 hr 15 min", "30 min", "2 hrs") or null if invalid
 */
export function formatDecimalHours(decimalHours: number | null): string | null {
  if (decimalHours === null || decimalHours === undefined || isNaN(decimalHours)) {
    return null;
  }

  // Convert decimal to total minutes
  const totalMinutes = Math.round(decimalHours * 60);
  
  if (totalMinutes <= 0) {
    return null;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(hours === 1 ? '1 hr' : `${hours} hrs`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  return parts.length > 0 ? parts.join(' ') : null;
}
