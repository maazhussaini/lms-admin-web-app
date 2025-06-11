import React from 'react';
import { motion } from 'framer-motion';

interface ShimmerProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = 'w-full',
  height = 'h-5',
  className = '',
  rounded = 'rounded'
}) => {
  // Convert string width/height to classes if they're not already classes
  const widthClass = typeof width === 'string' && width.startsWith('w-') 
    ? width 
    : typeof width === 'number' 
      ? `w-[${width}px]` 
      : width;
      
  const heightClass = typeof height === 'string' && height.startsWith('h-') 
    ? height 
    : typeof height === 'number' 
      ? `h-[${height}px]` 
      : height;
  
  return (
    <div 
      className={`relative overflow-hidden ${widthClass} ${heightClass} ${rounded} bg-neutral-200 ${className}`}
      aria-hidden="true"
    >
      <motion.div 
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200"
        animate={{ 
          x: ['0%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default Shimmer;
