import { query, param } from 'express-validator';

/**
 * DTO for getting all course videos by topic ID request
 */
export interface GetAllCourseVideosByTopicDto {
  course_topic_id: number;
  student_id?: number;
}

/**
 * Response DTO for course videos by topic ID
 */
export interface CourseVideosByTopicResponse {
  course_video_id: number;
  position: number;
  video_name: string;
  duration_seconds: number;
  is_completed: boolean | null;
  completion_percentage: number | null;
  last_watched_at: Date | null;
  completion_status: string;
  is_video_locked: boolean;
}

/**
 * Validation rules for getting course videos by topic ID
 */
export const getAllCourseVideosByTopicValidation = [
  param('topicId')
    .isInt({ min: 1 })
    .withMessage('Topic ID must be a positive integer')
    .toInt(),
  query('student_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Student ID must be a positive integer')
    .toInt()
];
