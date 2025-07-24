/**
 * @file utils/courseUIUtils.ts
 * @description Utility functions for course UI components
 * Centralizes common UI logic and formatting
 */

import { 
  PURCHASE_STATUS_CLASSES, 
  PROGRESS_BAR_CLASSES, 
  AVATAR_PLACEHOLDER_CONFIG 
} from '@/constants/courseUI.constants';

/**
 * Format duration for display to match design exactly
 * 
 * @param hours - Duration in hours (can be null/undefined)
 * @returns Formatted duration string
 */
export function formatCourseDuration(hours?: number | null): string {
  if (!hours) return 'Duration TBD';
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes} Min`;
  }
  
  if (minutes === 0) {
    return `${wholeHours} Hrs`;
  }
  
  return `${wholeHours} Hrs ${minutes} Min`;
}

/**
 * Generate instructor avatar URL or placeholder
 * 
 * @param instructorName - Name of the instructor
 * @param avatarUrl - Optional avatar URL
 * @returns Avatar URL (real or generated placeholder)
 */
export function getInstructorAvatarUrl(instructorName: string, avatarUrl?: string): string {
  if (avatarUrl) {
    return avatarUrl;
  }
  
  const { background, color, bold, format } = AVATAR_PLACEHOLDER_CONFIG;
  const params = new URLSearchParams({
    name: instructorName,
    background,
    color,
    bold: bold.toString(),
    format,
  });
  
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Get CSS class for purchase status badge
 * 
 * @param statusText - Purchase status text
 * @param isFree - Whether the course is free (fallback)
 * @returns CSS class name for styling
 */
export function getPurchaseStatusClass(statusText?: string, isFree: boolean = true): string {
  if (!statusText) {
    statusText = isFree ? 'Free' : 'Paid';
  }
  
  if (statusText === 'Purchased') {
    return PURCHASE_STATUS_CLASSES.PURCHASED;
  }
  
  if (statusText.startsWith('Buy:')) {
    return PURCHASE_STATUS_CLASSES.BUY;
  }
  
  // Free or default
  return PURCHASE_STATUS_CLASSES.FREE;
}

/**
 * Get CSS class for progress bar based on completion percentage
 * 
 * @param percentage - Completion percentage (0-100)
 * @returns CSS class name for progress bar styling
 */
export function getProgressBarClass(percentage: number): string {
  if (percentage <= 0) {
    return PROGRESS_BAR_CLASSES.NEUTRAL;
  } else if (percentage >= 100) {
    return PROGRESS_BAR_CLASSES.COMPLETE;
  } else {
    return PROGRESS_BAR_CLASSES.ACTIVE;
  }
}

/**
 * Format course dates for display
 * 
 * @param startDate - Course start date
 * @param endDate - Course end date
 * @returns Formatted date range string
 */
export function formatCourseDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return 'Dates TBD';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Generate purchase status text based on course data
 * 
 * @param courseType - Type of course (FREE/PAID/PURCHASED)
 * @param coursePrice - Price of the course
 * @param isPurchased - Whether the course is purchased
 * @returns Purchase status text for display
 */
export function generatePurchaseStatusText(
  courseType: 'FREE' | 'PAID' | 'PURCHASED',
  coursePrice?: number,
  isPurchased?: boolean
): string {
  if (courseType === 'FREE') return 'Free';
  if (courseType === 'PURCHASED' || isPurchased) return 'Purchased';
  if (courseType === 'PAID' && coursePrice) return `Buy: $${coursePrice}`;
  return 'Paid';
}
