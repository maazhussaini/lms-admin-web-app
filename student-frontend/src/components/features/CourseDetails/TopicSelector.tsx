import React, { useMemo } from 'react';
import { ItemSelector } from '@/components/common/ItemSelector';
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
 * - Business-approved white container with shadow design
 * - Header with "Module Topics" title and topic counter
 * - Custom drag-to-scroll implementation
 * - Active topic highlighting with blue color scheme
 * - Responsive design with minimum item widths
 * - Smooth animations with Framer Motion
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
  // Transform topics to items for the new ItemSelector
  const items = useMemo(() => {
    return topics.map((topic, index) => ({
      id: topic.course_topic_id.toString(),
      title: `Topic ${index + 1}`,
      subtitle: topic.course_topic_name,
      description: `${topic.overall_video_lectures || 0}`,
      count: parseInt(topic.overall_video_lectures || '0', 10),
      countLabel: 'Videos',
    }));
  }, [topics]);

  // Find current topic index for display
  const currentIndex = useMemo(() => {
    const index = topics.findIndex(topic => topic.course_topic_id === currentTopicId);
    return index !== -1 ? index + 1 : 1;
  }, [topics, currentTopicId]);

  // Handle topic selection - convert string ID back to number
  const handleTopicSelect = (item: { id: string; title: string; description?: string }) => {
    const topicId = parseInt(item.id, 10);
    onTopicSelect(topicId);
  };

  return (
    <ItemSelector
      items={items}
      selectedItemId={currentTopicId.toString()}
      onItemSelect={handleTopicSelect}
      title="Module Topics"
      totalCount={topics.length}
      currentIndex={currentIndex}
      className={className}
    />
  );
};

export default TopicSelector;
