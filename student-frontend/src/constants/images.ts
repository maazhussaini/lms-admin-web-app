/**
 * Image Constants
 * 
 * Centralized constants for all application images with organized categorization.
 * Provides consistent image paths for both CDN and local development usage.
 * Updated to use src/assets/images for better Vite optimization.
 * 
 * @author GitHub Copilot
 * @version 2.0.0
 */

import type { ImageConstants } from '@/types/image.types';

// Import all images from assets for Vite optimization
import bgImage from '@/assets/images/bg.png';
import courseDetailsBanner from '@/assets/images/course_details_banner.png';
import defaultProfilePicture from '@/assets/images/default_profile_picture.webp';
import forgotPasswordVector from '@/assets/images/forgot_password_vector.png';
import orbedLogoSvg from '@/assets/images/orbed_logo.svg';
import orbedLogoPurpleBg from '@/assets/images/orbed_logo_purple_bg.png';
import resetPasswordSuccessVector from '@/assets/images/reset_password_success_vector.png';
import signinVector from '@/assets/images/signin_vector.png';
import signupVector from '@/assets/images/signup_vector.png';

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
   * NOTE: Using 'images/' prefix to match actual CDN structure
   */
  auth: {
    /** Sign in page illustration */
    signin: 'images/signin_vector.png',
    /** Sign up page illustration */
    signup: 'images/signup_vector.png',
    /** Forgot password page illustration */
    forgotPassword: 'images/forgot_password_vector.png',
    /** Password reset success illustration */
    resetSuccess: 'images/reset_password_success_vector.png',
    /** Check email page illustration - using forgot password as fallback */
    checkEmail: 'images/forgot_password_vector.png',
  },

  /**
   * User interface elements
   * General UI images, backgrounds, and decorative elements
   */
  ui: {
    /** Main hero/banner image */
    heroImage: 'images/bg.png',
    /** Background patterns or images */
    background: 'images/bg.png',
    /** Generic banner image */
    banner: 'images/course_details_banner.png',
    /** General placeholder image - using background as fallback */
    placeholder: 'images/bg.png',
  },

  /**
   * Course-related images
   * Images specific to course content and learning materials
   */
  course: {
    /** Course details banner */
    banner: 'images/course_details_banner.png',
    /** Course placeholder image - using course banner as fallback */
    placeholder: 'images/course_details_banner.png',
    /** Course completion badge - using course banner as fallback */
    completionBadge: 'images/course_details_banner.png',
  },

  /**
   * Brand assets
   * Company logos, branding elements, and identity assets
   */
  brand: {
    /** Primary logo - using orbed_logo.png for CDN */
    logo: 'images/orbed_logo.png',
    /** Logo with background */
    logoWithBackground: 'images/orbed_logo_purple_bg.png',
    /** Favicon - using logo as fallback */
    favicon: 'images/orbed_logo.png',
  },

  /**
   * User profile images
   * Default avatars and profile-related imagery
   */
  profile: {
    /** Default profile picture */
    default: 'images/default_profile_picture.webp',
    /** Avatar placeholder for loading states */
    avatarPlaceholder: 'images/default_profile_picture.webp',
  },
} as const;

/**
 * Local image paths for development and fallback usage
 * These now use imported assets for better Vite optimization
 */
export const LOCAL_IMAGES: ImageConstants = {
  auth: {
    signin: signinVector,
    signup: signupVector,
    forgotPassword: forgotPasswordVector,
    resetSuccess: resetPasswordSuccessVector,
    checkEmail: forgotPasswordVector, // Reusing forgot password image
  },
  ui: {
    heroImage: bgImage,
    background: bgImage,
    banner: courseDetailsBanner,
    placeholder: bgImage, // Fallback to background
  },
  course: {
    banner: courseDetailsBanner,
    placeholder: courseDetailsBanner,
    completionBadge: courseDetailsBanner, // Placeholder for now
  },
  brand: {
    logo: orbedLogoSvg,
    logoWithBackground: orbedLogoPurpleBg,
    favicon: orbedLogoSvg, // Using SVG for favicon
  },
  profile: {
    default: defaultProfilePicture,
    avatarPlaceholder: defaultProfilePicture,
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
