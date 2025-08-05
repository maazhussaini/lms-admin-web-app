/**
 * @file components/common/CustomIcon.tsx
 * @description Custom icon component that uses the IcoMoon icon font
 */

import React from 'react';
import clsx from 'clsx';

export interface CustomIconProps {
  /** Icon class name (e.g., 'ic-1', 'ic-2', etc.) */
  iconClass: string;
  /** Additional CSS classes */
  className?: string;
  /** Icon size (affects font-size) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Icon color (can be overridden by className) */
  color?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

/**
 * Size mappings for the icon - now using exact pixel sizes to match w-6 h-6 lg:w-7 lg:h-7
 */
const sizeClasses = {
  sm: 'text-sm', // ~14px
  md: 'text-xl', // ~20px (closer to w-6 h-6 which is 24px)
  lg: 'text-2xl', // ~24px (matches w-6 h-6)
  xl: 'text-3xl', // ~30px (matches w-7 h-7 which is 28px)
} as const;

/**
 * CustomIcon - Component for rendering IcoMoon icon font icons
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const CustomIcon: React.FC<CustomIconProps> = ({
  iconClass,
  className = '',
  size = 'md',
  color,
  'aria-label': ariaLabel,
}) => {
  return (
    <i
      className={clsx(
        iconClass,
        sizeClasses[size],
        className
      )}
      style={color ? { color } : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-hidden={!ariaLabel}
    />
  );
};

export default CustomIcon;
