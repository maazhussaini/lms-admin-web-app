import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { CourseModule } from '@/services/courseService';

export interface ModuleSelectorProps {
  /** List of course modules */
  modules: CourseModule[];
  /** Currently active module ID */
  currentModuleId: number;
  /** Handler for module selection */
  onModuleSelect: (moduleId: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ModuleSelector - Interactive horizontal selector for navigating between course modules
 * 
 * Features:
 * - Horizontal scrollable list of modules with drag-to-scroll
 * - Current module highlighting with smooth animations
 * - Smart click vs drag detection
 * - Module information display (number, name, topic count)
 * - Responsive design with touch-friendly interactions
 * - Hover effects with proper container constraints
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  currentModuleId,
  onModuleSelect,
  className
}) => {
  const currentIndex = modules.findIndex((module: CourseModule) => module.course_module_id === currentModuleId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Handle drag-to-scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    setDragStarted(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    
    // Prevent text selection during potential drag
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStarted || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    
    // If mouse moved more than 5 pixels, consider it a drag
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setDragStarted(false);
    // Reset dragging state after a small delay to allow click events
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseLeave = () => {
    setDragStarted(false);
    setIsDragging(false);
  };

  // Parse module stats string to extract topic and video counts
  const parseModuleStats = (moduleStats: string) => {
    // Parse format like "2 Topics | 2 Video Lectures"
    const topicMatch = moduleStats.match(/(\d+)\s+Topics?/i);
    const videoMatch = moduleStats.match(/(\d+)\s+Video\s+Lectures?/i);
    
    return {
      topicCount: topicMatch && topicMatch[1] ? parseInt(topicMatch[1], 10) : 0,
      videoCount: videoMatch && videoMatch[1] ? parseInt(videoMatch[1], 10) : 0
    };
  };

  // Get module display information
  const getModuleInfo = (module: CourseModule, index: number) => {
    const { topicCount, videoCount } = parseModuleStats(module.module_stats || '');
    
    return {
      number: index + 1,
      name: module.course_module_name || `Module ${index + 1}`,
      topicCount,
      videoCount
    };
  };

  // Always render the selector, even with empty arrays for consistent UI
  const hasModules = modules.length > 0;
  const displayModules = hasModules ? modules : [];

  return (
    <motion.div
      className={clsx(
        'w-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden',
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-lg font-semibold text-primary-900">
          Course Modules
        </h3>
        <span className="text-sm text-neutral-500">
          {hasModules ? `${currentIndex + 1} of ${modules.length}` : '0 modules'}
        </span>
      </div>

      {/* Modules Container - Scrollable with drag */}
      <div className="px-4 pb-4">
        {!hasModules ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-neutral-500 text-sm">No modules available</p>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className={clsx(
              'overflow-x-auto scrollbar-hide py-4 -my-2',
              'select-none', // Prevent text selection during drag
              {
                'cursor-grab': !isDragging && !dragStarted,
                'cursor-grabbing': isDragging || dragStarted,
              }
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // Internet Explorer 10+
            }}
          >
            <div className="flex gap-4 px-2" style={{ width: 'max-content' }}>
              {displayModules.map((module: CourseModule, index: number) => {
              const isActive = module.course_module_id === currentModuleId;
              const moduleInfo = getModuleInfo(module, index);
              
              return (
                <motion.button
                  key={module.course_module_id}
                  onClick={(e) => {
                    // Only trigger click if not dragging
                    if (!isDragging) {
                      onModuleSelect(module.course_module_id);
                    }
                    e.stopPropagation();
                  }}
                  className={clsx(
                    'flex-shrink-0 relative px-4 py-3 rounded-xl transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    'min-w-[200px]',
                    {
                      'bg-primary-900 text-white shadow-lg': isActive,
                      'bg-neutral-100 text-neutral-700 hover:bg-neutral-200': !isActive,
                      'cursor-pointer': !isDragging && !dragStarted,
                      'cursor-grabbing': isDragging || dragStarted,
                    }
                  )}
                  whileHover={{ 
                    scale: isDragging || dragStarted ? 1 : 1.03,
                    y: isDragging || dragStarted ? 0 : -2 
                  }}
                  whileTap={{ scale: isDragging || dragStarted ? 1 : 0.97 }}
                  style={{ pointerEvents: 'auto' }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeModule"
                      className="absolute inset-0 bg-primary-900 rounded-xl shadow-lg"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                  
                  {/* Module content */}
                  <div className="relative z-10 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">
                        Module {moduleInfo.number}
                      </span>
                      <span 
                        className={clsx(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          {
                            'bg-white/20 text-white': isActive,
                            'bg-primary-100 text-primary-700': !isActive
                          }
                        )}
                      >
                        {moduleInfo.topicCount} topics
                      </span>
                    </div>
                    <p className={clsx(
                      'text-xs font-medium truncate',
                      {
                        'text-primary-100': isActive,
                        'text-neutral-600': !isActive
                      }
                    )}>
                      {moduleInfo.name}
                    </p>
                    <p className={clsx(
                      'text-xs mt-1',
                      {
                        'text-primary-200': isActive,
                        'text-neutral-500': !isActive
                      }
                    )}>
                      {moduleInfo.videoCount} video lectures
                    </p>
                  </div>
                </motion.button>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { ModuleSelector };
export default ModuleSelector;
