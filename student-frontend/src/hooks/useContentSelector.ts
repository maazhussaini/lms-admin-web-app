/**
 * @file hooks/useContentSelector.ts
 * @description Hook for managing content selector state and logic
 * Centralizes tab selection logic for module and topic content selectors
 */

import { useState, useCallback, useMemo } from 'react';
import { CONTENT_TYPE_CONFIG } from '@/constants/courseDetails.constants';
import type { 
  ContentType, 
  ContentTab, 
  ModuleContentType, 
  TopicContentType,
  ModuleContentCounts,
  TopicContentCounts 
} from '@/types/courseDetails.ui.types';

/**
 * Hook options for content selector
 */
interface UseContentSelectorOptions<T extends ContentType> {
  initialContent: T;
  contentCounts: T extends ModuleContentType ? ModuleContentCounts : TopicContentCounts;
  onContentChange?: (content: T) => void;
}

/**
 * Hook for managing content selector state
 * 
 * @param options - Configuration options
 * @returns Content selector state and handlers
 */
export function useContentSelector<T extends ContentType>(
  options: UseContentSelectorOptions<T>
) {
  const { initialContent, contentCounts, onContentChange } = options;
  const [activeContent, setActiveContent] = useState<T>(initialContent);

  // Determine if this is module or topic content
  const isModuleContent = useMemo(() => {
    return CONTENT_TYPE_CONFIG.MODULE.TYPES.includes(activeContent as ModuleContentType);
  }, [activeContent]);

  // Get configuration based on content type
  const config = useMemo(() => {
    return isModuleContent ? CONTENT_TYPE_CONFIG.MODULE : CONTENT_TYPE_CONFIG.TOPIC;
  }, [isModuleContent]);

  // Generate content tabs with counts
  const contentTabs = useMemo((): ContentTab<T>[] => {
    if (isModuleContent) {
      const moduleConfig = CONTENT_TYPE_CONFIG.MODULE;
      const moduleCounts = contentCounts as ModuleContentCounts;
      
      return moduleConfig.TYPES.map(type => ({
        key: type as T,
        label: moduleConfig.LABELS[type],
        count: moduleCounts[type] || 0,
        disabled: false,
      }));
    } else {
      const topicConfig = CONTENT_TYPE_CONFIG.TOPIC;
      const topicCounts = contentCounts as TopicContentCounts;
      
      return topicConfig.TYPES.map(type => ({
        key: type as T,
        label: topicConfig.LABELS[type],
        count: type === 'live-classes' ? topicCounts.liveClasses : topicCounts[type as keyof TopicContentCounts] || 0,
        disabled: false,
      }));
    }
  }, [isModuleContent, contentCounts]);

  // Handle content change
  const handleContentChange = useCallback((content: T) => {
    setActiveContent(content);
    onContentChange?.(content);
  }, [onContentChange]);

  // Get current tab info
  const currentTab = useMemo(() => {
    return contentTabs.find(tab => tab.key === activeContent);
  }, [contentTabs, activeContent]);

  // Check if content has items
  const hasContent = useCallback((content: T) => {
    const tab = contentTabs.find(tab => tab.key === content);
    return (tab?.count || 0) > 0;
  }, [contentTabs]);

  // Get first available content type
  const firstAvailableContent = useMemo(() => {
    const availableTab = contentTabs.find(tab => tab.count > 0);
    return availableTab?.key || contentTabs[0]?.key;
  }, [contentTabs]);

  return {
    // State
    activeContent,
    contentTabs,
    currentTab,
    
    // Actions
    setActiveContent: handleContentChange,
    
    // Utilities
    hasContent,
    firstAvailableContent,
    config,
    
    // Computed properties
    get totalItems() {
      return contentTabs.reduce((sum, tab) => sum + tab.count, 0);
    },
    get hasAnyContent() {
      return this.totalItems > 0;
    },
    get availableContentTypes() {
      return contentTabs.filter(tab => tab.count > 0).map(tab => tab.key);
    },
  };
}

/**
 * Specific hook for module content selector
 */
export function useModuleContentSelector(
  initialContent: ModuleContentType = 'topics',
  contentCounts: ModuleContentCounts,
  onContentChange?: (content: ModuleContentType) => void
) {
  return useContentSelector({
    initialContent,
    contentCounts,
    onContentChange,
  });
}

/**
 * Specific hook for topic content selector
 */
export function useTopicContentSelector(
  initialContent: TopicContentType = 'lectures',
  contentCounts: TopicContentCounts,
  onContentChange?: (content: TopicContentType) => void
) {
  return useContentSelector({
    initialContent,
    contentCounts,
    onContentChange,
  });
}
