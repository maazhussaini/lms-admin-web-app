import React from 'react';
import { motion, type Variants } from 'framer-motion';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Optional card title
   */
  title?: React.ReactNode;
  
  /**
   * Optional card footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Optional CSS classes for the header
   */
  headerClassName?: string;
  
  /**
   * Optional CSS classes for the body
   */
  bodyClassName?: string;
  
  /**
   * Optional CSS classes for the footer
   */
  footerClassName?: string;
  
  /**
   * Optional hover effect
   * @default false
   */
  hoverable?: boolean;
  
  /**
   * Animation preset for the card
   * @default "fade"
   */
  animationPreset?: 'fade' | 'slide' | 'scale' | 'none';
  
  /**
   * Initial animation delay in seconds
   * @default 0
   */
  animationDelay?: number;
  
  /**
   * Whether to animate the card on hover
   * @default true when hoverable is true
   */
  animateOnHover?: boolean;
  
  /**
   * Custom onClick handler for the card
   */
  onClick?: () => void;
}

/**
 * Card component with animation capabilities for displaying content in a box with optional header and footer
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  hoverable = false,
  animationPreset = 'fade',
  animationDelay = 0,
  animateOnHover,
  onClick,
}) => {
  // Default hover animation to true if the card is hoverable
  const shouldAnimateOnHover = animateOnHover !== undefined ? animateOnHover : hoverable;
  
  // Animation variants for different animation presets
  const cardAnimations: Record<string, Variants> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.4, delay: animationDelay } },
      hover: shouldAnimateOnHover 
        ? { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }
        : {}
    },
    slide: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: animationDelay } },
      hover: shouldAnimateOnHover 
        ? { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }
        : {}
    },
    scale: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20, delay: animationDelay } },
      hover: shouldAnimateOnHover 
        ? { scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }
        : {}
    },
    none: {
      hidden: {},
      visible: {},
      hover: shouldAnimateOnHover && hoverable
        ? { boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }
        : {}
    }
  };

  const cardClasses = [
    'bg-white shadow',
    className
  ].join(' ');

  return (
    <motion.div
      className={cardClasses}
      initial="hidden"
      animate="visible"
      whileHover={shouldAnimateOnHover ? "hover" : undefined}
      variants={cardAnimations[animationPreset]}
      onClick={onClick}
      transition={{ duration: 0.2 }} // Default transition for hover
    >
      {title && (
        <motion.div 
          className={`px-6 py-4 border-b border-neutral-200 ${headerClassName}`}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: animationDelay + 0.1 } }
          }}
        >
          {typeof title === 'string' ? (
            <h3 className="font-heading font-medium text-lg text-neutral-900">{title}</h3>
          ) : (
            title
          )}
        </motion.div>
      )}
      
      <motion.div 
        className={`px-6 py-4 ${bodyClassName}`}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { delay: animationDelay + 0.2 } }
        }}
      >
        {children}
      </motion.div>
      
      {footer && (
        <motion.div 
          className={`px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg ${footerClassName}`}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: animationDelay + 0.3 } }
          }}
        >
          {footer}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Card;