import React from 'react';
import { motion } from 'framer-motion';
import Spinner from '@/components/common/Spinner';

export interface StateDisplayProps {
  /**
   * State name to display
   */
  label: string;
  
  /**
   * State variant that determines the color
   */
  state: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral' | 'loading';
  
  /**
   * Optional icon to display before the label
   */
  icon?: React.ReactNode;
  
  /**
   * Size of the state display
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Display as pill (fully rounded) or with slight rounded corners
   * @default true
   */
  pill?: boolean;
  
  /**
   * Show dot indicator before label
   * @default true
   */
  showDot?: boolean;
  
  /**
   * Animation preset for entrance effect
   * @default "fade"
   */
  animation?: 'fade' | 'scale' | 'bounce' | 'none';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * StateDisplay component to show statuses with consistent styling and animations
 */
const StateDisplay: React.FC<StateDisplayProps> = ({
  label,
  state,
  icon,
  size = 'md',
  pill = true,
  showDot = true,
  animation = 'fade',
  className = '',
  onClick,
}) => {
  // Color variants for different states - using theme values from index.css @theme directive
  const stateColors = {
    success: {
      bg: 'bg-success/10',
      text: 'text-success',
      dot: 'bg-success',
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      dot: 'bg-warning',
    },
    error: {
      bg: 'bg-error/10',
      text: 'text-error',
      dot: 'bg-error',
    },
    info: {
      bg: 'bg-info/10',
      text: 'text-info',
      dot: 'bg-info',
    },
    pending: {
      bg: 'bg-neutral-400/10',
      text: 'text-neutral-500',
      dot: 'bg-neutral-400',
    },
    neutral: {
      bg: 'bg-neutral-200',
      text: 'text-neutral-700',
      dot: 'bg-neutral-400',
    },
    loading: {
      bg: 'bg-primary-500/10',
      text: 'text-primary-600',
      dot: 'bg-primary-500',
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Dot size classes - ensuring perfect circles with consistent sizing
  const dotSizeClasses = {
    sm: 'w-2 h-2 flex-shrink-0',
    md: 'w-2.5 h-2.5 flex-shrink-0',
    lg: 'w-3 h-3 flex-shrink-0',
  };
  
  // Animation variants based on animation prop
  const animationVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    bounce: {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 15 } }
    },
    none: {
      hidden: {},
      visible: {}
    }
  };

  const currentState = stateColors[state];
  const isLoading = state === 'loading';
  const spinnerSize = size === 'lg' ? 'sm' : 'xs';
  
  return (
    <motion.span 
      className={`
        inline-flex items-center
        font-medium 
        ${currentState.bg} 
        ${currentState.text} 
        ${sizeClasses[size]}
        ${pill ? 'rounded-full' : 'rounded'}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      initial="hidden"
      animate="visible"
      variants={animationVariants[animation]}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.03 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {isLoading ? (
        <Spinner 
          size={spinnerSize} 
          variant={state === 'loading' ? 'primary' : 'neutral'} 
          className="mr-1.5 flex-shrink-0"
          animation="spin"
          speed="fast"
        />
      ) : showDot ? (
        <motion.span 
          className={`
            ${dotSizeClasses[size]} 
            ${currentState.dot} 
            rounded-full 
            mr-1.5
            block
          `}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: state === 'pending' ? [0.7, 1, 0.7] : 1
          }}
          transition={{ 
            duration: 2, 
            repeat: state === 'pending' ? Infinity : 0,
            repeatType: 'loop'
          }}
        />
      ) : null}
      
      {icon && (
        <span className="mr-1">{icon}</span>
      )}
      
      <motion.span
        animate={state === 'pending' ? { opacity: [0.8, 1, 0.8] } : {}}
        transition={{ duration: 1.5, repeat: state === 'pending' ? Infinity : 0 }}
      >
        {label}
      </motion.span>
    </motion.span>
  );
};

export default StateDisplay;