/**
 * @file services/studentService.ts
 * @description Service layer for student-related API operations following established patterns
 */

import { apiClient } from '@/api';
import { StudentProfileResponse } from '@/types/student-profile.types';

/**
 * Student service class for handling student-related API operations
 */
export class StudentService {
  /**
   * Get current student's profile
   * 
   * @returns Promise<StudentProfileResponse> Student profile data
   * @throws ApiError on request failure
   */
  static async getCurrentStudentProfile(): Promise<StudentProfileResponse> {
    return await apiClient.get<StudentProfileResponse>('/student/profile');
  }

  /**
   * Update current student's profile
   * 
   * @param profileData Partial student profile data to update
   * @returns Promise<StudentProfileResponse> Updated student profile
   * @throws ApiError on request failure
   */
  static async updateCurrentStudentProfile(
    profileData: Partial<Pick<StudentProfileResponse, 
      'first_name' | 'last_name' | 'full_name' | 'profile_picture_url' | 'gender' | 'age'
    >>
  ): Promise<StudentProfileResponse> {
    return await apiClient.put<StudentProfileResponse>('/student/profile', profileData);
  }
}

// Export default instance for convenience
export const studentService = StudentService;

// Named export for consistency with other services
export default StudentService;
