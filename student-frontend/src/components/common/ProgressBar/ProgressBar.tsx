import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

export interface ProgressBarProps {
  /**
   * Current progress value
   */
  value: number;
  
  /**
   * Maximum possible value (100% equivalent)
   * @default 100
   */
  max?: number;
  
  /**
   * Color variant for the progress bar
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  /**
   * Progress bar size/height
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Show percentage text inside the progress bar
   * @default false
   */
  showPercentage?: boolean;
  
  /**
   * Make progress bar corners rounded
   * @default true
   */
  rounded?: boolean;
  
  /**
   * Add stripes animation to the progress bar
   * @default false
   */
  animated?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Label to display above the progress bar
   */
  label?: string;
  
  /**
   * Whether to animate the progress incrementally from 0
   * @default false
   */
  animateOnLoad?: boolean;
  
  /**
   * Duration for the animation in seconds
   * @default 1
   */
  animationDuration?: number;
  
  /**
   * Show a tooltip with the current value on hover
   * @default false
   */
  showTooltip?: boolean;
  
  /**
   * Whether to show markers on the progress bar
   * @default false
   */
  showMarkers?: boolean;
  
  /**
   * Values at which to show markers (in percentage)
   * @default [25, 50, 75]
   */
  markerPercentages?: number[];
  
  /**
   * Format function for displaying the value
   * @default value => `${value}%`
   */
  formatValue?: (value: number) => string;
  
  /**
   * Whether to use a gradient background for the progress bar
   * @default false
   */
  useGradient?: boolean;
  
  /**
   * Whether to show a subtle pulse animation when complete
   * @default false
   */
  pulseWhenComplete?: boolean;
}

/**
 * Progress Bar component for displaying progress visually
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showPercentage = false,
  rounded = true,
  animated = false,
  className = '',
  label,
  animateOnLoad = false,
  animationDuration = 1,
  showTooltip = false,
  showMarkers = false,
  markerPercentages = [25, 50, 75],
  formatValue = (value) => `${value}%`,
  useGradient = false,
  pulseWhenComplete = false,
}) => {
  // Animation controls for the progress bar
  const controls = useAnimation();
  
  // State for the displayed value (for animation)
  const [displayValue, setDisplayValue] = useState(animateOnLoad ? 0 : value);
  
  // State for hover interaction
  const [isHovered, setIsHovered] = useState(false);
  
  // Ensure value is within 0 to max range
  const normalizedValue = Math.max(0, Math.min(value, max));
  
  // Calculate percentage for width and display
  const percentage = Math.round((normalizedValue / max) * 100);
  const displayPercentage = Math.round((displayValue / max) * 100);
  
  // Update animation when value changes
  useEffect(() => {
    if (animateOnLoad || displayValue !== value) {
      // Animate to the new value
      setDisplayValue(value);
      controls.start({
        width: `${percentage}%`,
        transition: { 
          duration: animationDuration,
          ease: "easeOut" 
        }
      });
    }
  }, [value, max, controls, animateOnLoad, animationDuration, percentage, displayValue]);
  
  // Base classes for the container
  const containerClasses = [
    'w-full bg-neutral-200 overflow-hidden relative',
    rounded ? 'rounded-full' : '',
    className,
  ].join(' ');

  // Size classes for the outer container
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-5',
    xl: 'h-7',
  };

  // Variant classes for the progress bar
  const variantClasses = {
    primary: useGradient ? 'bg-gradient-to-r from-primary-400 to-primary-600' : 'bg-primary-500',
    secondary: useGradient ? 'bg-gradient-to-r from-secondary-400 to-secondary-600' : 'bg-secondary-500',
    success: useGradient ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-success',
    warning: useGradient ? 'bg-gradient-to-r from-yellow-300 to-yellow-500' : 'bg-warning',
    error: useGradient ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-error',
    info: useGradient ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-info',
  };

  // Determine if progress is complete
  const isComplete = percentage >= 100;

  // Create custom stripe animation if needed
  const stripeAnimation = animated ? {
    backgroundSize: '1rem 1rem',
    backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
  } : {};

  // Handle pulse animation for completed state
  const pulseVariants = {
    pulse: {
      scale: [1, 1.01, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        repeat: Infinity,
        duration: 2,
      },
    },
    idle: {
      scale: 1,
      opacity: 1,
    },
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          <motion.span 
            className="text-xs font-medium text-neutral-500"
            key={displayPercentage} // Force re-render on value change
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {formatValue(displayPercentage)}
          </motion.span>
        </div>
      )}
      
      <div 
        className={`${containerClasses} ${sizeClasses[size]}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Markers for progress milestones */}
        {showMarkers && markerPercentages.map(markerPercentage => (
          <div 
            key={markerPercentage}
            className="absolute top-0 bottom-0 w-px bg-neutral-300 z-10"
            style={{ left: `${markerPercentage}%` }}
            aria-hidden="true"
          >
            <div 
              className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 text-[10px] text-neutral-500"
              style={{ whiteSpace: 'nowrap' }}
            >
              {markerPercentage}%
            </div>
          </div>
        ))}
        
        {/* Animated progress bar */}
        <motion.div
          className={`${variantClasses[variant]} h-full relative`}
          style={{ 
            ...stripeAnimation,
            width: animateOnLoad ? '0%' : `${percentage}%`, 
          }}
          initial={{ width: animateOnLoad ? '0%' : `${percentage}%` }}
          animate={isComplete && pulseWhenComplete 
            ? {
                ...controls,
                width: `${percentage}%`,
                scale: [1, 1.01, 1],
                opacity: [0.9, 1, 0.9],
                transition: { repeat: Infinity, duration: 2 }
              }
            : controls
          }
          variants={pulseWhenComplete && isComplete ? pulseVariants : undefined}
          whileHover={isComplete && pulseWhenComplete ? { scale: 1.01 } : undefined}
          role="progressbar"
          aria-valuenow={displayValue}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {showPercentage && (size === 'lg' || size === 'xl') && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className="text-xs font-medium text-white tracking-wider"
                key={displayPercentage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {formatValue(displayPercentage)}
              </motion.span>
            </div>
          )}
          
          {/* Shimmer effect */}
          {isComplete && (
            <motion.div
              className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            className="absolute mt-1 bg-neutral-800 text-white text-xs py-1 px-2 rounded shadow-lg z-20"
            style={{ 
              left: `calc(${displayPercentage}% - ${displayPercentage === 0 ? '0' : '12px'})`,
              transform: 'translateX(-50%)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {formatValue(displayPercentage)}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-neutral-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressBar;