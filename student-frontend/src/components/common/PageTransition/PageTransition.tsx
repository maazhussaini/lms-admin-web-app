import React from 'react';
import { motion } from 'framer-motion';

export interface PageTransitionProps {
  /**
   * Page content to animate
   */
  children: React.ReactNode;
  
  /**
   * Duration of the animation in seconds
   * @default 0.3
   */
  duration?: number;
  
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number;
  
  /**
   * Additional classes for the transition container
   */
  className?: string;
}

/**
 * Animated page transition component using Framer Motion
 * 
 * @example
 * // Basic usage
 * <PageTransition>
 *   <DashboardPage />
 * </PageTransition>
 * 
 * @example
 * // With custom duration and delay
 * <PageTransition duration={0.5} delay={0.1}>
 *   <ComponentWithHeavyContent />
 * </PageTransition>
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  duration = 0.3,
  delay = 0,
  className = ''
}) => {
  // Animation variants
  const variants = {
    initial: {
      opacity: 0,
      y: 10
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: 'easeInOut'
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: duration * 0.75,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full h-full bg-neutral-50 text-neutral-800 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;