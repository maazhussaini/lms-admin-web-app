/**
 * @file store/queryClient.ts
 * @description React Query client configuration for the LMS Student Frontend
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/auth.types';

/**
 * Default query configuration
 */
const defaultQueryConfig = {
  queries: {
    // Global default settings for all queries
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    // Global default settings for all mutations
    retry: (failureCount: number, error: unknown) => {
      // Don't retry mutations on client errors
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
};

/**
 * Create and configure React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryConfig,
});

/**
 * Query keys factory for consistent cache keys
 */
export const queryKeys = {
  // Authentication
  auth: {
    status: ['auth', 'status'] as const,
    profile: ['auth', 'profile'] as const,
  },
  
  // Courses
  courses: {
    all: ['courses'] as const,
    enrolled: ['courses', 'enrolled'] as const,
    detail: (id: string) => ['courses', 'detail', id] as const,
    progress: (id: string) => ['courses', 'progress', id] as const,
  },
  
  // Lectures
  lectures: {
    all: ['lectures'] as const,
    byCourse: (courseId: string) => ['lectures', 'course', courseId] as const,
    detail: (courseId: string, lectureId: string) => ['lectures', 'detail', courseId, lectureId] as const,
    progress: (lectureId: string) => ['lectures', 'progress', lectureId] as const,
  },
  
  // Assignments
  assignments: {
    all: ['assignments'] as const,
    byCourse: (courseId: string) => ['assignments', 'course', courseId] as const,
    detail: (id: string) => ['assignments', 'detail', id] as const,
    submissions: (id: string) => ['assignments', 'submissions', id] as const,
  },
  
  // Quizzes
  quizzes: {
    all: ['quizzes'] as const,
    byCourse: (courseId: string) => ['quizzes', 'course', courseId] as const,
    detail: (id: string) => ['quizzes', 'detail', id] as const,
    attempts: (id: string) => ['quizzes', 'attempts', id] as const,
  },
  
  // Grades
  grades: {
    all: ['grades'] as const,
    byCourse: (courseId: string) => ['grades', 'course', courseId] as const,
    summary: ['grades', 'summary'] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
    detail: (id: string) => ['notifications', 'detail', id] as const,
  },
} as const;

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Invalidate all course-related queries
   */
  invalidateCourses: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
  },
  
  /**
   * Invalidate specific course and its related data
   */
  invalidateCourse: (courseId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.lectures.byCourse(courseId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.assignments.byCourse(courseId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.byCourse(courseId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.grades.byCourse(courseId) });
  },
  
  /**
   * Clear all authentication-related cache
   */
  clearAuthCache: () => {
    queryClient.removeQueries({ queryKey: queryKeys.auth.status });
    queryClient.removeQueries({ queryKey: queryKeys.auth.profile });
  },
  
  /**
   * Prefetch course details
   */
  prefetchCourse: (courseId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.courses.detail(courseId),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },
  
  /**
   * Update notification count in cache
   */
  updateNotificationCount: (count: number) => {
    queryClient.setQueryData(queryKeys.notifications.unread, count);
  },
  
  /**
   * Mark notification as read in cache
   */
  markNotificationAsRead: (notificationId: string) => {
    queryClient.setQueryData(
      queryKeys.notifications.all, 
      (oldData: any) => {
        if (oldData?.items) {
          return {
            ...oldData,
            items: oldData.items.map((notification: any) =>
              notification.id === notificationId 
                ? { ...notification, is_read: true }
                : notification
            )
          };
        }
        return oldData;
      }
    );
  },
};
