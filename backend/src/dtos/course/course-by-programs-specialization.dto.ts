import { query } from 'express-validator';

export interface GetCoursesByProgramsAndSpecializationDto {
  course_type?: string | undefined;
  program_id?: number | undefined;
  specialization_id?: number | undefined;
  search_query?: string | undefined;
  student_id?: number | undefined;
}

export interface CourseByProgramsAndSpecializationResponse {
  course_id: number;
  course_name: string;
  start_date: string | null;
  end_date: string | null;
  program_name: string | null;
  teacher_name: string | null;
  course_total_hours: string | null;
  profile_picture_url: string | null;
  teacher_qualification: string | null;
  program_id: number | null;
  purchase_status: string;
  is_purchased: boolean;
  is_free: boolean;
}

export const getCoursesByProgramsAndSpecializationValidation = [
  query('course_type')
    .optional()
    .isString()
    .isIn(['FREE', 'PAID', 'PURCHASED'])
    .withMessage('Invalid course type. Must be FREE, PAID, or PURCHASED'),
  query('program_id')
    .optional()
    .isInt({ min: -1 })
    .withMessage('Program ID must be an integer (-1 for all programs)')
    .toInt(),
  query('specialization_id')
    .optional()
    .isInt({ min: -1 })
    .withMessage('Specialization ID must be an integer (-1 for all specializations)')
    .toInt(),
  query('search_query')
    .optional()
    .isString()
    .trim()
    .withMessage('Search query must be a string'),
  query('student_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Student ID must be a positive integer')
    .toInt()
];

/**
 * Validation for profile-based courses by programs and specialization (no student_id required)
 */
export const getCoursesByProgramsAndSpecializationProfileValidation = [
  query('course_type')
    .optional()
    .isString()
    .isIn(['FREE', 'PAID', 'PURCHASED'])
    .withMessage('Invalid course type. Must be FREE, PAID, or PURCHASED'),
  query('program_id')
    .optional()
    .isInt({ min: -1 })
    .withMessage('Program ID must be an integer (-1 for all programs)')
    .toInt(),
  query('specialization_id')
    .optional()
    .isInt({ min: -1 })
    .withMessage('Specialization ID must be an integer (-1 for all specializations)')
    .toInt(),
  query('search_query')
    .optional()
    .isString()
    .trim()
    .withMessage('Search query must be a string')
];
