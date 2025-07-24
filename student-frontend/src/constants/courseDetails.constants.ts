/**
 * @file constants/courseDetails.constants.ts
 * @description Constants for CourseDetails components
 * Centralizes magic numbers, strings, and configuration
 */

/**
 * Drag-to-scroll configuration
 */
export const DRAG_SCROLL_CONFIG = {
  /** Scroll speed multiplier */
  SCROLL_SPEED: 2,
  /** Minimum pixel movement to consider as drag */
  DRAG_THRESHOLD: 5,
  /** Delay before resetting drag state (ms) */
  DRAG_RESET_DELAY: 50,
} as const;

/**
 * Content type configurations
 */
export const CONTENT_TYPE_CONFIG = {
  MODULE: {
    TYPES: ['topics', 'assignments', 'quizzes'] as const,
    DEFAULT: 'topics' as const,
    LABELS: {
      topics: 'Topics',
      assignments: 'Assignments',
      quizzes: 'Quizzes',
    },
  },
  TOPIC: {
    TYPES: ['lectures', 'live-classes', 'assignments', 'quizzes', 'materials'] as const,
    DEFAULT: 'lectures' as const,
    LABELS: {
      lectures: 'Lectures',
      'live-classes': 'Live Classes',
      assignments: 'Assignments',
      quizzes: 'Quizzes',
      materials: 'Materials',
    },
  },
} as const;

/**
 * Navigation route patterns
 */
export const COURSE_ROUTES = {
  PATTERNS: {
    COURSE: '/courses/:courseId',
    MODULE: '/courses/:courseId/modules/:moduleId',
    TOPIC: '/courses/:courseId/modules/:moduleId/topics/:topicId',
    VIDEO: '/courses/:courseId/modules/:moduleId/topics/:topicId/videos/:videoId',
  },
  BUILDERS: {
    course: (courseId: string) => `/courses/${courseId}`,
    module: (courseId: string, moduleId: number) => `/courses/${courseId}/modules/${moduleId}`,
    topic: (courseId: string, moduleId: number, topicId: number) => 
      `/courses/${courseId}/modules/${moduleId}/topics/${topicId}`,
    video: (courseId: string, moduleId: number, topicId: number, videoId: number) => 
      `/courses/${courseId}/modules/${moduleId}/topics/${topicId}/videos/${videoId}`,
  },
} as const;

/**
 * Component loading and error messages
 */
export const COURSE_DETAILS_MESSAGES = {
  LOADING: {
    COURSE: 'Loading course details...',
    MODULES: 'Loading modules...',
    TOPICS: 'Loading topics...',
    VIDEOS: 'Loading videos...',
    GENERIC: 'Loading...',
  },
  ERROR: {
    COURSE_NOT_FOUND: 'Course not found',
    MODULES_FAILED: 'Failed to load modules',
    TOPICS_FAILED: 'Failed to load topics',
    VIDEOS_FAILED: 'Failed to load videos',
    GENERIC: 'Something went wrong',
    RETRY_HINT: 'Click to retry',
  },
  EMPTY_STATE: {
    NO_MODULES: 'No modules available for this course',
    NO_TOPICS: 'No topics available for this module',
    NO_VIDEOS: 'No videos available for this topic',
    NO_ASSIGNMENTS: 'No assignments available',
    NO_QUIZZES: 'No quizzes available',
    NO_MATERIALS: 'No materials available',
  },
} as const;

/**
 * Animation configurations
 */
export const COURSE_DETAILS_ANIMATIONS = {
  PAGE_TRANSITION: {
    INITIAL: { opacity: 0, y: 20 },
    ANIMATE: { opacity: 1, y: 0 },
    TRANSITION: { duration: 0.4 },
  },
  BANNER_TRANSITION: {
    INITIAL: { opacity: 0 },
    ANIMATE: { opacity: 1 },
    TRANSITION: { duration: 0.6 },
  },
  CONTENT_TRANSITION: {
    INITIAL: { y: 20, opacity: 0 },
    ANIMATE: { y: 0, opacity: 1 },
    TRANSITION: { delay: 0.1 },
  },
  SELECTOR_ITEM: {
    WHILEHOVER: { scale: 1.02 },
    WHILETAP: { scale: 0.98 },
    TRANSITION: { type: 'spring', stiffness: 300, damping: 25 },
  },
} as const;

/**
 * Styling constants
 */
export const COURSE_DETAILS_STYLES = {
  CONTAINER: {
    PADDING: 'w-full px-4 sm:px-6 lg:px-8 py-8',
    MIN_HEIGHT: 'min-h-screen',
    BACKGROUND: 'bg-page-bg',
  },
  SELECTOR: {
    CONTAINER: 'flex gap-4 overflow-x-auto scrollbar-hide pb-2',
    ITEM_BASE: 'flex-shrink-0 p-4 rounded-lg border cursor-pointer transition-all duration-200',
    ITEM_ACTIVE: 'bg-primary-50 border-primary-200 text-primary-900',
    ITEM_INACTIVE: 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300',
  },
  CONTENT_SELECTOR: {
    CONTAINER: 'flex flex-col sm:flex-row bg-white rounded-[15px] p-1.5 w-full shadow-sm border border-neutral-200 gap-1.5 sm:gap-0',
    TAB_BASE: 'relative flex-1 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[15px] font-semibold text-sm sm:text-base transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]',
    TAB_ACTIVE: 'text-white bg-primary-900 shadow-lg',
    TAB_INACTIVE: 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50',
  },
  LOADING: {
    SPINNER: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800',
    CONTAINER: 'flex items-center justify-center',
    TEXT: 'ml-2 text-neutral-600',
  },
  ERROR: {
    CONTAINER: 'text-center py-8',
    TITLE: 'text-xl font-semibold text-neutral-800 mb-2',
    MESSAGE: 'text-neutral-600 mb-4',
    BUTTON: 'px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors',
  },
} as const;

/**
 * Default content counts for unimplemented features
 */
export const DEFAULT_CONTENT_COUNTS = {
  ASSIGNMENTS: 0,
  QUIZZES: 0,
  MATERIALS: 0,
  LIVE_CLASSES: 0,
} as const;

/**
 * Data parsing patterns
 */
export const PARSING_PATTERNS = {
  MODULE_STATS: {
    TOPICS: /(\d+)\s+Topics?/i,
    VIDEOS: /(\d+)\s+Video\s+Lectures?/i,
  },
  VIDEO_COUNT: /\d+/,
} as const;

/**
 * Performance optimization constants
 */
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  INTERSECTION_THRESHOLD: 0.1,
  LAZY_LOAD_MARGIN: '50px',
} as const;
