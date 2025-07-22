import { query, ValidationChain } from 'express-validator';

/**
 * DTO interface for getting enrolled courses by student ID
 */
export interface GetEnrolledCoursesByStudentDto {
  search_query?: string;
  enrollment_status?: string;
  include_progress?: boolean;
}

/**
 * Interface for enrolled course response
 */
export interface EnrolledCourseResponse {
  enrollment_id: number;
  specialization_program_id: number;
  course_id: number;
  specialization_id: number | null;
  program_id: number | null;
  course_name: string;
  start_date: string | null;
  end_date: string | null;
  specialization_name: string | null;
  program_name: string | null;
  teacher_name: string;
  course_total_hours: string | null;
  overall_progress_percentage: number;
}

/**
 * Express validator rules for getting enrolled courses by student
 */
export const getEnrolledCoursesByStudentValidation: ValidationChain[] = [
  query('search_query')
    .optional()
    .isString()
    .withMessage('Search query must be a string')
    .isLength({ max: 255 })
    .withMessage('Search query must not exceed 255 characters')
    .trim(),
    
  query('enrollment_status')
    .optional()
    .isString()
    .withMessage('Enrollment status must be a string')
    .isIn(['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid enrollment status. Must be ACTIVE, INACTIVE, COMPLETED, or CANCELLED'),
    
  query('include_progress')
    .optional()
    .isBoolean()
    .withMessage('Include progress must be a boolean')
    .toBoolean()
];
