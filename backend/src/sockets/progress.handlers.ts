/**
 * @file sockets/progress.handlers.ts
 * @description Socket.IO event handlers for progress tracking.
 * Implements real-time progress tracking for course content and videos.
 */

import { Server } from 'socket.io';
import { 
  ContentProgressPayload,
  VideoProgressPayload
} from '@shared/types/notification.types';
import logger from '@/config/logger.js';
import { AuthenticatedSocket } from './index.js';

// Temporary local enum definition for SocketEventName
enum SocketEventName {
  CONTENT_PROGRESS_UPDATE = 'content:progress:update',
  VIDEO_PROGRESS_UPDATE = 'video:progress:update'
}

/**
 * Register progress tracking related socket event handlers
 * @param io Socket.IO server instance
 * @param socket Authenticated socket instance
 */
export const registerProgressHandlers = (
  io: Server,
  socket: AuthenticatedSocket
): void => {
  const { user } = socket.data;
  const userId = user.id;
  const tenantId = user.tenantId;

  /**
   * Handler for content progress updates
   * @param payload Content progress data
   */
  socket.on(
    SocketEventName.CONTENT_PROGRESS_UPDATE,
    async (payload: ContentProgressPayload) => {
      try {
        // Validate tenant isolation
        if (payload.tenantId !== tenantId) {
          logger.warn(`Tenant mismatch attempt: Socket user ${userId} (tenant ${tenantId}) tried to update progress in tenant ${payload.tenantId}`);
          return;
        }

        // Validate user can only update their own progress
        if (payload.userId !== userId) {
          logger.warn(`Unauthorized progress update: Socket user ${userId} tried to update progress for user ${payload.userId}`);
          return;
        }

        logger.info(`Content progress update received from user ${userId} for course ${payload.courseId}`);
        
        // Save progress update to database
        // In real implementation:
        // await progressService.updateContentProgress(payload);
        
        // Emit confirmation back to the user
        socket.emit(`${SocketEventName.CONTENT_PROGRESS_UPDATE}:success`, {
          courseId: payload.courseId,
          moduleId: payload.moduleId,
          topicId: payload.topicId,
          contentId: payload.contentId,
          progressPercentage: payload.progressPercentage,
          timestamp: new Date().toISOString()
        });
        
        // If course completion threshold is reached, notify instructors
        if (payload.progressPercentage >= 100) {
          // Emit to instructors for this course
          // In real implementation, would use a query to find relevant instructors
          // const instructors = await courseService.getCourseInstructors(payload.courseId, tenantId);
          // instructors.forEach(instructor => {
          //   io.to(`user:${instructor.id}`).emit('student:progress:complete', {
          //     studentId: userId,
          //     courseId: payload.courseId,
          //     completedAt: payload.completedAt || new Date().toISOString()
          //   });
          // });
        }
      } catch (error) {
        logger.error(`Error handling ${SocketEventName.CONTENT_PROGRESS_UPDATE} event:`, error);
        socket.emit(`${SocketEventName.CONTENT_PROGRESS_UPDATE}:error`, {
          message: 'Failed to save progress update',
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  /**
   * Handler for video progress updates
   * @param payload Video progress data
   */
  socket.on(
    SocketEventName.VIDEO_PROGRESS_UPDATE,
    async (payload: VideoProgressPayload) => {
      try {
        // Validate tenant isolation
        if (payload.tenantId !== tenantId) {
          logger.warn(`Tenant mismatch attempt: Socket user ${userId} (tenant ${tenantId}) tried to update video progress in tenant ${payload.tenantId}`);
          return;
        }

        // Validate user can only update their own progress
        if (payload.userId !== userId) {
          logger.warn(`Unauthorized progress update: Socket user ${userId} tried to update video progress for user ${payload.userId}`);
          return;
        }

        logger.info(`Video progress update received from user ${userId} for video ${payload.videoId}`);
        
        // Save video progress update to database
        // In real implementation:
        // await progressService.updateVideoProgress(payload);
        
        // Emit confirmation back to the user
        socket.emit(`${SocketEventName.VIDEO_PROGRESS_UPDATE}:success`, {
          videoId: payload.videoId,
          currentTimeSeconds: payload.currentTimeSeconds,
          isCompleted: payload.isCompleted,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Error handling ${SocketEventName.VIDEO_PROGRESS_UPDATE} event:`, error);
        socket.emit(`${SocketEventName.VIDEO_PROGRESS_UPDATE}:error`, {
          message: 'Failed to save video progress update',
          timestamp: new Date().toISOString()
        });
      }
    }
  );
};
