/**
 * Image Management Types
 * 
 * Type definitions for Bunny CDN image optimization and management system.
 * Provides type safety for image URLs, optimization parameters, and component props.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

/**
 * Supported image formats for optimization
 */
export type ImageFormat = 'webp' | 'png' | 'jpg' | 'jpeg' | 'avif' | 'auto';

/**
 * Image optimization quality levels
 */
export type ImageQuality = number; // 1-100

/**
 * Loading strategies for images
 */
export type ImageLoadingStrategy = 'lazy' | 'eager';

/**
 * Image fit modes for resizing
 */
export type ImageFitMode = 
  | 'contain'    // Fit within dimensions, maintain aspect ratio
  | 'cover'      // Cover dimensions, may crop
  | 'fill'       // Fill dimensions exactly, may distort
  | 'inside'     // Fit within dimensions, smaller result
  | 'outside';   // Cover dimensions, larger result

/**
 * Image optimization parameters for Bunny CDN Transform API
 */
export interface ImageOptimizationOptions {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Output format (auto-detects best format if not specified) */
  format?: ImageFormat;
  /** Quality level (1-100, higher is better quality) */
  quality?: ImageQuality;
  /** How the image should fit within the specified dimensions */
  fit?: ImageFitMode;
  /** Enable progressive JPEG loading */
  progressive?: boolean;
  /** Enable automatic optimization */
  optimize?: boolean;
}

/**
 * Responsive image breakpoint configuration
 */
export interface ResponsiveImageBreakpoint {
  /** CSS media query condition */
  mediaQuery: string;
  /** Image width for this breakpoint */
  width: number;
  /** Optional height for this breakpoint */
  height?: number;
}

/**
 * Complete responsive image configuration
 */
export interface ResponsiveImageConfig {
  /** Base image dimensions */
  base: {
    width: number;
    height?: number;
  };
  /** Responsive breakpoints */
  breakpoints?: ResponsiveImageBreakpoint[];
  /** Sizes attribute for responsive images */
  sizes?: string;
}

/**
 * CDN configuration interface
 */
export interface CDNConfig {
  /** Base CDN URL */
  baseUrl: string;
  /** Whether CDN is enabled */
  enabled: boolean;
  /** Default optimization options */
  defaultOptimizations?: ImageOptimizationOptions;
  /** Maximum cache age in seconds */
  maxAge?: number;
}

/**
 * Image loading states
 */
export type ImageLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Error types for image loading
 */
export interface ImageError {
  /** Error type */
  type: 'network' | 'format' | 'not-found' | 'cdn-unavailable';
  /** Error message */
  message: string;
  /** Original error object */
  originalError?: Error;
  /** Whether fallback was attempted */
  fallbackAttempted?: boolean;
}

/**
 * Image metadata for debugging and analytics
 */
export interface ImageMetadata {
  /** Original source URL */
  originalSrc: string;
  /** Final CDN URL used */
  finalUrl: string;
  /** Optimization parameters applied */
  optimizations: ImageOptimizationOptions;
  /** Load time in milliseconds */
  loadTime?: number;
  /** Whether image was served from cache */
  fromCache?: boolean;
  /** CDN region that served the image */
  region?: string;
}

/**
 * Props for the OptimizedImage component
 */
export interface OptimizedImageProps {
  /** Image source path (relative to CDN base or absolute URL) */
  src: string;
  /** Alternative text for accessibility */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** CSS classes to apply */
  className?: string;
  /** Loading strategy */
  loading?: ImageLoadingStrategy;
  /** Optimization options */
  optimization?: ImageOptimizationOptions;
  /** Responsive image configuration */
  responsive?: ResponsiveImageConfig;
  /** Fallback image source (local or CDN) */
  fallback?: string;
  /** Whether to show loading skeleton */
  showLoadingSkeleton?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Callback when image loads successfully */
  onLoad?: (metadata: ImageMetadata) => void;
  /** Callback when image fails to load */
  onError?: (error: ImageError) => void;
  /** Whether to preload this image */
  preload?: boolean;
  /** Additional HTML attributes */
  htmlAttributes?: React.ImgHTMLAttributes<HTMLImageElement>;
}

/**
 * Image constants structure for organized asset management
 */
export interface ImageConstants {
  /** Authentication flow images */
  auth: {
    signin: string;
    signup: string;
    forgotPassword: string;
    resetSuccess: string;
    checkEmail: string;
  };
  /** User interface elements */
  ui: {
    heroImage: string;
    background: string;
    banner: string;
    placeholder: string;
  };
  /** Course-related images */
  course: {
    banner: string;
    placeholder: string;
    completionBadge: string;
  };
  /** Brand assets */
  brand: {
    logo: string;
    logoWithBackground: string;
    favicon: string;
  };
  /** User profile images */
  profile: {
    default: string;
    avatarPlaceholder: string;
  };
}

/**
 * Environment-based image configuration
 */
export interface ImageEnvironmentConfig {
  /** Whether to use CDN in current environment */
  useCDN: boolean;
  /** CDN base URL */
  cdnBaseUrl: string;
  /** Local fallback base path */
  localBasePath: string;
  /** Default optimization settings for environment */
  defaultOptimizations: ImageOptimizationOptions;
}
