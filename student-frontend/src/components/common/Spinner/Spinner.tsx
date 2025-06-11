import React from 'react';
import { motion } from 'framer-motion';

export interface SpinnerProps {
  /**
   * Size of the spinner
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color variant of the spinner
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'white' | 'neutral';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Optional text to display alongside the spinner
   */
  text?: string;
  
  /**
   * Animation type for the spinner
   * @default "spin"
   */
  animation?: 'spin' | 'pulse' | 'bounce' | 'dots' | 'fade';
  
  /**
   * Animation speed
   * @default "normal"
   */
  speed?: 'slow' | 'normal' | 'fast';
  
  /**
   * Whether to center the spinner in its container
   * @default false
   */
  centered?: boolean;
  
  /**
   * Whether to display the spinner with a backdrop overlay
   * @default false
   */
  overlay?: boolean;
}

/**
 * Spinner component for displaying loading states with enhanced animations
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  text,
  animation = 'spin',
  speed = 'normal',
  centered = false,
  overlay = false,
}) => {
  // Size classes for the spinner
  const sizeClasses = {
    xs: 'h-3 w-3 border',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
    xl: 'h-16 w-16 border-4',
  };
  
  // Color classes for the spinner
  const variantClasses = {
    primary: 'border-primary-500 border-r-transparent',
    secondary: 'border-secondary-500 border-r-transparent',
    success: 'border-success border-r-transparent',
    warning: 'border-warning border-r-transparent',
    error: 'border-error border-r-transparent',
    info: 'border-info border-r-transparent',
    white: 'border-white border-r-transparent',
    neutral: 'border-neutral-400 border-r-transparent',
  };

  // Speed settings for animations
  const speedSettings = {
    slow: 2,
    normal: 1.2,
    fast: 0.7,
  };
  
  // Base container classes
  const containerClasses = [
    'inline-flex items-center',
    centered ? 'justify-center w-full' : '',
    overlay ? 'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center' : '',
    className,
  ].filter(Boolean).join(' ');
  
  // Text size based on spinner size
  const textSizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Render different animation types
  const renderSpinner = () => {
    switch (animation) {
      case 'spin':
        return (
          <motion.span
            className={`
              inline-block
              rounded-full
              border-solid
              ${sizeClasses[size]}
              ${variantClasses[variant]}
            `}
            animate={{ rotate: 360 }}
            transition={{ 
              repeat: Infinity, 
              duration: speedSettings[speed], 
              ease: "linear" 
            }}
            role="status"
            aria-label="Loading"
          />
        );
        
      case 'pulse':
        return (
          <motion.span
            className={`
              inline-block
              rounded-full
              ${sizeClasses[size]}
              bg-${variant.startsWith('white') ? 'white' : variant + '-500'}
            `}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              repeat: Infinity, 
              duration: speedSettings[speed], 
              ease: "easeInOut" 
            }}
            role="status"
            aria-label="Loading"
          />
        );
        
      case 'bounce':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={`
                  inline-block
                  rounded-full
                  ${size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'}
                  bg-${variant.startsWith('white') ? 'white' : variant + '-500'}
                `}
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: speedSettings[speed],
                  delay: i * 0.15,
                  ease: "easeInOut" 
                }}
                role="status"
                aria-label="Loading"
              />
            ))}
          </div>
        );
        
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className={`
                  inline-block
                  rounded-full
                  ${size === 'xs' || size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'}
                  bg-${variant.startsWith('white') ? 'white' : variant + '-500'}
                `}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: speedSettings[speed] * 1.2,
                  delay: i * 0.2,
                  ease: "easeInOut" 
                }}
                role="status"
                aria-label="Loading"
              />
            ))}
          </div>
        );
        
      case 'fade':
        return (
          <div className="relative">
            <motion.span
              className={`
                absolute
                inset-0
                border-solid
                rounded-full
                ${sizeClasses[size]}
                border-${variant.startsWith('white') ? 'white' : variant + '-500'}
              `}
              animate={{ 
                scale: [1, 1.5, 2],
                opacity: [0.8, 0.4, 0] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: speedSettings[speed] * 1.5, 
                ease: "easeOut" 
              }}
            />
            <motion.span
              className={`
                inline-block
                rounded-full
                border-solid
                ${sizeClasses[size]}
                ${variantClasses[variant]}
              `}
              animate={{ rotate: 360 }}
              transition={{ 
                repeat: Infinity, 
                duration: speedSettings[speed], 
                ease: "linear" 
              }}
              role="status"
              aria-label="Loading"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      {renderSpinner()}
      
      {text && (
        <motion.span 
          className={`ml-3 ${textSizeClass[size]}`}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
};

export default Spinner;