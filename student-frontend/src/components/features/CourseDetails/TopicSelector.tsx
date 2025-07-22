import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { CourseDetailsData } from '@/pages/CourseDetailsPage/mockData';

export interface TopicSelectorProps {
  /** Course details data containing all modules and topics */
  courseDetails: CourseDetailsData;
  /** Current module ID */
  moduleId: number;
  /** Currently active topic ID */
  currentTopicId: number;
  /** Handler for topic selection */
  onTopicSelect: (topicId: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TopicSelector - Interactive horizontal selector for navigating between topics within a module
 * 
 * Features:
 * - Horizontal scrollable list of topics with drag-to-scroll
 * - Current topic highlighting with smooth animations
 * - Smart click vs drag detection
 * - Topic information display (number, name, video count, materials count)
 * - Responsive design with touch-friendly interactions
 * - Hover effects with proper container constraints
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const TopicSelector: React.FC<TopicSelectorProps> = ({
  courseDetails,
  moduleId,
  currentTopicId,
  onTopicSelect,
  className
}) => {
  // Find the current module and its topics
  const currentModule = courseDetails.modules?.find(
    module => module.course_module_id === moduleId
  );
  const topics = currentModule?.topics || [];
  const currentIndex = topics.findIndex(topic => topic.course_topic_id === currentTopicId);
  
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

  // Get topic display information
  const getTopicInfo = (topic: CourseDetailsData['modules'][0]['topics'][0], index: number) => {
    const videoCount = topic.videos?.length || 0;
    const materialCount = topic.documents?.length || 0;
    
    return {
      number: index + 1,
      name: topic.course_topic_name || `Topic ${index + 1}`,
      videoCount,
      materialCount
    };
  };

  // If no topics or module not found, don't render
  if (!currentModule || topics.length === 0) {
    return null;
  }

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
          {currentModule.course_module_name || `Module ${moduleId}`} Topics
        </h3>
        <span className="text-sm text-neutral-500">
          {currentIndex + 1} of {topics.length}
        </span>
      </div>

      {/* Topics Container - Scrollable with drag */}
      <div className="px-4 pb-4">
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
            {topics.map((topic, index) => {
              const isActive = topic.course_topic_id === currentTopicId;
              const topicInfo = getTopicInfo(topic, index);
              
              return (
                <motion.button
                  key={topic.course_topic_id}
                  onClick={(e) => {
                    // Only trigger click if not dragging
                    if (!isDragging) {
                      onTopicSelect(topic.course_topic_id);
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
                      layoutId="activeTopic"
                      className="absolute inset-0 bg-primary-900 rounded-xl shadow-lg"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                  
                  {/* Topic content */}
                  <div className="relative z-10 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">
                        Topic {topicInfo.number}
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
                        {topicInfo.videoCount} videos
                      </span>
                    </div>
                    <p className={clsx(
                      'text-xs font-medium truncate',
                      {
                        'text-primary-100': isActive,
                        'text-neutral-600': !isActive
                      }
                    )}>
                      {topicInfo.name}
                    </p>
                    <p className={clsx(
                      'text-xs mt-1',
                      {
                        'text-primary-200': isActive,
                        'text-neutral-500': !isActive
                      }
                    )}>
                      {topicInfo.materialCount} materials
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { TopicSelector };
export default TopicSelector;
