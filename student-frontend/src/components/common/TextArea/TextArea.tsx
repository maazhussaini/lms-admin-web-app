import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StateDisplay from '@/components/common/StateDisplay';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /**
   * TextArea label
   */
  label?: string;
  
  /**
   * Helper text displayed below the textarea
   */
  helperText?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * TextArea size
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Makes the textarea take the full width of its container
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * Maximum number of rows before scrolling begins
   * @default 4
   */
  rows?: number;
  
  /**
   * Additional classes for the textarea wrapper
   */
  wrapperClassName?: string;
  
  /**
   * Animation preset for the textarea mount
   * @default "fade"
   */
  animation?: 'fade' | 'scale' | 'none';
  
  /**
   * Show character count
   * @default false
   */
  showCharCount?: boolean;
  
  /**
   * ID for the textarea element
   */
  id?: string;
}

/**
 * TextArea component for multi-line text entry with animation support
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className = '',
      label,
      helperText,
      error,
      size = 'md',
      fullWidth = true,
      rows = 4,
      wrapperClassName = '',
      disabled = false,
      animation = 'fade',
      showCharCount = false,
      maxLength,
      id,
      ...props
    },
    ref
  ) => {
    // State for focus animation and character count
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(props.value?.toString().length || 0);
    
    // Generate a unique ID if one isn't provided
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    
    // Style classes based on size
    const sizeClasses = {
      sm: 'py-1.5 px-2.5 text-xs',
      md: 'py-2 px-3 text-sm',
      lg: 'py-2.5 px-4 text-base',
    };
    
    // Animation variants
    const animationVariants = {
      fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
      },
      scale: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
      },
      none: {
        hidden: {},
        visible: {}
      }
    };

    // Error animation variants
    const errorAnimationVariants = {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };
    
    // Generate textarea classes
    const textareaClasses = [
      'bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block resize-y transition-all duration-200',
      sizeClasses[size],
      disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : '',
      error ? 'border-error focus:border-error focus:ring-error' : 'border-neutral-300',
      className,
    ].join(' ');

    // Handle character count update
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (props.onChange) {
        props.onChange(e);
      }
    };
    
    return (
      <motion.div 
        className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}
        initial="hidden"
        animate="visible"
        variants={animationVariants[animation]}
      >
        {label && (
          <motion.label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </motion.label>
        )}
        
        <motion.div
          animate={isFocused ? { scale: 1.005 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative"
        >
          <textarea
            id={textareaId}
            ref={ref}
            disabled={disabled}
            rows={rows}
            className={textareaClasses}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
        </motion.div>

        <div className="mt-1 flex justify-between items-start">
          <AnimatePresence>
            {error ? (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={errorAnimationVariants}
                className="flex-1"
              >
                <StateDisplay 
                  label={error} 
                  state="error" 
                  size={size === 'lg' ? 'md' : 'sm'}
                  animation="fade"
                  pill={false}
                />
              </motion.div>
            ) : helperText ? (
              <motion.p 
                className="text-sm text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {helperText}
              </motion.p>
            ) : null}
          </AnimatePresence>
          
          {showCharCount && maxLength && (
            <motion.span 
              className={`text-xs ${
                charCount > maxLength * 0.9 
                  ? charCount >= maxLength 
                    ? 'text-error' 
                    : 'text-warning' 
                  : 'text-neutral-500'
              }`}
              animate={{
                scale: charCount >= maxLength ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {charCount}/{maxLength}
            </motion.span>
          )}
        </div>
      </motion.div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;