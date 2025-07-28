/**
 * OptimizedImage Component
 * 
 * A comprehensive image component that integrates with Bunny CDN for optimized delivery.
 * Provides lazy loading, error handling, responsive images, and progressive enhancement.
 * 
 * Features:
 * - Automatic CDN optimization with fallback to local images
 * - Lazy loading with intersection observer
 * - Responsive image support with srcSet
 * - Loading states with skeleton placeholder
 * - Error handling with graceful degradation
 * - Performance monitoring and analytics
 * - Accessibility compliance
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import type { 
  OptimizedImageProps, 
  ImageLoadingState, 
  ImageError 
} from '@/types/image.types';
import {
  getCDNImageUrl,
  getResponsiveImageUrls,
  getLocalImagePath,
  generateImageMetadata,
  validateOptimizationOptions,
} from '@/utils/imageUtils';

/**
 * Loading skeleton component for image placeholder
 */
const ImageSkeleton: React.FC<{ 
  width?: number; 
  height?: number; 
  className?: string; 
}> = ({ width, height, className }) => (
  <div
    className={clsx(
      'animate-pulse bg-gray-200 rounded',
      className
    )}
    style={{ width, height }}
    role="presentation"
    aria-label="Loading image..."
  >
    <div className="flex items-center justify-center h-full">
      <svg
        className="w-8 h-8 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  </div>
);

/**
 * Error display component for failed image loads
 */
const ImageErrorDisplay: React.FC<{ 
  error: ImageError; 
  width?: number; 
  height?: number; 
  className?: string;
  onRetry?: () => void;
}> = ({ error, width, height, className, onRetry }) => (
  <div
    className={clsx(
      'flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded',
      className
    )}
    style={{ width, height }}
    role="img"
    aria-label={`Failed to load image: ${error.message}`}
  >
    <svg
      className="w-8 h-8 text-gray-400 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
    <p className="text-sm text-gray-500 text-center px-2">
      Image failed to load
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        type="button"
      >
        Retry
      </button>
    )}
  </div>
);

/**
 * Custom hook for intersection observer-based lazy loading
 */
const useIntersectionObserver = (
  enabled: boolean = true
): [React.RefObject<HTMLDivElement>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(!enabled);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [enabled]);

  return [ref as React.RefObject<HTMLDivElement>, isIntersecting];
};

/**
 * OptimizedImage component with comprehensive features
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  optimization = {},
  responsive,
  fallback,
  showLoadingSkeleton = true,
  loadingComponent,
  errorComponent,
  onLoad,
  onError,
  preload = false,
  htmlAttributes = {},
}) => {
  // State management
  const [loadingState, setLoadingState] = useState<ImageLoadingState>('idle');
  const [error, setError] = useState<ImageError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);

  // Lazy loading setup
  const isEager = loading === 'eager' || preload;
  const [containerRef, shouldLoad] = useIntersectionObserver(!isEager);

  // Memoized URL generation
  const imageUrls = useMemo(() => {
    const validatedOptions = validateOptimizationOptions(optimization);
    
    if (responsive) {
      return getResponsiveImageUrls(src, responsive, validatedOptions);
    }
    
    return {
      src: getCDNImageUrl(src, { ...validatedOptions, width, height }),
      srcSet: '',
      sizes: '',
    };
  }, [src, optimization, responsive, width, height]);

  // Fallback URL generation
  const fallbackUrl = useMemo(() => {
    if (fallback) return fallback;
    return getLocalImagePath(src);
  }, [fallback, src]);

  // Handle image load success
  const handleLoad = useCallback((_: React.SyntheticEvent<HTMLImageElement>) => {
    const loadTime = loadStartTime ? Date.now() - loadStartTime : undefined;
    const metadata = generateImageMetadata(
      src,
      imageUrls.src,
      optimization,
      loadTime
    );
    
    setLoadingState('loaded');
    onLoad?.(metadata);
  }, [src, imageUrls.src, optimization, loadStartTime, onLoad]);

  // Handle image load error
  const handleError = useCallback((_: React.SyntheticEvent<HTMLImageElement>) => {
    const imageError: ImageError = {
      type: 'network',
      message: 'Failed to load image from CDN',
      fallbackAttempted: retryCount > 0,
    };
    
    setError(imageError);
    setLoadingState('error');
    onError?.(imageError);
  }, [retryCount, onError]);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoadingState('idle');
  }, []);

  // Start loading when component should load
  useEffect(() => {
    if (shouldLoad && loadingState === 'idle') {
      setLoadingState('loading');
      setLoadStartTime(Date.now());
    }
  }, [shouldLoad, loadingState]);

  // Preload critical images
  useEffect(() => {
    if (!preload || typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrls.src;
    document.head.appendChild(link);
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [preload, imageUrls.src]);

  // Render loading state
  if (loadingState === 'loading' || !shouldLoad) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    if (showLoadingSkeleton) {
      return (
        <div ref={containerRef}>
          <ImageSkeleton 
            width={width} 
            height={height} 
            className={className} 
          />
        </div>
      );
    }
    
    return (
      <div 
        ref={containerRef}
        className={clsx('bg-gray-200', className)}
        style={{ width, height }}
        role="presentation"
      />
    );
  }

  // Render error state
  if (loadingState === 'error' && error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    // Try fallback image on first error
    if (retryCount === 0) {
      return (
        <img
          src={fallbackUrl}
          alt={alt}
          width={width}
          height={height}
          className={className}
          onLoad={handleLoad}
          onError={() => setRetryCount(1)}
          {...htmlAttributes}
        />
      );
    }
    
    return (
      <ImageErrorDisplay
        error={error}
        width={width}
        height={height}
        className={className}
        onRetry={handleRetry}
      />
    );
  }

  // Render optimized image
  const imgProps = {
    src: imageUrls.src,
    alt,
    width,
    height,
    className,
    onLoad: handleLoad,
    onError: handleError,
    loading: loading as 'lazy' | 'eager',
    decoding: 'async' as const,
    ...htmlAttributes,
  };

  // Add responsive attributes if configured
  if (responsive && imageUrls.srcSet) {
    Object.assign(imgProps, {
      srcSet: imageUrls.srcSet,
      sizes: imageUrls.sizes,
    });
  }

  return (
    <img
      {...imgProps}
      // Accessibility enhancements
      role="img"
      aria-describedby={error ? `${src}-error` : undefined}
    />
  );
};

/**
 * Higher-order component for automatic responsive image handling
 */
export const withResponsiveImage = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & { imageSrc?: string; imageAlt?: string }) => {
    const { imageSrc, imageAlt, ...restProps } = props;
    
    if (!imageSrc) {
      return <Component {...(restProps as P)} />;
    }
    
    return (
      <Component {...(restProps as P)}>
        <OptimizedImage
          src={imageSrc}
          alt={imageAlt || ''}
          responsive={{
            base: { width: 400 },
            breakpoints: [
              { mediaQuery: '(max-width: 768px)', width: 300 },
              { mediaQuery: '(max-width: 480px)', width: 200 },
            ],
          }}
        />
      </Component>
    );
  };
};

/**
 * Convenience component for profile pictures
 */
export const ProfilePicture: React.FC<{
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}> = ({ src = 'profile/default-profile-picture.webp', alt, size = 120, className }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={clsx('rounded-full object-cover', className)}
    optimization={{
      quality: 90,
      format: 'webp',
    }}
    responsive={{
      base: { width: size, height: size },
      breakpoints: [
        { mediaQuery: '(max-width: 768px)', width: size * 0.8, height: size * 0.8 },
        { mediaQuery: '(max-width: 480px)', width: size * 0.6, height: size * 0.6 },
      ],
    }}
    loading="eager"
  />
);

export default OptimizedImage;
