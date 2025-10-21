/**
 * @file constants/courseUI.constants.ts
 * @description UI constants for course-related components
 * Centralizes styling and UI configuration
 */

/**
 * CSS class mappings for purchase status badges
 */
export const PURCHASE_STATUS_CLASSES = {
  PURCHASED: 'badge-purchased',
  BUY: 'badge-buy',
  FREE: 'badge-free',
} as const;

/**
 * CSS class mappings for progress bars
 */
export const PROGRESS_BAR_CLASSES = {
  NEUTRAL: 'progress-neutral',
  ACTIVE: 'progress-active', 
  COMPLETE: 'progress-complete',
} as const;

/**
 * Default instructor information
 */
export const DEFAULT_INSTRUCTOR = {
  name: 'Chris Evans',
  title: 'CS Professor',
  avatar_url: undefined,
} as const;

/**
 * Avatar placeholder configuration
 */
export const AVATAR_PLACEHOLDER_CONFIG = {
  background: 'ffc0cb', // Pink background to match design
  color: 'fff',
  bold: true,
  format: 'svg',
} as const;

/**
 * Course card animation configuration
 */
export const COURSE_CARD_ANIMATIONS = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  transition: { duration: 0.2, ease: 'easeInOut' as const },
} as const;

/**
 * Grid layout configurations
 */
export const GRID_LAYOUTS = {
  PROGRAMS: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 laptop:grid-cols-7 xl:grid-cols-16 gap-4 laptop:gap-3',
  SPECIALIZATIONS: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 laptop:grid-cols-8 xl:grid-cols-10 gap-4 laptop:gap-3',
  COURSES: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 laptop:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 laptop:gap-4',
} as const;

/**
 * Color schemes for ItemGrid components
 */
export const ITEM_GRID_COLORS = {
  PROGRAM: {
    ring: 'ring-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    selection: 'bg-blue-500',
    text: 'text-blue-700',
    fallbackEmoji: '🎓',
  },
  SPECIALIZATION: {
    ring: 'ring-green-500',
    gradient: 'from-green-400 to-green-600',
    selection: 'bg-green-500',
    text: 'text-green-700',
    fallbackEmoji: '📚',
  },
} as const;
