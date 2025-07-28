import React from 'react';
import ContentSelector from '@/components/common/ContentSelector';
import { CONTENT_TYPE_CONFIG } from '@/constants/courseDetails.constants';
import type { ModuleContentType } from '@/types/courseDetails.ui.types';

export interface ModuleContentSelectorProps {
  /** Currently active content type */
  activeContent: ModuleContentType;
  /** Handler for content type change */
  onContentChange: (contentType: ModuleContentType) => void;
  /** Content counts for each section */
  counts: {
    topics: number;
    assignments: number;
    quizzes: number;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * ModuleContentSelector - Selector component for switching between module content types
 * 
 * Displays tabs for Topics, Assignments, and Quizzes within a module.
 * Features smooth animations and follows the LMS design system.
 * Shows content counts for each section.
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const ModuleContentSelector: React.FC<ModuleContentSelectorProps> = ({
  activeContent,
  onContentChange,
  counts,
  className
}) => {
  // Create content tabs from the module content types
  const contentTabs = CONTENT_TYPE_CONFIG.MODULE.TYPES.map(type => ({
    key: type,
    label: CONTENT_TYPE_CONFIG.MODULE.LABELS[type],
    count: counts[type],
  }));

  return (
    <ContentSelector
      activeContent={activeContent}
      onContentChange={onContentChange}
      contentTabs={contentTabs}
      ariaLabel="Select module content type"
      className={className}
    />
  );
};

export default ModuleContentSelector;
