/**
 * @file types/courseDetails.ui.types.ts
 * @description Shared types for CourseDetails components
 * Eliminates type duplication and ensures consistency across components
 */

import { CourseModule, CourseTopic, CourseVideo } from '@/services/courseService';

/**
 * Generic selector item interface for modules, topics, etc.
 */
export interface SelectorItem {
  id: number;
  name: string;
  count?: number;
  subtitle?: string;
  isActive?: boolean;
}

/**
 * Drag-to-scroll state interface
 */
export interface DragScrollState {
  isDragging: boolean;
  dragStarted: boolean;
  startX: number;
  scrollLeft: number;
}

/**
 * Content selector tab configuration
 */
export interface ContentTab<T extends string = string> {
  key: T;
  label: string;
  count: number;
  disabled?: boolean;
}

/**
 * Module content types
 */
export type ModuleContentType = 'topics' | 'assignments' | 'quizzes';

/**
 * Topic content types
 */
export type TopicContentType = 'lectures' | 'live-classes' | 'assignments' | 'quizzes' | 'materials';

/**
 * All possible content types union
 */
export type ContentType = ModuleContentType | TopicContentType;

/**
 * Module content counts interface
 */
export interface ModuleContentCounts {
  topics: number;
  assignments: number;
  quizzes: number;
}

/**
 * Topic content counts interface
 */
export interface TopicContentCounts {
  lectures: number;
  liveClasses: number;
  assignments: number;
  quizzes: number;
  materials: number;
}

/**
 * Generic content counts interface
 */
export type ContentCounts<T extends ContentType> = T extends ModuleContentType 
  ? ModuleContentCounts 
  : T extends TopicContentType 
  ? TopicContentCounts 
  : Record<string, number>;

/**
 * Navigation context for course details
 */
export interface CourseNavigationContext {
  courseId: string;
  moduleId?: number;
  topicId?: number;
  videoId?: number;
}

/**
 * Course details navigation utilities
 */
export interface CourseNavigationUrls {
  course: string;
  module: (moduleId: number) => string;
  topic: (moduleId: number, topicId: number) => string;
  video: (moduleId: number, topicId: number, videoId: number) => string;
}

/**
 * Error context for course details components
 */
export interface CourseDetailsError {
  component: string;
  operation: string;
  error: unknown;
  retry?: () => void;
}

/**
 * Loading context for course details components
 */
export interface CourseDetailsLoading {
  component: string;
  operation: string;
  isLoading: boolean;
}

/**
 * Enhanced course module with UI data
 */
export interface ExtendedCourseModule extends CourseModule {
  topicCount: number;
  videoCount: number;
  displayNumber: number;
}

/**
 * Enhanced course topic with UI data
 */
export interface ExtendedCourseTopic extends CourseTopic {
  videoCount: number;
  displayNumber: number;
}

/**
 * Enhanced course video with UI data
 */
export interface ExtendedCourseVideo extends CourseVideo {
  displayNumber: number;
  formattedDuration: string;
}

/**
 * Course details component state
 */
export interface CourseDetailsState {
  activeModuleContent: ModuleContentType;
  activeTopicContent: TopicContentType;
  selectedModuleId?: number;
  selectedTopicId?: number;
  selectedVideoId?: number;
}

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

/**
 * Course details breadcrumb context
 */
export interface CourseDetailsBreadcrumbs {
  items: BreadcrumbItem[];
  currentLevel: 'course' | 'module' | 'topic' | 'video';
}
