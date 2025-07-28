/**
 * Image Constants
 * 
 * Centralized constants for all application images with organized categorization.
 * Provides consistent image paths for both CDN and local development usage.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import type { ImageConstants } from '@/types/image.types';

/**
 * Main image constants following the established naming conventions
 * 
 * Structure:
 * - auth: Authentication flow images (login, signup, password reset)
 * - ui: General UI elements and decorative images
 * - course: Course-related imagery
 * - brand: Brand assets and logos
 * - profile: User profile and avatar images
 */
export const CDN_IMAGES: ImageConstants = {
  /**
   * Authentication flow images
   * These are typically large illustration images used in auth pages
   */
  auth: {
    /** Sign in page illustration */
    signin: 'auth/signin-vector.webp',
    /** Sign up page illustration */
    signup: 'auth/signup-vector.webp',
    /** Forgot password page illustration */
    forgotPassword: 'auth/forgot-password-vector.webp',
    /** Password reset success illustration */
    resetSuccess: 'auth/reset-success-vector.webp',
    /** Check email page illustration */
    checkEmail: 'auth/check-email-vector.webp',
  },

  /**
   * User interface elements
   * General UI images, backgrounds, and decorative elements
   */
  ui: {
    /** Main hero/banner image */
    heroImage: 'ui/hero-image.webp',
    /** Background patterns or images */
    background: 'ui/background.webp',
    /** Generic banner image */
    banner: 'ui/banner.webp',
    /** General placeholder image */
    placeholder: 'ui/placeholder.webp',
  },

  /**
   * Course-related images
   * Images specific to course content and learning materials
   */
  course: {
    /** Course details banner */
    banner: 'course/details-banner.webp',
    /** Course placeholder image */
    placeholder: 'course/placeholder.webp',
    /** Course completion badge */
    completionBadge: 'course/completion-badge.webp',
  },

  /**
   * Brand assets
   * Company logos, branding elements, and identity assets
   */
  brand: {
    /** Primary logo */
    logo: 'brand/orbed-logo.svg',
    /** Logo with background */
    logoWithBackground: 'brand/orbed-logo-purple-bg.png',
    /** Favicon and small logo variants */
    favicon: 'brand/favicon.ico',
  },

  /**
   * User profile images
   * Default avatars and profile-related imagery
   */
  profile: {
    /** Default profile picture */
    default: 'profile/default-profile-picture.webp',
    /** Avatar placeholder for loading states */
    avatarPlaceholder: 'profile/avatar-placeholder.webp',
  },
} as const;

/**
 * Local image paths for development and fallback usage
 * These correspond to files in the public directory
 */
export const LOCAL_IMAGES: ImageConstants = {
  auth: {
    signin: '/signin_vector.png',
    signup: '/signup_vector.png',
    forgotPassword: '/forgot_password_vector.png',
    resetSuccess: '/reset_password_success_vector.png',
    checkEmail: '/forgot_password_vector.png', // Reusing forgot password image
  },
  ui: {
    heroImage: '/group_12.png',
    background: '/bg.png',
    banner: '/course_details_banner.png',
    placeholder: '/bg.png', // Fallback to background
  },
  course: {
    banner: '/course_details_banner.png',
    placeholder: '/course_details_banner.png',
    completionBadge: '/course_details_banner.png', // Placeholder for now
  },
  brand: {
    logo: '/orbed_logo.svg',
    logoWithBackground: '/orbed_logo_purple_bg.png',
    favicon: '/vite.svg', // Temporary fallback
  },
  profile: {
    default: '/default_profile_picture.webp',
    avatarPlaceholder: '/default_profile_picture.webp',
  },
} as const;

/**
 * Critical images that should be preloaded for better user experience
 * These are typically above-the-fold or frequently accessed images
 */
export const CRITICAL_IMAGES = [
  CDN_IMAGES.brand.logo,
  CDN_IMAGES.brand.logoWithBackground,
  CDN_IMAGES.profile.default,
] as const;

/**
 * Image categories for bulk operations and management
 */
export const IMAGE_CATEGORIES = {
  /** Large illustrations and vectors */
  LARGE_ILLUSTRATIONS: [
    CDN_IMAGES.auth.signin,
    CDN_IMAGES.auth.signup,
    CDN_IMAGES.auth.forgotPassword,
    CDN_IMAGES.auth.resetSuccess,
    CDN_IMAGES.ui.heroImage,
  ],
  /** Small UI elements and icons */
  SMALL_ASSETS: [
    CDN_IMAGES.brand.logo,
    CDN_IMAGES.brand.logoWithBackground,
    CDN_IMAGES.profile.default,
  ],
  /** Background and decorative images */
  DECORATIVE: [
    CDN_IMAGES.ui.background,
    CDN_IMAGES.ui.banner,
    CDN_IMAGES.course.banner,
  ],
} as const;

/**
 * Default optimization settings for different image categories
 */
export const IMAGE_OPTIMIZATION_PRESETS = {
  /** High-quality illustrations */
  ILLUSTRATION: {
    quality: 85,
    format: 'webp' as const,
    optimize: true,
    progressive: true,
  },
  /** Logo and brand assets */
  LOGO: {
    quality: 95,
    format: 'auto' as const,
    optimize: true,
    progressive: false,
  },
  /** Background and decorative images */
  DECORATIVE: {
    quality: 75,
    format: 'webp' as const,
    optimize: true,
    progressive: true,
  },
  /** User profile images */
  PROFILE: {
    quality: 80,
    format: 'webp' as const,
    optimize: true,
    progressive: false,
  },
} as const;

/**
 * Responsive image configurations for common use cases
 */
export const RESPONSIVE_CONFIGS = {
  /** Hero images - large responsive layouts */
  HERO: {
    base: { width: 1200, height: 800 },
    breakpoints: [
      { mediaQuery: '(max-width: 768px)', width: 768, height: 512 },
      { mediaQuery: '(max-width: 480px)', width: 480, height: 320 },
    ],
    sizes: '(max-width: 768px) 100vw, (max-width: 480px) 100vw, 1200px',
  },
  /** Auth page illustrations */
  AUTH_ILLUSTRATION: {
    base: { width: 600, height: 400 },
    breakpoints: [
      { mediaQuery: '(max-width: 768px)', width: 400, height: 267 },
      { mediaQuery: '(max-width: 480px)', width: 300, height: 200 },
    ],
    sizes: '(max-width: 768px) 400px, (max-width: 480px) 300px, 600px',
  },
  /** Profile pictures */
  PROFILE_PICTURE: {
    base: { width: 120, height: 120 },
    breakpoints: [
      { mediaQuery: '(max-width: 768px)', width: 80, height: 80 },
      { mediaQuery: '(max-width: 480px)', width: 60, height: 60 },
    ],
    sizes: '(max-width: 768px) 80px, (max-width: 480px) 60px, 120px',
  },
} as const;

/**
 * Type guard to check if a string is a valid image path
 */
export const isValidImagePath = (path: string): boolean => {
  const allPaths = Object.values(CDN_IMAGES).flatMap(category => 
    Object.values(category)
  );
  return allPaths.includes(path);
};

/**
 * Get image category based on path
 */
export const getImageCategory = (path: string): string | null => {
  for (const [category, images] of Object.entries(CDN_IMAGES)) {
    if (Object.values(images).includes(path)) {
      return category;
    }
  }
  return null;
};

/**
 * Get optimization preset for image path
 */
export const getOptimizationPreset = (path: string) => {
  const category = getImageCategory(path);
  
  switch (category) {
    case 'auth':
    case 'ui':
      return IMAGE_OPTIMIZATION_PRESETS.ILLUSTRATION;
    case 'brand':
      return IMAGE_OPTIMIZATION_PRESETS.LOGO;
    case 'course':
      return IMAGE_OPTIMIZATION_PRESETS.DECORATIVE;
    case 'profile':
      return IMAGE_OPTIMIZATION_PRESETS.PROFILE;
    default:
      return IMAGE_OPTIMIZATION_PRESETS.ILLUSTRATION;
  }
};
