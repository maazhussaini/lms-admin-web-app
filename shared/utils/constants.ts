/**
 * @file shared/utils/constants.ts
 * @description Shared constants across applications
 * Cross-application constants that should be consistent everywhere
 */

/**
 * Course-related constants
 */
export const COURSE_CONSTANTS = {
  /**
   * Course types
   */
  TYPES: {
    FREE: 'FREE',
    PAID: 'PAID',
  } as const,

  /**
   * Purchase statuses
   */
  PURCHASE_STATUS: {
    PURCHASED: 'PURCHASED',
    FREE: 'FREE',
    PAID: 'PAID',
  } as const,

  /**
   * Progress statuses
   */
  PROGRESS_STATUS: {
    NEUTRAL: 'neutral',
    ACTIVE: 'active',
    COMPLETE: 'complete',
  } as const,

  /**
   * Default values
   */
  DEFAULTS: {
    INSTRUCTOR_NAME: 'Chris Evans',
    INSTRUCTOR_TITLE: 'CS Professor',
    DURATION_TEXT: 'Duration TBD',
    PRICE_TEXT: 'Price TBD',
  } as const,
} as const;

/**
 * UI-related constants
 */
export const UI_CONSTANTS = {
  /**
   * Animation durations (in milliseconds)
   */
  ANIMATIONS: {
    FAST: 150,
    NORMAL: 200,
    SLOW: 300,
    VERY_SLOW: 500,
  } as const,

  /**
   * Common animation configs
   */
  ANIMATION_CONFIGS: {
    HOVER: {
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeInOut' as const },
    },
    TAP: {
      scale: 0.98,
      transition: { duration: 0.1, ease: 'easeInOut' as const },
    },
    FADE_IN: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    },
    SLIDE_UP: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    },
  } as const,

  /**
   * Breakpoints for responsive design
   */
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  } as const,

  /**
   * Z-index layers
   */
  Z_INDEX: {
    DROPDOWN: 10,
    MODAL: 50,
    TOOLTIP: 100,
    TOAST: 1000,
  } as const,
} as const;

/**
 * Content-related constants
 */
export const CONTENT_CONSTANTS = {
  /**
   * Content types
   */
  TYPES: {
    MODULES: 'modules',
    TOPICS: 'topics',
    VIDEOS: 'videos',
    ASSIGNMENTS: 'assignments',
    QUIZZES: 'quizzes',
    MATERIALS: 'materials',
  } as const,

  /**
   * Default content counts
   */
  DEFAULT_COUNTS: {
    ASSIGNMENTS: 0,
    QUIZZES: 0,
    LIVE_CLASSES: 0,
    MATERIALS: 0,
  } as const,

  /**
   * File type constants
   */
  FILE_TYPES: {
    VIDEO: ['mp4', 'webm', 'ogg'],
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'txt'],
    ARCHIVE: ['zip', 'rar', '7z'],
  } as const,
} as const;

/**
 * API-related constants
 */
export const API_CONSTANTS = {
  /**
   * HTTP status codes
   */
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  } as const,

  /**
   * Request timeouts (in milliseconds)
   */
  TIMEOUTS: {
    SHORT: 5000,     // 5 seconds
    MEDIUM: 15000,   // 15 seconds
    LONG: 30000,     // 30 seconds
    UPLOAD: 60000,   // 1 minute
  } as const,

  /**
   * Retry configurations
   */
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
  } as const,
} as const;

/**
 * Validation constants
 */
export const VALIDATION_CONSTANTS = {
  /**
   * String length limits
   */
  LENGTH_LIMITS: {
    SHORT_TEXT: 50,
    MEDIUM_TEXT: 255,
    LONG_TEXT: 1000,
    DESCRIPTION: 2000,
  } as const,

  /**
   * Regular expressions
   */
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    URL: /^https?:\/\/.+/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  } as const,

  /**
   * File size limits (in bytes)
   */
  FILE_SIZE_LIMITS: {
    AVATAR: 2 * 1024 * 1024,        // 2MB
    THUMBNAIL: 5 * 1024 * 1024,     // 5MB
    VIDEO: 100 * 1024 * 1024,       // 100MB
    DOCUMENT: 10 * 1024 * 1024,     // 10MB
  } as const,
} as const;

/**
 * Date and time constants
 */
export const DATE_CONSTANTS = {
  /**
   * Date formats
   */
  FORMATS: {
    DATE_ONLY: 'YYYY-MM-DD',
    DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATE: 'MMM DD, YYYY',
    DISPLAY_DATE_TIME: 'MMM DD, YYYY HH:mm',
    TIME_ONLY: 'HH:mm:ss',
  } as const,

  /**
   * Time zones
   */
  TIMEZONES: {
    UTC: 'UTC',
    EST: 'America/New_York',
    PST: 'America/Los_Angeles',
    GMT: 'Europe/London',
  } as const,
} as const;

/**
 * Error message constants
 */
export const ERROR_CONSTANTS = {
  /**
   * Generic error messages
   */
  GENERIC: {
    UNKNOWN: 'An unknown error occurred',
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access forbidden.',
    NOT_FOUND: 'Requested resource not found.',
    SERVER_ERROR: 'Internal server error. Please try again later.',
  } as const,

  /**
   * Validation error messages
   */
  VALIDATION: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_URL: 'Please enter a valid URL',
    TOO_SHORT: 'Text is too short',
    TOO_LONG: 'Text is too long',
    INVALID_FORMAT: 'Invalid format',
  } as const,

  /**
   * Course-specific error messages
   */
  COURSE: {
    NOT_FOUND: 'Course not found',
    ACCESS_DENIED: 'You do not have access to this course',
    MODULE_NOT_FOUND: 'Module not found',
    TOPIC_NOT_FOUND: 'Topic not found',
    VIDEO_NOT_FOUND: 'Video not found',
  } as const,
} as const;

/**
 * Type exports for better TypeScript support
 */
export type CourseType = typeof COURSE_CONSTANTS.TYPES[keyof typeof COURSE_CONSTANTS.TYPES];
export type PurchaseStatus = typeof COURSE_CONSTANTS.PURCHASE_STATUS[keyof typeof COURSE_CONSTANTS.PURCHASE_STATUS];
export type ProgressStatus = typeof COURSE_CONSTANTS.PROGRESS_STATUS[keyof typeof COURSE_CONSTANTS.PROGRESS_STATUS];
export type ContentType = typeof CONTENT_CONSTANTS.TYPES[keyof typeof CONTENT_CONSTANTS.TYPES];
