import React, { useMemo } from 'react';
import { ItemSelector } from '@/components/common/ItemSelector';
import { topicToSelectorItem } from '@/utils/courseDetailsUtils';
import { CourseTopic } from '@/services/courseService';

export interface TopicSelectorProps {
  /** Array of topics for the current module */
  topics: CourseTopic[];
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
 * - Topic information display (number, name, video count)
 * - Responsive design with touch-friendly interactions
 * - Hover effects with proper container constraints
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  currentTopicId,
  onTopicSelect,
  className
}) => {
  // Transform topics to selector items
  const selectorItems = useMemo(() => {
    return topics.map((topic, index) => topicToSelectorItem({
      ...topic,
      videoCount: topic.overall_video_lectures ? parseInt(topic.overall_video_lectures, 10) || 0 : 0,
      displayNumber: index + 1,
    }));
  }, [topics]);

  return (
    <ItemSelector
      items={selectorItems}
      currentItemId={currentTopicId}
      onItemSelect={onTopicSelect}
      className={className}
      ariaLabel="Select topic"
      showCounts={true}
      showSubtitles={true}
    />
  );
};

export default TopicSelector;
