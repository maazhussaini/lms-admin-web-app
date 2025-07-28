/**
 * @file types/student-profile.types.ts
 * @description Frontend-specific types for student profile API responses
 */

import { Student, StudentEmailAddress } from '@shared/types/student.types';

/**
 * Student profile response from GET /api/v1/student/profile
 * Based on the backend formatEntityResponse method
 */
export interface StudentProfileResponse extends Omit<Student, 'password_hash'> {
  primary_email: string | null;
  emails?: Pick<StudentEmailAddress, 'email_address'>[];
}

/**
 * Simplified student profile for UI display
 */
export interface StudentDisplayProfile {
  student_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  primary_email: string | null;
  profile_picture_url: string | null;
  username: string;
  student_status: string;
  gender?: string | null;
  age?: number | null;
}
