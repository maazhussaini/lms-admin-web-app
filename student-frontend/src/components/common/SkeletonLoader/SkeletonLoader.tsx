import React from 'react';

export interface SkeletonLoaderProps {
  /**
   * The width of the skeleton.
   * Can be a CSS value (e.g. '100px', '50%') or 'auto' to fill container
   */
  width?: string;
  
  /**
   * The height of the skeleton.
   * Can be a CSS value (e.g. '100px', '50%')
   */
  height?: string;
  
  /**
   * Number of skeleton items to display in a group
   */
  count?: number;
  
  /**
   * Border radius of the skeleton
   * @default "md"
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to show the shimmer animation effect
   * @default true
   */
  shimmer?: boolean;
  
  /**
   * Gap between multiple skeleton items when count > 1
   */
  gap?: string;
}

/**
 * SkeletonLoader component for displaying loading placeholders
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 'auto',
  height = '16px',
  count = 1,
  radius = 'md',
  className = '',
  shimmer = true,
  gap = '0.75rem',
}) => {
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  
  // Create array of skeleton items based on count
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`
        bg-neutral-200
        ${radiusClasses[radius]}
        ${shimmer ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-neutral-100/50 before:to-transparent' : ''}
        ${className}
      `}
      style={{
        width,
        height,
        marginTop: index > 0 ? gap : '0',
      }}
      role="status"
      aria-busy="true"
      aria-hidden="true"
    />
  ));
  
  return <>{skeletonItems}</>;
};

export default SkeletonLoader;