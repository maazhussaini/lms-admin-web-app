import { query, ValidationChain } from 'express-validator';

/**
 * DTO interface for getting enrolled courses by student ID
 */
export interface GetEnrolledCoursesByStudentDto {
  student_id: number;
  search_query?: string;
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
  start_date: Date | null;
  end_date: Date | null;
  specialization_name: string | null;
  program_name: string | null;
  teacher_name: string;
  course_total_hours: number | null;
  overall_progress_percentage: number;
}

/**
 * Express validator rules for getting enrolled courses by student
 */
export const getEnrolledCoursesByStudentValidation: ValidationChain[] = [
  query('student_id')
    .notEmpty()
    .withMessage('Student ID is required')
    .isInt({ min: 1 })
    .withMessage('Student ID must be a positive integer')
    .toInt(),
  
  query('search_query')
    .optional()
    .isString()
    .withMessage('Search query must be a string')
    .isLength({ max: 255 })
    .withMessage('Search query must not exceed 255 characters')
    .trim()
];
