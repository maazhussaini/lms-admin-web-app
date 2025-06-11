import React from 'react';

export interface BadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;
  
  /**
   * Color scheme for the badge
   * @default "primary"
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  
  /**
   * Size of the badge
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Optional styling
   */
  className?: string;
  
  /**
   * Show a dot indicator in the badge
   * @default false
   */
  showDot?: boolean;
  
  /**
   * Make the badge rounded (pill-shaped)
   * @default true
   */
  rounded?: boolean;
  
  /**
   * Click handler for the badge
   */
  onClick?: () => void;
}

/**
 * Badge component for displaying short informational text with colored background
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  size = 'md',
  className = '',
  showDot = false,
  rounded = true,
  onClick,
}) => {
  // Color variants based on the theme defined in index.css
  const colorVariants = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
    neutral: 'bg-neutral-100 text-neutral-800',
  };

  // Size variants
  const sizeVariants = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1', 
    lg: 'text-base px-3 py-1.5',
  };

  // Dot size based on badge size
  const dotSizeVariants = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // Combine all the classes
  const badgeClasses = [
    sizeVariants[size],
    colorVariants[color],
    rounded ? 'rounded-full' : 'rounded',
    'inline-flex items-center justify-center font-medium',
    onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : '',
    className
  ].join(' ');

  // Dot color classes
  const dotClasses = [
    'rounded-full mr-1.5', 
    dotSizeVariants[size],
    color === 'primary' ? 'bg-primary-500' :
    color === 'secondary' ? 'bg-secondary-500' :
    color === 'success' ? 'bg-success' :
    color === 'error' ? 'bg-error' :
    color === 'warning' ? 'bg-warning' :
    color === 'info' ? 'bg-info' :
    'bg-neutral-500'
  ].join(' ');

  return (
    <span 
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {showDot && <span className={dotClasses}></span>}
      {children}
    </span>
  );
};

export default Badge;
