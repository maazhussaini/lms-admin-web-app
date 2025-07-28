/**
 * @file services/enrollmentService.ts
 * @description Service layer for student enrollment-related API operations
 */

import { apiClient } from '@/api';
import { TListResponse } from '@shared/types/api.types';

// API Response Types based on the provided API responses
export interface EnrollmentItem {
  enrollment_id: number;
  specialization_program_id: number;
  course_id: number;
  specialization_id: number;
  program_id: number;
  course_name: string;
  start_date: string;
  end_date: string;
  specialization_name: string;
  program_name: string;
  teacher_name: string;
  profile_picture_url: string | null;
  teacher_qualification: string | null;
  course_total_hours: string;
  overall_progress_percentage: number;
}

// Request parameter types
export interface EnrollmentParams {
  search_query?: string;
  enrollment_status?: string;
  include_progress?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Enrollment Service Class
 */
export class EnrollmentService {
  /**
   * Get student's enrolled courses
   */
  async getEnrolledCourses(params: EnrollmentParams = {}): Promise<TListResponse<EnrollmentItem>> {
    const searchParams = new URLSearchParams();
    
    if (params.search_query) searchParams.append('search_query', params.search_query);
    if (params.enrollment_status) searchParams.append('enrollment_status', params.enrollment_status);
    if (params.include_progress !== undefined) searchParams.append('include_progress', params.include_progress.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/student/profile/enrollments${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get<TListResponse<EnrollmentItem>>(endpoint);
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();
export default enrollmentService;
