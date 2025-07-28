/**
 * @file utils/courseDetailsUtils.ts
 * @description Utility functions for course details components
 * Centralizes data parsing, transformation, and common operations
 */

import {
  formatDurationFromSeconds,
} from '@shared/utils';
import { PARSING_PATTERNS, DEFAULT_CONTENT_COUNTS } from '@/constants/courseDetails.constants';
import type { 
  SelectorItem,
  ExtendedCourseModule,
  ExtendedCourseTopic,
  ExtendedCourseVideo,
  ModuleContentCounts,
  TopicContentCounts
} from '@/types/courseDetails.ui.types';
import type { CourseModule, CourseTopic, CourseVideo } from '@/services/courseService';

/**
 * Parse module stats string to extract topic and video counts
 * 
 * @param moduleStats - Stats string like "2 Topics | 2 Video Lectures"
 * @returns Object with topic and video counts
 */
export function parseModuleStats(moduleStats: string): { topicCount: number; videoCount: number } {
  const topicMatch = moduleStats.match(PARSING_PATTERNS.MODULE_STATS.TOPICS);
  const videoMatch = moduleStats.match(PARSING_PATTERNS.MODULE_STATS.VIDEOS);
  
  return {
    topicCount: topicMatch && topicMatch[1] ? parseInt(topicMatch[1], 10) : 0,
    videoCount: videoMatch && videoMatch[1] ? parseInt(videoMatch[1], 10) : 0,
  };
}

/**
 * Parse video count from string
 * 
 * @param videoCountString - String containing video count
 * @returns Parsed video count or 0 if parsing fails
 */
export function parseVideoCount(videoCountString: string): number {
  if (!videoCountString) return 0;
  
  const match = videoCountString.match(PARSING_PATTERNS.VIDEO_COUNT);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Transform course module to extended module with UI data
 * 
 * @param module - Raw course module from API
 * @param index - Display index (0-based)
 * @returns Extended module with UI enhancements
 */
export function transformCourseModule(module: CourseModule, index: number): ExtendedCourseModule {
  const { topicCount, videoCount } = parseModuleStats(module.module_stats || '');
  
  return {
    ...module,
    topicCount,
    videoCount,
    displayNumber: index + 1,
  };
}

/**
 * Transform course topic to extended topic with UI data
 * 
 * @param topic - Raw course topic from API
 * @param index - Display index (0-based)
 * @returns Extended topic with UI enhancements
 */
export function transformCourseTopic(topic: CourseTopic, index: number): ExtendedCourseTopic {
  const videoCount = parseVideoCount(topic.overall_video_lectures || '0');
  
  return {
    ...topic,
    videoCount,
    displayNumber: index + 1,
  };
}

/**
 * Transform course video to extended video with UI data
 * 
 * @param video - Raw course video from API
 * @param index - Display index (0-based)
 * @returns Extended video with UI enhancements
 */
export function transformCourseVideo(video: CourseVideo, index: number): ExtendedCourseVideo {
  return {
    ...video,
    displayNumber: index + 1,
    formattedDuration: video.duration_formatted || '0:00',
  };
}

/**
 * Convert extended module to selector item
 * 
 * @param module - Extended course module
 * @returns Selector item for UI display
 */
export function moduleToSelectorItem(module: ExtendedCourseModule): SelectorItem {
  return {
    id: module.course_module_id,
    name: module.course_module_name,
    count: module.topicCount,
    subtitle: `${module.videoCount} videos`,
  };
}

/**
 * Convert extended topic to selector item
 * 
 * @param topic - Extended course topic
 * @returns Selector item for UI display
 */
export function topicToSelectorItem(topic: ExtendedCourseTopic): SelectorItem {
  return {
    id: topic.course_topic_id,
    name: topic.course_topic_name,
    count: topic.videoCount,
    subtitle: topic.videoCount === 1 ? '1 video' : `${topic.videoCount} videos`,
  };
}

/**
 * Calculate module content counts
 * 
 * @param topics - Array of topics in the module
 * @returns Content counts for module
 */
export function calculateModuleContentCounts(topics: CourseTopic[]): ModuleContentCounts {
  return {
    topics: topics.length,
    assignments: DEFAULT_CONTENT_COUNTS.ASSIGNMENTS, // TODO: Calculate from API when available
    quizzes: DEFAULT_CONTENT_COUNTS.QUIZZES, // TODO: Calculate from API when available
  };
}

/**
 * Calculate topic content counts
 * 
 * @param videos - Array of videos in the topic
 * @returns Content counts for topic
 */
export function calculateTopicContentCounts(videos: CourseVideo[]): TopicContentCounts {
  return {
    lectures: videos.length,
    liveClasses: DEFAULT_CONTENT_COUNTS.LIVE_CLASSES, // TODO: Calculate from API when available
    assignments: DEFAULT_CONTENT_COUNTS.ASSIGNMENTS, // TODO: Calculate from API when available
    quizzes: DEFAULT_CONTENT_COUNTS.QUIZZES, // TODO: Calculate from API when available
    materials: DEFAULT_CONTENT_COUNTS.MATERIALS, // TODO: Calculate from API when available
  };
}

/**
 * Create fallback object for missing course module
 * 
 * @param moduleId - Module ID
 * @returns Fallback module object
 */
export function createFallbackModule(moduleId: number): CourseModule {
  return {
    course_module_id: moduleId,
    course_module_name: `Module ${moduleId}`,
    module_stats: '0 Topics | 0 Video Lectures',
  };
}

/**
 * Create fallback object for missing course topic
 * 
 * @param topicId - Topic ID
 * @returns Fallback topic object
 */
export function createFallbackTopic(topicId: number): CourseTopic {
  return {
    course_topic_id: topicId,
    course_topic_name: `Topic ${topicId}`,
    overall_video_lectures: '0',
    position: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Check if a selector item is currently active
 * 
 * @param item - Selector item
 * @param currentId - Currently active ID
 * @returns Whether the item is active
 */
export function isSelectorItemActive(item: SelectorItem, currentId: number): boolean {
  return item.id === currentId;
}

/**
 * Find current index in selector items array
 * 
 * @param items - Array of selector items
 * @param currentId - Currently active ID
 * @returns Index of current item, or -1 if not found
 */
export function findCurrentSelectorIndex(items: SelectorItem[], currentId: number): number {
  return items.findIndex(item => item.id === currentId);
}

/**
 * Format duration string for display
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "5:30", "1:05:30")
 * 
 * @deprecated Use formatDurationFromSeconds from @shared/utils instead
 */
export function formatDuration(seconds: number): string {
  return formatDurationFromSeconds(seconds, 'timestamp');
}

/**
 * Validate course navigation parameters
 * 
 * @param courseId - Course ID
 * @param moduleId - Module ID (optional)
 * @param topicId - Topic ID (optional)
 * @param videoId - Video ID (optional)
 * @returns Validation result with parsed IDs
 */
export function validateCourseParams(
  courseId?: string,
  moduleId?: string,
  topicId?: string,
  videoId?: string
): {
  isValid: boolean;
  courseIdNum: number;
  moduleIdNum?: number;
  topicIdNum?: number;
  videoIdNum?: number;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!courseId) {
    errors.push('Course ID is required');
    return { isValid: false, courseIdNum: 0, errors };
  }
  
  const courseIdNum = parseInt(courseId, 10);
  if (isNaN(courseIdNum) || courseIdNum <= 0) {
    errors.push('Invalid course ID');
    return { isValid: false, courseIdNum: 0, errors };
  }
  
  let moduleIdNum: number | undefined;
  let topicIdNum: number | undefined;
  let videoIdNum: number | undefined;
  
  if (moduleId) {
    moduleIdNum = parseInt(moduleId, 10);
    if (isNaN(moduleIdNum) || moduleIdNum <= 0) {
      errors.push('Invalid module ID');
    }
  }
  
  if (topicId) {
    if (!moduleId) {
      errors.push('Module ID is required when topic ID is provided');
    } else {
      topicIdNum = parseInt(topicId, 10);
      if (isNaN(topicIdNum) || topicIdNum <= 0) {
        errors.push('Invalid topic ID');
      }
    }
  }
  
  if (videoId) {
    if (!topicId) {
      errors.push('Topic ID is required when video ID is provided');
    } else {
      videoIdNum = parseInt(videoId, 10);
      if (isNaN(videoIdNum) || videoIdNum <= 0) {
        errors.push('Invalid video ID');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    courseIdNum,
    moduleIdNum,
    topicIdNum,
    videoIdNum,
    errors,
  };
}

/**
 * Truncate text to specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 300)
 * @returns Object with truncated text and truncation status
 */
export function truncateText(text: string, maxLength: number = 300): { 
  truncated: string; 
  isTruncated: boolean; 
} {
  if (text.length <= maxLength) {
    return { truncated: text, isTruncated: false };
  }
  return { 
    truncated: text.substring(0, maxLength) + '...', 
    isTruncated: true 
  };
}
