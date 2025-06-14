import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  /**
   * Toast message content
   */
  message: string;
  
  /**
   * Type of toast that determines its color and icon
   */
  type: 'success' | 'error' | 'info' | 'warning';
  
  /**
   * Function to call when toast is closed
   */
  onClose: () => void;
  
  /**
   * Auto-hide duration in milliseconds
   * @default 5000
   */
  duration?: number;
  
  /**
   * Position of the toast
   * @default "bottom-right"
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  
  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;
}

/**
 * Toast notification component for user feedback
 */
const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
  position = 'bottom-right',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
    
    // Return undefined for consistency when duration <= 0
    return undefined;
  }, [duration, onClose]);
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };
  
  // Type variants
  const typeVariants = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      ),
      bgColor: 'bg-success',
      textColor: 'text-white',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      ),
      bgColor: 'bg-error',
      textColor: 'text-white',
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      bgColor: 'bg-info',
      textColor: 'text-white',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      ),
      bgColor: 'bg-warning',
      textColor: 'text-neutral-800',
    },
  };
  
  const variant = typeVariants[type];
  
  return (
    <AnimatePresence>
      <motion.div
        className={`fixed ${positionClasses[position]} z-50 max-w-xs w-full shadow-lg rounded-lg overflow-hidden pointer-events-auto`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        role="alert"
      >
        <div className={`${variant.bgColor} flex items-center p-4`}>
          <div className={`flex-shrink-0 ${variant.textColor}`}>
            {variant.icon}
          </div>
          
          <div className={`ml-3 ${variant.textColor} font-medium text-sm flex-grow`}>
            {message}
          </div>
          
          {showCloseButton && (
            <button
              type="button"
              className={`ml-4 flex-shrink-0 ${variant.textColor} focus:outline-none`}
              onClick={onClose}
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;