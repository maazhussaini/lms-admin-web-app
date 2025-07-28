/**
 * @file hooks/useCourse.ts
 * @description Custom hooks for course-related API operations
 */

import { useState, useEffect, useCallback } from 'react';
import { courseService, CourseBasicDetails, CourseModule, CourseTopic, CourseVideo, VideoDetails } from '@/services/courseService';
import { TListResponse } from '@shared/types/api.types';
import { ApiError } from '@/types/auth.types';

/**
 * Base state for API operations
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Hook for fetching course basic details
 * 
 * @param courseId - The course ID to fetch details for
 * @returns Object with data, loading state, error, and refetch function
 */
export function useCourseBasicDetails(courseId: number) {
  const [state, setState] = useState<ApiState<CourseBasicDetails>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!courseId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await courseService.getCourseBasicDetails(courseId);
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else {
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));
      }
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}

/**
 * Hook for fetching course modules
 * 
 * @param courseId - The course ID to fetch modules for
 * @returns Object with data, loading state, error, and refetch function
 */
export function useCourseModules(courseId: number) {
  const [state, setState] = useState<ApiState<TListResponse<CourseModule>>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!courseId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await courseService.getCourseModules(courseId);
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else {
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));
      }
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}

/**
 * Hook for fetching module topics
 * 
 * @param moduleId - The module ID to fetch topics for
 * @returns Object with data, loading state, error, and refetch function
 */
export function useModuleTopics(moduleId: number) {
  const [state, setState] = useState<ApiState<TListResponse<CourseTopic>>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!moduleId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await courseService.getModuleTopics(moduleId);
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else {
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));
      }
    }
  }, [moduleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}

/**
 * Hook for fetching topic videos
 * 
 * @param topicId - The topic ID to fetch videos for
 * @returns Object with data, loading state, error, and refetch function
 */
export function useTopicVideos(topicId: number) {
  const [state, setState] = useState<ApiState<TListResponse<CourseVideo>>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!topicId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await courseService.getTopicVideos(topicId);
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else {
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));
      }
    }
  }, [topicId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}

/**
 * Hook for fetching video details
 * 
 * @param videoId - The video ID to fetch details for
 * @returns Object with data, loading state, error, and refetch function
 */
export function useVideoDetails(videoId: number) {
  const [state, setState] = useState<ApiState<VideoDetails>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!videoId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await courseService.getVideoDetails(videoId);
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else {
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));
      }
    }
  }, [videoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}
