import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StateDisplay from '@/components/common/StateDisplay';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input label
   */
  label?: string;
  
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Input size
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Makes the input take the full width of its container
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * Additional classes for the input wrapper
   */
  wrapperClassName?: string;
  
  /**
   * ID for the input element
   */
  id?: string;
  
  /**
   * Show success state when input is valid
   * @default false
   */
  showSuccess?: boolean;
  
  /**
   * Success message
   */
  successMessage?: string;
  
  /**
   * Whether the input is loading
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Whether to animate the input
   * @default true
   */
  animate?: boolean;

  /**
   * Makes the right icon clickable instead of just decorative
   * @default false
   */
  interactiveRightIcon?: boolean;
}

/**
 * Input component for text entry with animation and enhanced UX
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      helperText,
      error,
      size = 'md',
      leftIcon,
      rightIcon,
      interactiveRightIcon = false,
      fullWidth = true,
      wrapperClassName = '',
      disabled = false,
      id,
      showSuccess = false,
      successMessage,
      isLoading = false,
      animate = true,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if one isn't provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // State for focus effect
    const [isFocused, setIsFocused] = useState(false);
    
    // Handle focus and blur events
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };
    
    // Style classes based on size
    const sizeClasses = {
      sm: 'py-1.5 px-2.5 text-xs',
      md: 'py-2 px-3 text-sm',
      lg: 'py-2.5 px-4 text-base',
    };
    
    // Size classes for icons
    const iconSizeClasses = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };
    
    // Determine the input state for styling
    const hasError = !!error;
    const isSuccess = showSuccess && !hasError && !disabled && !isLoading;
    
    // Generate input classes
    const inputClasses = [
      'bg-white border rounded-md focus:outline-none focus:ring-2 block transition-all duration-200',
      sizeClasses[size],
      leftIcon ? 'pl-9' : '',
      rightIcon ? 'pr-9' : '',
      disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : '',
      isLoading ? 'bg-neutral-50' : '',
      hasError 
        ? 'border-error focus:border-error focus:ring-error' 
        : isSuccess
          ? 'border-success focus:border-success focus:ring-success' 
          : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
      className,
    ].join(' ');
    
    // Animation variants
    const labelVariants = {
      idle: { y: 0, opacity: 0.9 },
      focus: { y: -2, opacity: 1 }
    };
    
    const inputVariants = {
      initial: { y: 5, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { duration: 0.3 } }
    };
    
    const feedbackVariants = {
      initial: { opacity: 0, height: 0 },
      animate: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
      exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
    };
    
    const iconVariants = {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } },
      exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } }
    };
    
    // Loader animation for the icon during loading state
    const loaderVariants = {
      animate: {
        rotate: 360,
        transition: {
          repeat: Infinity,
          duration: 1,
          ease: "linear"
        }
      }
    };
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
        {label && (
          <motion.label 
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1"
            initial={animate ? "idle" : undefined}
            animate={animate && isFocused ? "focus" : "idle"}
            variants={labelVariants}
          >
            {label}
          </motion.label>
        )}
        
        <motion.div 
          className="relative"
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
          variants={inputVariants}
        >
          {/* Left icon */}
          <AnimatePresence mode="wait">
            {leftIcon && (
              <motion.div 
                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500"
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                exit="exit"
                variants={iconVariants}
              >
                {isLoading ? (
                  <motion.svg
                    className={`${iconSizeClasses[size]} text-primary-500`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    animate="animate"
                    variants={loaderVariants}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                ) : (
                  leftIcon
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Input field */}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled || isLoading}
            className={inputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {/* Right icon or status icon */}
          <AnimatePresence mode="wait">
            {rightIcon && !hasError && !isSuccess && (
              <motion.div 
                className={`absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 ${interactiveRightIcon ? 'pointer-events-auto' : 'pointer-events-none'}`}
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                exit="exit"
                variants={iconVariants}
              >
                {rightIcon}
              </motion.div>
            )}
            
            {hasError && (
              <motion.div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-error"
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                exit="exit"
                variants={iconVariants}
              >
                <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
            )}
            
            {isSuccess && (
              <motion.div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-success"
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                exit="exit"
                variants={iconVariants}
              >
                <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Helper text, error, or success message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={animate ? "initial" : undefined}
              animate={animate ? "animate" : undefined}
              exit="exit"
              variants={feedbackVariants}
              className="mt-1"
            >
              <StateDisplay 
                label={error} 
                state="error" 
                size="sm" 
              />
            </motion.div>
          )}
          
          {isSuccess && successMessage && (
            <motion.div
              initial={animate ? "initial" : undefined}
              animate={animate ? "animate" : undefined}
              exit="exit"
              variants={feedbackVariants}
              className="mt-1"
            >
              <StateDisplay 
                label={successMessage} 
                state="success" 
                size="sm" 
              />
            </motion.div>
          )}
          
          {!error && !isSuccess && helperText && (
            <motion.p 
              className="mt-1 text-sm text-neutral-500"
              initial={animate ? "initial" : undefined}
              animate={animate ? "animate" : undefined}
              exit="exit"
              variants={feedbackVariants}
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;