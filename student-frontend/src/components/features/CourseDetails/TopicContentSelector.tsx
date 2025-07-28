import React from 'react';
import ContentSelector from '@/components/common/ContentSelector';
import { CONTENT_TYPE_CONFIG } from '@/constants/courseDetails.constants';
import type { TopicContentType } from '@/types/courseDetails.ui.types';

export interface TopicContentSelectorProps {
  /** Currently active content type */
  activeContent: TopicContentType;
  /** Handler for content type change */
  onContentChange: (contentType: TopicContentType) => void;
  /** Content counts for each section */
  counts: {
    lectures: number;
    liveClasses: number;
    assignments: number;
    quizzes: number;
    materials: number;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * TopicContentSelector - Selector component for switching between topic content types
 * 
 * Displays tabs for Lectures, Live Classes, Assignments, Quizzes, and Materials within a topic.
 * Features smooth animations and follows the LMS design system.
 * Shows content counts for each section.
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const TopicContentSelector: React.FC<TopicContentSelectorProps> = ({
  activeContent,
  onContentChange,
  counts,
  className
}) => {
  // Create content tabs from the topic content types
  const contentTabs = CONTENT_TYPE_CONFIG.TOPIC.TYPES.map(type => ({
    key: type,
    label: CONTENT_TYPE_CONFIG.TOPIC.LABELS[type],
    count: type === 'live-classes' ? counts.liveClasses : counts[type as keyof Omit<typeof counts, 'liveClasses'>],
  }));

  return (
    <ContentSelector
      activeContent={activeContent}
      onContentChange={onContentChange}
      contentTabs={contentTabs}
      ariaLabel="Select topic content type"
      className={className}
    />
  );
};

export default TopicContentSelector;
