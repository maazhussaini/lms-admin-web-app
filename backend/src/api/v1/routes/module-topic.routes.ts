import { Router } from 'express';
import { CourseController } from '@/controllers/course.controller';
import { validate } from '@/middleware/validation.middleware';
import { getCourseTopicsByModuleValidation } from '@/dtos/course/course-topics-by-module.dto';
import { getAllCourseVideosByTopicValidation } from '@/dtos/course/course-videos-by-topic.dto';
import { getVideoDetailsByIdValidation } from '@/dtos/course/video-details-by-id.dto';
import { param } from 'express-validator';

const router = Router();

/**
 * @route GET /api/v1/modules/:moduleId/topics
 * @description Get topics list for a specific module with video lecture statistics
 * @access Public (authentication optional for enhanced features)
 */
router.get(
  '/modules/:moduleId/topics',
  validate([
    param('moduleId')
      .isInt({ min: 1 })
      .withMessage('Module ID must be a positive integer')
      .toInt(),
    ...getCourseTopicsByModuleValidation
  ]),
  CourseController.getCourseTopicsByModuleIdHandler
);

/**
 * @route GET /api/v1/topics/:topicId/videos
 * @description Get all videos for a specific topic with progress tracking and locking logic
 * @access Public (authentication optional for progress tracking)
 */
router.get(
  '/topics/:topicId/videos',
  validate([
    param('topicId')
      .isInt({ min: 1 })
      .withMessage('Topic ID must be a positive integer')
      .toInt(),
    ...getAllCourseVideosByTopicValidation
  ]),
  CourseController.getAllCourseVideosByTopicIdHandler
);

/**
 * @route GET /api/v1/videos/:videoId/details
 * @description Get comprehensive video details by ID including teacher info and navigation
 * @access Public (authentication optional for enhanced features)
 */
router.get(
  '/videos/:videoId/details',
  validate([
    param('videoId')
      .isInt({ min: 1 })
      .withMessage('Video ID must be a positive integer')
      .toInt(),
    ...getVideoDetailsByIdValidation
  ]),
  CourseController.getVideoDetailsByIdHandler
);

export default router;
