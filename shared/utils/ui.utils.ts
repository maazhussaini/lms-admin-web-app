/**
 * @file shared/utils/ui.utils.ts
 * @description Shared UI utility functions across applications
 * Common UI helpers that can be used by multiple frontends
 */

/**
 * Avatar configuration for placeholder generation
 */
export interface AvatarConfig {
  background?: string;
  color?: string;
  bold?: boolean;
  format?: 'svg' | 'png';
  size?: number;
}

/**
 * Default avatar configuration
 */
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  background: 'ffc0cb', // Pink background
  color: 'fff',          // White text
  bold: true,
  format: 'svg',
  size: 150,
} as const;

/**
 * Generate instructor avatar URL with fallback to placeholder
 * 
 * @param instructorName - Name of the instructor
 * @param avatarUrl - Optional avatar URL
 * @param config - Optional avatar configuration
 * @returns Avatar URL (either provided URL or generated placeholder)
 * 
 * @example
 * getInstructorAvatarUrl("John Doe") => "https://ui-avatars.com/api/?name=John+Doe&..."
 * getInstructorAvatarUrl("John Doe", "https://example.com/avatar.jpg") => "https://example.com/avatar.jpg"
 */
export function getInstructorAvatarUrl(
  instructorName: string,
  avatarUrl?: string | null,
  config: Partial<AvatarConfig> = {}
): string {
  // Return existing avatar URL if provided
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl;
  }

  // Generate placeholder avatar
  const finalConfig = { ...DEFAULT_AVATAR_CONFIG, ...config };
  const encodedName = encodeURIComponent(instructorName || 'Unknown');
  
  const params = new URLSearchParams({
    name: encodedName,
    background: finalConfig.background!,
    color: finalConfig.color!,
    bold: finalConfig.bold!.toString(),
    format: finalConfig.format!,
    size: finalConfig.size!.toString(),
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Purchase status types
 */
export type PurchaseStatus = 'PURCHASED' | 'FREE' | 'PAID';
export type CourseType = 'FREE' | 'PAID';

/**
 * Generate purchase status text based on course details
 * 
 * @param courseType - Type of course (FREE/PAID)
 * @param coursePrice - Price of the course
 * @param isPurchased - Whether the course is purchased
 * @returns Purchase status text
 * 
 * @example
 * generatePurchaseStatusText('FREE', 0, false) => 'Free'
 * generatePurchaseStatusText('PAID', 99, false) => 'Buy: $99'
 * generatePurchaseStatusText('PAID', 99, true) => 'Purchased'
 */
export function generatePurchaseStatusText(
  courseType: CourseType,
  coursePrice?: number | null,
  isPurchased?: boolean
): string {
  if (isPurchased) return 'Purchased';
  if (courseType === 'FREE') return 'Free';
  if (courseType === 'PAID' && coursePrice) return `Buy: $${coursePrice}`;
  return 'Unknown';
}

/**
 * Get purchase status for styling
 * 
 * @param courseType - Type of course
 * @param isPurchased - Whether purchased
 * @returns Purchase status for styling
 */
export function getPurchaseStatus(
  courseType: CourseType,
  isPurchased?: boolean
): PurchaseStatus {
  if (isPurchased) return 'PURCHASED';
  if (courseType === 'FREE') return 'FREE';
  return 'PAID';
}

/**
 * Progress calculation utilities
 */

/**
 * Calculate progress percentage
 * 
 * @param completed - Number of completed items
 * @param total - Total number of items
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  const percentage = (completed / total) * 100;
  return Math.round(Math.min(100, Math.max(0, percentage)));
}

/**
 * Get progress status for styling
 * 
 * @param percentage - Progress percentage (0-100)
 * @returns Progress status
 */
export function getProgressStatus(percentage: number): 'neutral' | 'active' | 'complete' {
  if (percentage >= 100) return 'complete';
  if (percentage > 0) return 'active';
  return 'neutral';
}

/**
 * Format progress text
 * 
 * @param completed - Number of completed items
 * @param total - Total number of items
 * @param unit - Unit name (singular)
 * @returns Formatted progress text
 * 
 * @example
 * formatProgressText(5, 10, 'lesson') => "5 of 10 lessons"
 * formatProgressText(1, 1, 'video') => "1 of 1 video"
 */
export function formatProgressText(completed: number, total: number, unit: string): string {
  const pluralUnit = total === 1 ? unit : `${unit}s`;
  return `${completed} of ${total} ${pluralUnit}`;
}

/**
 * Text transformation utilities
 */

/**
 * Truncate text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of each word
 * 
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * URL and navigation utilities
 */

/**
 * Build course URL path
 * 
 * @param courseId - Course ID
 * @param moduleId - Optional module ID
 * @param topicId - Optional topic ID
 * @param videoId - Optional video ID
 * @returns URL path
 */
export function buildCourseUrl(
  courseId: string | number,
  moduleId?: string | number,
  topicId?: string | number,
  videoId?: string | number
): string {
  let path = `/course/${courseId}`;
  
  if (moduleId) {
    path += `/module/${moduleId}`;
    if (topicId) {
      path += `/topic/${topicId}`;
      if (videoId) {
        path += `/video/${videoId}`;
      }
    }
  }
  
  return path;
}

/**
 * Parse numeric ID from string
 * 
 * @param id - ID as string or number
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed numeric ID
 */
export function parseNumericId(id: string | number | undefined, fallback: number = 0): number {
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Validation utilities
 */

/**
 * Check if email is valid format
 * 
 * @param email - Email string
 * @returns Whether email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if URL is valid
 * 
 * @param url - URL string
 * @returns Whether URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
