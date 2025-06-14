import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "animate" | "initial" | "transition" | "whileHover" | "whileTap"> {
  children: React.ReactNode;
  /**
   * Button visual variant
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'info' | 'warning' | 'link';
  
  /**
   * Button size
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Shows loading spinner
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Makes the button take the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Optional icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Optional icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Animation variant for the button
   * @default "default"
   */
  animationVariant?: 'default' | 'subtle' | 'emphatic' | 'bounce' | 'pulse' | 'none';
  
  /**
   * Whether to show the ripple effect on click
   * @default true
   */
  showRipple?: boolean;
  
  /**
   * Button shape variant
   * @default "rounded"
   */
  shape?: 'rounded' | 'square' | 'pill' | 'circle';
  
  /**
   * Loading text to display next to spinner
   */
  loadingText?: string;
  
  /**
   * Whether to show a tooltip on hover
   * @default false
   */
  tooltip?: string;
  
  /**
   * Additional classes for the button content wrapper
   */
  contentClassName?: string;
}

/**
 * Primary UI component for user interaction with enhanced animations
 */
const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  animationVariant = 'default',
  showRipple = true,
  shape = 'rounded',
  loadingText,
  tooltip,
  contentClassName = '',
  ...props
}) => {
  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // States for ripple effect
  const [ripples, setRipples] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [rippleCount, setRippleCount] = useState(0);
  
  // Base classes that apply to all button variants
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Classes based on button variant
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-50 text-neutral-700 focus:ring-primary-500',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-primary-500',
    danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
    success: 'bg-success text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-500',
    info: 'bg-info text-white hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-500',
    warning: 'bg-warning text-neutral-900 hover:bg-yellow-500 active:bg-yellow-600 focus:ring-yellow-500',
    link: 'bg-transparent text-primary-500 hover:text-primary-600 hover:underline focus:ring-primary-500 focus:ring-offset-0'
  };
  
  // Classes based on button size
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  // Classes based on button shape
  const shapeClasses = {
    rounded: 'rounded-md',
    square: 'rounded-none',
    pill: 'rounded-full',
    circle: 'rounded-full aspect-square p-0 flex items-center justify-center'
  };
  
  // Additional classes
  const additionalClasses = [
    disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
    fullWidth ? 'w-full' : '',
  ];
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    shapeClasses[shape],
    ...additionalClasses,
    className
  ].join(' ');
  
  // Calculate icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'xs': return 'h-3 w-3';
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-5 w-5';
      case 'lg': return 'h-6 w-6';
      case 'xl': return 'h-7 w-7';
      default: return 'h-5 w-5';
    }
  };

  // Animation variants for different button states
  const animationVariants = {
    default: {
      tap: { scale: 0.97 },
      hover: { scale: 1.03 },
      initial: { scale: 1 }
    },
    subtle: {
      tap: { scale: 0.99 },
      hover: { scale: 1.01 },
      initial: { scale: 1 }
    },
    emphatic: {
      tap: { scale: 0.95 },
      hover: { scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
      initial: { scale: 1 }
    },
    bounce: {
      tap: { scale: 0.95 },
      hover: { y: [0, -6, 0], transition: { repeat: Infinity, duration: 1 } },
      initial: { scale: 1 }
    },
    pulse: {
      tap: { scale: 0.97 },
      hover: { 
        scale: [1, 1.05, 1], 
        transition: { 
          repeat: Infinity, 
          duration: 1.5,
          ease: "easeInOut"
        } 
      },
      initial: { scale: 1 }
    },
    none: {
      tap: {},
      hover: {},
      initial: {}
    }
  };

  // Handle ripple effect
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || !showRipple) return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const newRipple = {
      id: rippleCount,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setRipples([...ripples, newRipple]);
    setRippleCount(rippleCount + 1);
  };
  
  // Clear ripples after animation
  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    if (ripples.length > 0) {
      const id = setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 600);
      timeoutIds.push(id);
    }
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [ripples]);
  
  // Handle Escape key for accessibility
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (isHovered && e.key === 'Escape' && buttonRef.current) {
        setIsHovered(false);
        buttonRef.current.blur();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isHovered]);

  // Calculate the circle size for the ripple effect (diagonal of the button)
  const getRippleSize = () => {
    if (!buttonRef.current) return 0;
    const { width, height } = buttonRef.current.getBoundingClientRect();
    return Math.max(width, height) * 2; // Make sure ripple covers the entire button
  };

  return (
    <motion.button
      ref={buttonRef}
      className={classes}
      disabled={disabled || isLoading}
      initial="initial"
      whileHover={!disabled && !isLoading ? "hover" : "initial"}
      whileTap={!disabled && !isLoading ? "tap" : "initial"}
      variants={animationVariants[animationVariant]}
      onClick={(e) => {
        handleRipple(e);
        props.onClick?.(e);
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-busy={isLoading}
      {...props}
    >
      {/* Ripple effect */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none bg-white bg-opacity-25"
          initial={{ 
            width: 0, 
            height: 0,
            opacity: 0.35,
            x: ripple.x, 
            y: ripple.y,
            translateX: '-50%', 
            translateY: '-50%' 
          }}
          animate={{ 
            width: getRippleSize(), 
            height: getRippleSize(),
            opacity: 0
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      
      <span className={`inline-flex items-center gap-2 ${contentClassName}`}>
        {isLoading ? (
          <>
            <motion.span 
              className="inline-block h-4 w-4 rounded-full border-2 border-solid border-current border-r-transparent" 
              role="presentation"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <motion.span 
                className={`${getIconSize()} flex-shrink-0`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {leftIcon}
              </motion.span>
            )}
            <span className="inline-flex items-center">{children}</span>
            {rightIcon && (
              <motion.span 
                className={`${getIconSize()} flex-shrink-0`}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {rightIcon}
              </motion.span>
            )}
          </>
        )}
      </span>
      
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && isHovered && !disabled && !isLoading && (
          <motion.div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded pointer-events-none z-50 whitespace-nowrap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            {tooltip}
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-px border-4 border-transparent border-t-neutral-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Button;