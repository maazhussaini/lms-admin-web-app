/**
 * @file hooks/useCourseNavigation.ts
 * @description Navigation utilities for course details components
 * Centralizes URL construction and navigation logic
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { COURSE_ROUTES } from '@/constants/courseDetails.constants';
import type { 
  CourseNavigationContext, 
  CourseNavigationUrls,
  BreadcrumbItem,
  CourseDetailsBreadcrumbs 
} from '@/types/courseDetails.ui.types';

/**
 * Hook for course navigation utilities
 * 
 * @returns Navigation context and utility functions
 */
export function useCourseNavigation() {
  const navigate = useNavigate();
  const params = useParams<{ 
    courseId: string; 
    moduleId?: string; 
    topicId?: string; 
    videoId?: string; 
  }>();

  // Parse current navigation context
  const navigationContext = useMemo((): CourseNavigationContext => ({
    courseId: params.courseId || '',
    moduleId: params.moduleId ? parseInt(params.moduleId, 10) : undefined,
    topicId: params.topicId ? parseInt(params.topicId, 10) : undefined,
    videoId: params.videoId ? parseInt(params.videoId, 10) : undefined,
  }), [params]);

  // URL builders for course navigation
  const urls = useMemo((): CourseNavigationUrls => {
    const courseId = navigationContext.courseId;
    
    return {
      course: COURSE_ROUTES.BUILDERS.course(courseId),
      module: (moduleId: number) => COURSE_ROUTES.BUILDERS.module(courseId, moduleId),
      topic: (moduleId: number, topicId: number) => 
        COURSE_ROUTES.BUILDERS.topic(courseId, moduleId, topicId),
      video: (moduleId: number, topicId: number, videoId: number) => 
        COURSE_ROUTES.BUILDERS.video(courseId, moduleId, topicId, videoId),
    };
  }, [navigationContext.courseId]);

  // Navigation functions
  const navigateToCourse = useCallback(() => {
    navigate(urls.course);
  }, [navigate, urls.course]);

  const navigateToModule = useCallback((moduleId: number) => {
    navigate(urls.module(moduleId));
  }, [navigate, urls]);

  const navigateToTopic = useCallback((moduleId: number, topicId: number) => {
    navigate(urls.topic(moduleId, topicId));
  }, [navigate, urls]);

  const navigateToVideo = useCallback((moduleId: number, topicId: number, videoId: number) => {
    navigate(urls.video(moduleId, topicId, videoId));
  }, [navigate, urls]);

  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const navigateToCoursesHome = useCallback(() => {
    navigate('/courses');
  }, [navigate]);

  // Breadcrumb generation
  const generateBreadcrumbs = useCallback((
    courseName?: string,
    moduleName?: string,
    topicName?: string,
    videoName?: string
  ): CourseDetailsBreadcrumbs => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Courses',
        href: '/courses',
      },
    ];

    if (courseName) {
      items.push({
        label: courseName,
        href: navigationContext.moduleId ? urls.course : undefined,
        isActive: !navigationContext.moduleId,
      });
    }

    if (moduleName && navigationContext.moduleId) {
      items.push({
        label: moduleName,
        href: navigationContext.topicId ? urls.module(navigationContext.moduleId) : undefined,
        isActive: !navigationContext.topicId,
      });
    }

    if (topicName && navigationContext.moduleId && navigationContext.topicId) {
      items.push({
        label: topicName,
        href: navigationContext.videoId ? 
          urls.topic(navigationContext.moduleId, navigationContext.topicId) : undefined,
        isActive: !navigationContext.videoId,
      });
    }

    if (videoName && navigationContext.videoId) {
      items.push({
        label: videoName,
        isActive: true,
      });
    }

    // Determine current level
    let currentLevel: CourseDetailsBreadcrumbs['currentLevel'] = 'course';
    if (navigationContext.videoId) currentLevel = 'video';
    else if (navigationContext.topicId) currentLevel = 'topic';
    else if (navigationContext.moduleId) currentLevel = 'module';

    return {
      items,
      currentLevel,
    };
  }, [navigationContext, urls]);

  return {
    // Current context
    context: navigationContext,
    urls,
    
    // Navigation functions
    navigateToCourse,
    navigateToModule,
    navigateToTopic,
    navigateToVideo,
    navigateBack,
    navigateToCoursesHome,
    
    // Utility functions
    generateBreadcrumbs,
    
    // Helper getters
    get isAtCourseLevel() {
      return !navigationContext.moduleId;
    },
    get isAtModuleLevel() {
      return navigationContext.moduleId && !navigationContext.topicId;
    },
    get isAtTopicLevel() {
      return navigationContext.topicId && !navigationContext.videoId;
    },
    get isAtVideoLevel() {
      return !!navigationContext.videoId;
    },
  };
}
