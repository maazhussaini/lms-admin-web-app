import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * The current checked state of the toggle
   */
  checked?: boolean;
  
  /**
   * Label text to display
   */
  label?: React.ReactNode;

  /**
   * Position the label before or after the toggle
   * @default "right"
   */
  labelPosition?: 'left' | 'right';
  
  /**
   * Size variant
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display
   */
  helperText?: string;
  
  /**
   * Class name for the container
   */
  wrapperClassName?: string;
  
  /**
   * Customize animation
   * @default true
   */
  animate?: boolean;
}

/**
 * Switch component that provides a toggle switch UI element with accessibility support
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      id,
      label,
      checked = false,
      disabled = false,
      onChange,
      labelPosition = 'right',
      size = 'md',
      error,
      helperText,
      wrapperClassName = '',
      animate = true,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for accessibility
    const uniqueId = React.useId();
    const switchId = id || `switch-${uniqueId}`;
    const errorId = error ? `error-${uniqueId}` : undefined;
    const helperId = helperText ? `helper-${uniqueId}` : undefined;
    
    // Size configurations
    const sizeConfig = {
      sm: {
        track: 'w-8 h-4',
        circle: 'w-3 h-3',
        translateX: 16,
        label: 'text-xs',
      },
      md: {
        track: 'w-10 h-5',
        circle: 'w-3.5 h-3.5',
        translateX: 20,
        label: 'text-sm',
      },
      lg: {
        track: 'w-12 h-6',
        circle: 'w-4 h-4',
        translateX: 24,
        label: 'text-base',
      },
    };
    
    // Calculate styles based on size
    const { track, circle, translateX, label: labelSize } = sizeConfig[size];

    return (
      <div className={`flex flex-col ${wrapperClassName}`}>
        <label 
          htmlFor={switchId} 
          className={`
            inline-flex items-center select-none
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'flex-row'}
          `}
        >
          {/* Switch track with circle thumb */}
          <div className="relative">
            {/* Track */}
            <div
              className={`
                ${track}
                ${checked && !disabled 
                  ? 'bg-primary-500' 
                  : 'bg-neutral-300'
                }
                ${disabled ? 'opacity-70' : ''}
                ${error ? 'ring-1 ring-error-500' : ''}
                rounded-full transition-colors duration-300 ease-in-out
              `}
            />
            
            {/* Thumb/Circle */}
            <motion.div
              className={`
                ${circle} 
                bg-white rounded-full shadow-md absolute top-[50%] left-[2px]
                transform -translate-y-1/2
              `}
              initial={false}
              animate={{
                translateX: checked ? translateX - 4 : 0,
                backgroundColor: checked ? 'white' : 'white',
              }}
              transition={animate ? {
                type: 'spring',
                stiffness: 500,
                damping: 30
              } : {
                duration: 0
              }}
            />
            
            {/* Hidden checkbox for accessibility */}
            <input
              id={switchId}
              type="checkbox"
              ref={ref}
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              className="sr-only"
              aria-invalid={error ? true : undefined}
              aria-describedby={
                error ? errorId : helperText ? helperId : undefined
              }
              {...props}
            />
          </div>
          
          {/* Label */}
          {label && (
            <span 
              className={`
                ${labelSize} font-medium text-neutral-700
                ${labelPosition === 'left' ? 'mr-2' : 'ml-2'}
              `}
            >
              {label}
            </span>
          )}
        </label>
        
        {/* Error or helper text */}
        {(error || helperText) && (
          <div 
            className={`mt-1 text-xs ${labelPosition === 'left' ? 'text-right' : 'text-left'}`}
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

Switch.displayName = 'Switch';

export default Switch;
