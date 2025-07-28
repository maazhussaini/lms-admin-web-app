/**
 * @file services/courseService.ts
 * @description Service layer for course-related API operations
 */

import { apiClient } from '@/api';
import { TListResponse } from '@shared/types/api.types';

// API Response Types based on the provided API responses
export interface CourseDiscoveryItem {
  course_id: number;
  course_name: string;
  start_date: string;
  end_date: string;
  program_name: string;
  teacher_name: string;
  course_total_hours: string;
  profile_picture_url: string | null;
  teacher_qualification: string | null;
  program_id: number;
  purchase_status: string;
  is_purchased: boolean;
  is_free: boolean;
}

export interface CourseBasicDetails {
  course_id: number;
  course_name: string;
  course_description: string;
  overall_progress_percentage: number;
  teacher_name: string;
  profile_picture_url: string | null;
  teacher_qualification: string | null;
  start_date: string;
  end_date: string;
  course_total_hours: string;
  purchase_status: string;
  program_name: string;
  specialization_name: string;
  is_purchased: boolean;
  is_free: boolean;
}

export interface CourseModule {
  course_module_id: number;
  course_module_name: string;
  module_stats: string;
}

export interface CourseTopic {
  course_topic_id: number;
  course_topic_name: string;
  overall_video_lectures: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseVideo {
  course_video_id: number;
  position: number;
  video_name: string;
  duration_seconds: number;
  duration_formatted: string;
  is_completed: boolean | null;
  completion_percentage: number | null;
  last_watched_at: string | null;
  completion_status: string;
  is_video_locked: boolean;
}

export interface VideoDetails {
  course_video_id: number;
  video_name: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: number;
  duration_formatted: string;
  position: number;
  bunny_video_id: string;
  course_topic_id: number;
  course_id: number;
  teacher_name: string;
  teacher_qualification: string | null;
  profile_picture_url: string | null;
  next_course_video_id: number | null;
  next_video_name: string | null;
  next_video_duration: number | null;
  next_video_duration_formatted: string | null;
  previous_course_video_id: number | null;
  previous_video_name: string | null;
  previous_video_duration: number | null;
  previous_video_duration_formatted: string | null;
}

// Request parameter types
export interface CourseDiscoveryParams {
  course_type?: 'FREE' | 'PAID' | 'PURCHASED';
  program_id?: number;
  specialization_id?: number;
  search_query?: string;
  page?: number;
  limit?: number;
}

export interface CourseModulesParams {
  page?: number;
  limit?: number;
}

export interface ModuleTopicsParams {
  page?: number;
  limit?: number;
}

export interface TopicVideosParams {
  page?: number;
  limit?: number;
}

/**
 * Course Service Class
 */
export class CourseService {
  /**
   * Discover courses with filtering options
   */
  async discoverCourses(params: CourseDiscoveryParams = {}): Promise<TListResponse<CourseDiscoveryItem>> {
    const searchParams = new URLSearchParams();
    
    if (params.course_type) searchParams.append('course_type', params.course_type);
    if (params.program_id) searchParams.append('program_id', params.program_id.toString());
    if (params.specialization_id) searchParams.append('specialization_id', params.specialization_id.toString());
    if (params.search_query) searchParams.append('search_query', params.search_query);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/student/profile/courses/discover${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get<TListResponse<CourseDiscoveryItem>>(endpoint);
  }

  /**
   * Get course basic details
   */
  async getCourseBasicDetails(courseId: number): Promise<CourseBasicDetails> {
    return await apiClient.get<CourseBasicDetails>(`/student/profile/courses/${courseId}/basic-details`);
  }

  /**
   * Get course modules
   */
  async getCourseModules(courseId: number, params: CourseModulesParams = {}): Promise<TListResponse<CourseModule>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/courses/${courseId}/modules${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get<TListResponse<CourseModule>>(endpoint);
  }

  /**
   * Get module topics
   */
  async getModuleTopics(moduleId: number, params: ModuleTopicsParams = {}): Promise<TListResponse<CourseTopic>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/modules/${moduleId}/topics${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get<TListResponse<CourseTopic>>(endpoint);
  }

  /**
   * Get topic videos
   */
  async getTopicVideos(topicId: number, params: TopicVideosParams = {}): Promise<TListResponse<CourseVideo>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/topics/${topicId}/videos${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get<TListResponse<CourseVideo>>(endpoint);
  }

  /**
   * Get video details
   */
  async getVideoDetails(videoId: number): Promise<VideoDetails> {
    return await apiClient.get<VideoDetails>(`/videos/${videoId}/details`);
  }
}

// Export singleton instance
export const courseService = new CourseService();
export default courseService;
