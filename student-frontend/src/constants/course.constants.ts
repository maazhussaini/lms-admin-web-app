/**
 * @file constants/course.constants.ts
 * @description Constants for course-related functionality
 * Eliminates magic strings and numbers
 */

/**
 * API Configuration Constants
 */
export const COURSE_API = {
  ENDPOINTS: {
    DISCOVER: '/student/profile/courses/discover',
    ENROLLMENTS: '/student/profile/enrollments',
    BASIC_DETAILS: '/student/profile/courses',
  },
  DEFAULT_PARAMS: {
    PAGE: 1,
    LIMIT: 50,
    ENROLLMENT_STATUS: 'ACTIVE',
  },
} as const;

/**
 * Course Display Constants
 */
export const COURSE_DISPLAY = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    MIN_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
  },
  PERFORMANCE: {
    TRANSFORMATION_BATCH_SIZE: 100,
    FILTER_DEBOUNCE: 150,
  },
} as const;

/**
 * Course Type Constants
 */
export const COURSE_TYPES = {
  FREE: 'FREE',
  PAID: 'PAID',
  PURCHASED: 'PURCHASED',
} as const;

/**
 * Tab Configuration
 */
export const COURSE_TABS = {
  ALL: 'all',
  ENROLLED: 'enrolled',
  UNENROLLED: 'unenrolled',
} as const;

/**
 * Filter Types
 */
export const COURSE_FILTER_TYPES = {
  ALL: 'all',
  FREE: 'free',
  PAID: 'paid',
  PURCHASED: 'purchased',
} as const;

/**
 * Progress Constants
 */
export const PROGRESS = {
  COMPLETE_THRESHOLD: 100,
  NOT_STARTED: 0,
  DEFAULT_VALUES: {
    MODULES_COMPLETED: 0,
    VIDEOS_COMPLETED: 0,
    QUIZZES_COMPLETED: 0,
    ASSIGNMENTS_COMPLETED: 0,
    TIME_SPENT: 0,
  },
} as const;

/**
 * UI Text Constants
 */
export const UI_TEXT = {
  LOADING: {
    COURSES: 'Loading courses...',
    UPDATING: 'Updating course list...',
    RETRYING: 'Retrying...',
  },
  ERROR: {
    LOAD_COURSES: 'Unable to load courses',
    UNEXPECTED: 'An unexpected error occurred',
    RETRY_HINT: 'Click retry to reload the course data',
  },
  PLACEHOLDERS: {
    SEARCH: 'Search here',
    DURATION_TBD: 'Duration TBD',
    UNKNOWN_INSTRUCTOR: 'Unknown Instructor',
  },
} as const;

/**
 * Date Format Constants
 */
export const DATE_FORMATS = {
  COURSE_DURATION: 'MMM yyyy',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
} as const;

/**
 * Performance Monitoring
 */
export const PERFORMANCE_LOGGING = {
  ENABLED: process.env.NODE_ENV === 'development',
  THRESHOLDS: {
    TRANSFORMATION_WARNING: 100, // ms
    FILTER_WARNING: 50, // ms
  },
} as const;

/**
 * API Parameters Utility
 * Moved from useApiPatterns.ts to consolidate constants
 */
export const API_PATTERNS = {
  /**
   * Builds standardized API parameters
   */
  buildApiParams: (overrides: Record<string, string | number | boolean> = {}) => ({
    ...COURSE_API.DEFAULT_PARAMS,
    ...overrides,
  }),
  
  /**
   * API retry configuration
   */
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    EXPONENTIAL_BACKOFF: true,
  },
} as const;
