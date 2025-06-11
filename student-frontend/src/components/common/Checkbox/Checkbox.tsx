import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label for the checkbox
   */
  label?: React.ReactNode;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display below the checkbox
   */
  helperText?: string;
  
  /**
   * Position the label before or after the checkbox
   * @default "right"
   */
  labelPosition?: 'left' | 'right';
  
  /**
   * Class name for the outer wrapper
   */
  wrapperClassName?: string;
  
  /**
   * Animation preset
   * @default "scale"
   */
  animationPreset?: 'scale' | 'pulse' | 'none';
  
  /**
   * Container ID for accessibility
   */
  containerId?: string;
}

/**
 * Checkbox component with styling and animation
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      checked = false,
      disabled = false,
      labelPosition = 'right',
      wrapperClassName = '',
      animationPreset = 'scale',
      containerId,
      className = '',
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility if not provided
    const uniqueId = React.useId();
    const checkboxId = id || `checkbox-${uniqueId}`;
    const wrapperId = containerId || `checkbox-wrapper-${uniqueId}`;
    const errorId = error ? `error-${uniqueId}` : undefined;
    const helperId = helperText ? `helper-${uniqueId}` : undefined;
    
    // Define animation variants based on preset
    const checkboxAnimations = {
      scale: {
        checked: {
          scale: [1, 1.2, 1],
          transition: { duration: 0.2 }
        },
        unchecked: {
          scale: 1,
        }
      },
      pulse: {
        checked: { 
          opacity: [1, 0.7, 1],
          transition: { duration: 0.3 }
        },
        unchecked: {
          opacity: 1,
        }
      },
      none: {
        checked: {},
        unchecked: {}
      }
    };

    // Animation variant based on checkbox state
    const currentAnimation = animationPreset !== 'none' 
      ? checkboxAnimations[animationPreset] 
      : checkboxAnimations.none;

    return (
      <div id={wrapperId} className={`flex flex-col ${wrapperClassName}`}>
        <label 
          htmlFor={checkboxId} 
          className={`
            inline-flex items-center select-none
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'flex-row'}
          `}
        >
          {/* Custom styled checkbox container */}
          <motion.div
            className={`
              relative flex items-center justify-center
              h-5 w-5 border rounded
              ${checked && !disabled 
                ? 'bg-primary-500 border-primary-500' 
                : 'bg-white border-neutral-300'
              }
              ${disabled 
                ? 'bg-neutral-100 border-neutral-300' 
                : checked 
                  ? 'bg-primary-500 border-primary-500' 
                  : 'hover:border-primary-500'
              }
              ${error ? 'border-error-500' : ''}
              transition-colors duration-200
            `}
            initial={false}
            animate={checked ? 'checked' : 'unchecked'}
            variants={currentAnimation}
          >
            {/* Checkmark SVG icon */}
            {checked && (
              <motion.svg
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="w-3.5 h-3.5 text-white pointer-events-none"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 5.5L4 8L10.5 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
            
            {/* Hidden actual checkbox for accessibility */}
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="absolute opacity-0 h-0 w-0"
              aria-invalid={error ? true : undefined}
              aria-describedby={
                error ? errorId : helperText ? helperId : undefined
              }
              {...props}
            />
          </motion.div>
          
          {/* Label text */}
          {label && (
            <span 
              className={`
                text-sm font-medium text-neutral-700
                ${labelPosition === 'left' ? 'mr-2' : 'ml-2'}
              `}
            >
              {label}
            </span>
          )}
        </label>
        
        {/* Error message or helper text */}
        {(error || helperText) && (
          <div 
            className={`mt-1.5 text-xs ${labelPosition === 'left' ? 'text-right' : 'text-left'}`}
            id={error ? errorId : helperId}
          >
            {error ? (
              <span className="text-error-500">{error}</span>
            ) : helperText ? (
              <span className="text-neutral-500">{helperText}</span>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
