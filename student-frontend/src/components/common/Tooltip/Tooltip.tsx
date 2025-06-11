import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-1 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-1 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-1 mr-2',
  };
  
  // Animation variants
  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.15 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.15 }
    }
  };
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`
              absolute z-50 px-2 py-1 text-xs font-medium text-white 
              bg-neutral-800 rounded-md shadow-md pointer-events-none
              whitespace-nowrap
              ${positionClasses[position]}
            `}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tooltipVariants}
            role="tooltip"
          >
            {text}
            <div
              className={`
                absolute w-2 h-2 bg-neutral-800 transform rotate-45
                ${position === 'top' ? 'top-full -translate-y-1/2 left-1/2 -translate-x-1/2' : ''}
                ${position === 'right' ? 'right-full translate-x-1/2 top-1/2 -translate-y-1/2' : ''}
                ${position === 'bottom' ? 'bottom-full translate-y-1/2 left-1/2 -translate-x-1/2' : ''}
                ${position === 'left' ? 'left-full -translate-x-1/2 top-1/2 -translate-y-1/2' : ''}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
