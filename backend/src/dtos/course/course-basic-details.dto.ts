import { query, ValidationChain } from 'express-validator';

/**
 * DTO interface for getting course basic details
 */
export interface GetCourseBasicDetailsDto {
  student_id?: number;
  course_id: number;
}

/**
 * Interface for course basic details response
 */
export interface CourseBasicDetailsResponse {
  course_id: number;
  course_name: string;
  course_description: string | null;
  overall_progress_percentage: number | null;
  teacher_name: string | null;
  profile_picture_url: string | null;
  start_date: string | null;
  end_date: string | null;
  purchase_status: string;
  program_name: string | null;
  specialization_name: string | null;
  is_purchased: boolean;
  is_free: boolean;
}

/**
 * Express validator rules for getting course basic details
 */
export const getCourseBasicDetailsValidation: ValidationChain[] = [
  query('student_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Student ID must be a positive integer')
    .toInt()
];

/**
 * Express validator rules for getting course basic details (profile-based, no student_id required)
 */
export const getCourseBasicDetailsProfileValidation: ValidationChain[] = [
  // No additional validation needed - courseId is validated as path parameter in route
  // student_id comes from authenticated user token
];
