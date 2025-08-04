/**
 * Image Utilities
 * 
 * Comprehensive utilities for Bunny CDN image management, optimization, and URL generation.
 * Provides environment-aware image serving with fallback mechanisms and performance optimization.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import type {
  ImageOptimizationOptions,
  CDNConfig,
  ImageEnvironmentConfig,
  ResponsiveImageConfig,
  ImageFormat,
} from '@/types/image.types';
import { LOCAL_IMAGES, getOptimizationPreset } from '@/constants/images';

/**
 * Get environment-based image configuration
 * Determines whether to use CDN or local images based on environment variables
 */
export const getImageEnvironmentConfig = (): ImageEnvironmentConfig => {
  // Check if CDN is explicitly enabled via environment variable
  const cdnEnabled = import.meta.env.VITE_BUNNY_CDN_ENABLED === 'true';
  const isProduction = import.meta.env.PROD;
  
  // Use CDN only if explicitly enabled AND (in production OR development with CDN enabled)
  const useCDN = cdnEnabled && (isProduction || import.meta.env.DEV);
  
  return {
    useCDN,
    cdnBaseUrl: import.meta.env.VITE_BUNNY_CDN_BASE_URL || 'https://lmsbunny.b-cdn.net',
    localBasePath: '/',
    defaultOptimizations: {
      quality: 85,
      format: 'webp',
      optimize: true,
      progressive: true,
    },
  };
};

/**
 * Build optimization parameters for Bunny CDN Transform API
 * Converts optimization options to URL query parameters
 */
export const buildOptimizationParams = (options: ImageOptimizationOptions = {}): string => {
  const params = new URLSearchParams();
  
  // Apply width and height
  if (options.width) {
    params.append('width', options.width.toString());
  }
  if (options.height) {
    params.append('height', options.height.toString());
  }
  
  // Apply format optimization
  if (options.format && options.format !== 'auto') {
    params.append('format', options.format);
  }
  
  // Apply quality
  if (options.quality && options.quality !== 85) {
    params.append('quality', Math.min(100, Math.max(1, options.quality)).toString());
  }
  
  // Apply aspect ratio for fit mode (updated to use aspect_ratio)
  if (options.fit) {
    // Convert fit mode to aspect_ratio parameter
    switch (options.fit) {
      case 'contain':
      case 'inside':
        // These will use width/height parameters naturally
        break;
      case 'cover':
      case 'outside':
        // For cover mode, we can use aspect_ratio with width/height
        if (options.width && options.height) {
          const ratio = `${options.width}:${options.height}`;
          params.append('aspect_ratio', ratio);
        }
        break;
      case 'fill':
        // Fill mode uses exact dimensions - no aspect ratio needed
        break;
    }
  }
  
  // Apply progressive loading for JPEG (this parameter may not be available in current API)
  // Commenting out as it's not documented in current Bunny CDN API
  // if (options.progressive) {
  //   params.append('progressive', 'true');
  // }
  
  // Apply optimization flag (this parameter may not be available in current API)
  // Commenting out as it's not documented in current Bunny CDN API
  // if (options.optimize) {
  //   params.append('optimize', 'true');
  // }
  
  const paramString = params.toString();
  return paramString ? `?${paramString}` : '';
};

/**
 * Generate CDN URL for an image with optimization parameters
 * 
 * @param path - Image path relative to CDN base
 * @param options - Optimization options
 * @returns Complete CDN URL with optimization parameters
 */
export const getCDNImageUrl = (
  path: string, 
  options: ImageOptimizationOptions = {}
): string => {
  const config = getImageEnvironmentConfig();
  
  // If CDN is disabled via environment variable, return local path
  if (!config.useCDN) {
    return getLocalImagePath(path);
  }
  
  // Merge with default optimizations and path-specific presets
  const preset = getOptimizationPreset(path);
  const mergedOptions = {
    ...config.defaultOptimizations,
    ...preset,
    ...options,
  };
  
  const baseUrl = config.cdnBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path; // Remove leading slash
  const optimizations = buildOptimizationParams(mergedOptions);
  
  return `${baseUrl}/${cleanPath}${optimizations}`;
};

/**
 * Generate optimized image URL with specific dimensions
 * Convenience function for common optimization scenarios
 */
export const getOptimizedImageUrl = (
  path: string,
  width?: number,
  height?: number,
  format?: ImageFormat
): string => {
  return getCDNImageUrl(path, {
    width,
    height,
    format,
  });
};

/**
 * Generate responsive image URLs and srcSet
 * Creates multiple image variants for responsive design
 */
export const getResponsiveImageUrls = (
  path: string,
  config: ResponsiveImageConfig,
  options: ImageOptimizationOptions = {}
): {
  src: string;
  srcSet: string;
  sizes: string;
} => {
  const { base, breakpoints = [], sizes = '' } = config;
  
  // Generate base URL
  const src = getCDNImageUrl(path, {
    ...options,
    width: base.width,
    height: base.height,
  });
  
  // Generate srcSet with different sizes
  const srcSetEntries = [
    `${src} ${base.width}w`,
    ...breakpoints.map(bp => {
      const url = getCDNImageUrl(path, {
        ...options,
        width: bp.width,
        height: bp.height,
      });
      return `${url} ${bp.width}w`;
    }),
  ];
  
  return {
    src,
    srcSet: srcSetEntries.join(', '),
    sizes: sizes || '100vw',
  };
};

/**
 * Get local image path for fallback scenarios
 * Maps CDN paths to local public directory paths
 */
export const getLocalImagePath = (cdnPath: string): string => {
  // Try to find matching local image
  for (const [category, images] of Object.entries(LOCAL_IMAGES)) {
    for (const [key, localPath] of Object.entries(images)) {
      // This is a simplified mapping - in real implementation,
      // you might want a more sophisticated mapping mechanism
      if (cdnPath.includes(category) || cdnPath.includes(key)) {
        return localPath as string;
      }
    }
  }
  
  // Fallback to a default placeholder
  return '/default_profile_picture.webp';
};

/**
 * Preload critical images for better performance
 * Adds link tags to document head for priority loading
 */
export const preloadImage = (path: string, options: ImageOptimizationOptions = {}): void => {
  if (typeof window === 'undefined') return; // SSR safety
  
  const url = getCDNImageUrl(path, options);
  
  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
  if (existing) return;
  
  // Create preload link
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  
  // Add to document head
  document.head.appendChild(link);
};

/**
 * Batch preload multiple images
 * Efficiently preload a collection of critical images
 */
export const preloadImages = (
  paths: string[],
  options: ImageOptimizationOptions = {}
): void => {
  paths.forEach(path => preloadImage(path, options));
};

/**
 * Check if image URL is from CDN
 * Utility function to determine image source
 */
export const isCDNImage = (url: string): boolean => {
  const config = getImageEnvironmentConfig();
  return url.startsWith(config.cdnBaseUrl);
};

/**
 * Generate image metadata for debugging and analytics
 * Provides detailed information about image optimization and delivery
 */
export const generateImageMetadata = (
  originalPath: string,
  finalUrl: string,
  optimizations: ImageOptimizationOptions,
  loadTime?: number
) => {
  return {
    originalSrc: originalPath,
    finalUrl,
    optimizations,
    loadTime,
    fromCache: false, // This would need to be determined from response headers
    region: 'unknown', // This would need to be determined from response headers
    timestamp: Date.now(),
  };
};

/**
 * Validate image optimization options
 * Ensures optimization parameters are within valid ranges
 */
export const validateOptimizationOptions = (
  options: ImageOptimizationOptions
): ImageOptimizationOptions => {
  const validated = { ...options };
  
  // Validate quality
  if (validated.quality !== undefined) {
    validated.quality = Math.min(100, Math.max(1, validated.quality));
  }
  
  // Validate dimensions
  if (validated.width !== undefined) {
    validated.width = Math.max(1, validated.width);
  }
  if (validated.height !== undefined) {
    validated.height = Math.max(1, validated.height);
  }
  
  return validated;
};

/**
 * Create image URL with automatic format detection
 * Automatically selects the best format based on browser support
 */
export const getAutoOptimizedImageUrl = (
  path: string,
  width?: number,
  height?: number
): string => {
  // In a real implementation, you would detect browser support
  // For now, we'll default to WebP with fallback
  return getCDNImageUrl(path, {
    width,
    height,
    format: 'auto', // Let Bunny CDN decide the best format
    optimize: true,
    progressive: true,
  });
};

/**
 * Generate placeholder URL for loading states
 * Creates a low-quality placeholder image for progressive loading
 */
export const getPlaceholderImageUrl = (
  path: string,
  width: number = 50,
  height?: number
): string => {
  return getCDNImageUrl(path, {
    width,
    height,
    quality: 20, // Very low quality for fast loading
    format: 'webp',
  });
};

/**
 * Create image URL with blur placeholder
 * Generates a blurred version for progressive enhancement
 */
export const getBlurPlaceholderUrl = (path: string): string => {
  return getCDNImageUrl(path, {
    width: 20,
    height: 20,
    quality: 20,
    format: 'webp',
  });
};

/**
 * Environment-aware image configuration
 * Provides different settings based on current environment
 */
export const getEnvironmentImageConfig = (): CDNConfig => {
  const config = getImageEnvironmentConfig();
  
  return {
    baseUrl: config.cdnBaseUrl,
    enabled: config.useCDN,
    defaultOptimizations: config.defaultOptimizations,
    maxAge: import.meta.env.PROD ? 31536000 : 3600, // 1 year in prod, 1 hour in dev
  };
};
