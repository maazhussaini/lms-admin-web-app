import { query, ValidationChain } from 'express-validator';

/**
 * DTO interface for getting enrolled courses by student ID
 */
export interface GetEnrolledCoursesByStudentDto {
  search_query?: string;
  enrollment_status?: string; // Can be a single status or comma-separated values like "ACTIVE,COMPLETED"
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
    .custom((value) => {
      if (!value) return true; // Optional field
      
      // Split by comma and validate each status
      const statuses = value.split(',').map((s: string) => s.trim().toUpperCase());
      // Note: INACTIVE and CANCELLED are supported by the frontend but mapped to DROPPED in the backend
      const validStatuses = ['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING', 'DROPPED', 'SUSPENDED', 'EXPELLED', 'TRANSFERRED', 'DEFERRED'];
      
      for (const status of statuses) {
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid enrollment status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
      }
      
      return true;
    })
    .withMessage('Invalid enrollment status. Must be comma-separated values from: ACTIVE, INACTIVE, COMPLETED, CANCELLED, PENDING, DROPPED, SUSPENDED, EXPELLED, TRANSFERRED, DEFERRED'),
    
  query('include_progress')
    .optional()
    .isBoolean()
    .withMessage('Include progress must be a boolean')
    .toBoolean()
];
