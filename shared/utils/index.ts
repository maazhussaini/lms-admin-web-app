/**
 * @file shared/utils/index.ts
 * @description Re-exports for shared utilities
 * Central access point for all shared utilities
 */

// Duration utilities
export {
  formatDurationFromSeconds,
  formatDurationFromHours,
  formatDurationFromMinutes,
  parseDurationToSeconds,
  // Legacy compatibility exports
  formatCourseDuration,
  formatDuration,
  type DurationFormat,
} from './duration.utils';

// UI utilities
export {
  getInstructorAvatarUrl,
  generatePurchaseStatusText,
  getPurchaseStatus,
  calculateProgressPercentage,
  getProgressStatus,
  formatProgressText,
  truncateText,
  capitalizeWords,
  buildCourseUrl,
  parseNumericId,
  isValidEmail,
  isValidUrl,
  DEFAULT_AVATAR_CONFIG,
  type AvatarConfig,
  type PurchaseStatus as UIPurchaseStatus,
  type CourseType as UICourseType,
} from './ui.utils';

// Constants
export {
  COURSE_CONSTANTS,
  UI_CONSTANTS,
  CONTENT_CONSTANTS,
  API_CONSTANTS,
  VALIDATION_CONSTANTS,
  DATE_CONSTANTS,
  ERROR_CONSTANTS,
  type CourseType,
  type PurchaseStatus,
  type ProgressStatus,
  type ContentType,
} from './constants';
