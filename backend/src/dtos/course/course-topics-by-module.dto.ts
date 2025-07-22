import { param } from 'express-validator';

/**
 * DTO for getting course topics by module ID request
 */
export interface GetCourseTopicsByModuleDto {
  module_id: number;
}

/**
 * Response DTO for course topics by module ID
 */
export interface CourseTopicsByModuleResponse {
  course_topic_id: number;
  course_topic_name: string;
  overall_video_lectures: string;
  position: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Validation rules for getting course topics by module ID
 */
export const getCourseTopicsByModuleValidation = [
  param('moduleId')
    .isInt({ min: 1 })
    .withMessage('Module ID must be a positive integer')
    .toInt()
];
