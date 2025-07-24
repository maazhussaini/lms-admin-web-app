/**
 * @file utils/courseUIUtils.ts
 * @description Course UI utility functions
 * Re-exports shared utilities and provides legacy compatibility
 * 
 * @deprecated Most functions in this file are deprecated.
 * Use @shared/utils directly for new code.
 */

// Import from shared utilities
import {
  formatDurationFromHours,
  getInstructorAvatarUrl as sharedGetInstructorAvatarUrl,
  generatePurchaseStatusText as sharedGeneratePurchaseStatusText,
  calculateProgressPercentage,
  getProgressStatus,
  formatProgressText,
  truncateText,
  capitalizeWords,
  type CourseType,
  type PurchaseStatus,
} from '@shared/utils';

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
 * 
 * @deprecated Use formatDurationFromHours from @shared/utils instead
 */
export function formatCourseDuration(hours?: number | null): string {
  return formatDurationFromHours(hours, 'course');
}

/**
 * Generate instructor avatar URL or placeholder
 * 
 * @param instructorName - Name of the instructor
 * @param avatarUrl - Optional avatar URL
 * @returns Avatar URL (either provided URL or generated placeholder)
 * 
 * @deprecated Use getInstructorAvatarUrl from @shared/utils instead
 */
export function getInstructorAvatarUrl(instructorName: string, avatarUrl?: string): string {
  return sharedGetInstructorAvatarUrl(instructorName, avatarUrl, {
    background: AVATAR_PLACEHOLDER_CONFIG.background,
    color: AVATAR_PLACEHOLDER_CONFIG.color,
    bold: AVATAR_PLACEHOLDER_CONFIG.bold,
    format: AVATAR_PLACEHOLDER_CONFIG.format,
  });
}

/**
 * Generate purchase status text based on course details
 * 
 * @param courseType - Type of course (FREE/PAID/PURCHASED)
 * @param coursePrice - Price of the course
 * @param isPurchased - Whether the course is purchased
 * @returns Purchase status text
 * 
 * @deprecated Use generatePurchaseStatusText from @shared/utils instead
 */
export function generatePurchaseStatusText(
  courseType: 'FREE' | 'PAID' | 'PURCHASED',
  coursePrice?: number,
  isPurchased?: boolean
): string {
  // Handle legacy courseType format
  if (courseType === 'PURCHASED' || isPurchased) return 'Purchased';
  
  const normalizedCourseType = courseType === 'FREE' ? 'FREE' : 'PAID';
  return sharedGeneratePurchaseStatusText(normalizedCourseType, coursePrice, isPurchased);
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
 * Get CSS class for purchase status badge using boolean flags (more reliable)
 * 
 * @param isPurchased - Whether the course is purchased
 * @param isFree - Whether the course is free
 * @returns CSS class name for styling
 */
export function getPurchaseStatusClassFromFlags(isPurchased: boolean, isFree: boolean): string {
  if (isFree) {
    return PURCHASE_STATUS_CLASSES.FREE;
  }
  
  if (isPurchased) {
    return PURCHASE_STATUS_CLASSES.PURCHASED;
  }
  
  // Paid but not purchased
  return PURCHASE_STATUS_CLASSES.BUY;
}

/**
 * Get CSS class for progress bar based on percentage
 * 
 * @param percentage - Progress percentage (0-100)
 * @returns CSS class name
 */
export function getProgressBarClass(percentage: number): string {
  const status = getProgressStatus(percentage);
  switch (status) {
    case 'complete':
      return PROGRESS_BAR_CLASSES.COMPLETE;
    case 'active':
      return PROGRESS_BAR_CLASSES.ACTIVE;
    default:
      return PROGRESS_BAR_CLASSES.NEUTRAL;
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

// Re-export shared utilities for convenience
export {
  calculateProgressPercentage,
  getProgressStatus,
  formatProgressText,
  truncateText,
  capitalizeWords,
  formatDurationFromHours,
  type CourseType,
  type PurchaseStatus,
};
