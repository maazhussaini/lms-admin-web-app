import { param } from 'express-validator';

/**
 * DTO for getting video details by ID request
 */
export interface GetVideoDetailsByIdDto {
  course_video_id: number;
}

/**
 * Response DTO for video details by ID
 */
export interface VideoDetailsByIdResponse {
  course_video_id: number;
  video_name: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: number;
  duration_formatted: string | null;
  position: number;
  bunny_video_id: string | null;
  course_topic_id: number;
  course_id: number;
  teacher_name: string | null;
  teacher_qualification: string | null;
  profile_picture_url: string | null;
  next_course_video_id: number | null;
  next_video_name: string | null;
  next_video_duration: number | null;
  next_video_duration_formatted: string | null;
  previous_course_video_id: number | null;
  previous_video_name: string | null;
  previous_video_duration: number | null;
  previous_video_duration_formatted: string | null;
}

/**
 * Validation rules for getting video details by ID
 */
export const getVideoDetailsByIdValidation = [
  param('videoId')
    .isInt({ min: 1 })
    .withMessage('Video ID must be a positive integer')
    .toInt()
];
