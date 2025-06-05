/**
 * @file sockets/course.handlers.ts
 * @description Socket.IO event handlers for course-related events.
 * Implements real-time course updates and activity notifications.
 */

import { Server } from 'socket.io';
import { 
  CourseUpdatePayload
} from '@shared/types/notification.types';
import logger from '@/config/logger.js';
import { AuthenticatedSocket } from './index.js';
import { checkSocketRoleAuthorization } from './socket.utils.js';

// Temporary local enum definition for SocketEventName
enum SocketEventName {
  COURSE_UPDATE = 'course:update'
}

/**
 * Register course related socket event handlers
 * @param io Socket.IO server instance
 * @param socket Authenticated socket instance
 */
export const registerCourseHandlers = (
  io: Server,
  socket: AuthenticatedSocket
): void => {
  const { user } = socket.data;
  const userId = user.id;
  const tenantId = user.tenantId;
  const userRole = user.role;

  // Course update event - only instructors/teachers and admins can emit this
  socket.on(
    SocketEventName.COURSE_UPDATE,
    async (payload: CourseUpdatePayload) => {
      try {
        // Check role authorization
        if (!checkSocketRoleAuthorization(socket, ['TEACHER', 'INSTRUCTOR', 'ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'])) {
          logger.warn(`Unauthorized role access: User ${userId} with role ${userRole} attempted to send course update`);
          return;
        }

        // Validate tenant isolation
        if (payload.tenantId !== tenantId) {
          logger.warn(`Tenant mismatch attempt: Socket user ${userId} (tenant ${tenantId}) tried to update course in tenant ${payload.tenantId}`);
          return;
        }

        logger.info(`Course update received from user ${userId} for course ${payload.courseId}`);
        
        // In real implementation, we might verify the user is actually an instructor for this course
        // await courseService.verifyCourseInstructor(payload.courseId, userId, tenantId);
        
        // Broadcast to all users enrolled in this course
        // In a real implementation, we would use a room like `course:${courseId}` that students and teachers join when they access a course
        io.to(`course:${payload.courseId}`).emit(SocketEventName.COURSE_UPDATE, {
          ...payload,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Error handling ${SocketEventName.COURSE_UPDATE} event:`, error);
        socket.emit(`${SocketEventName.COURSE_UPDATE}:error`, {
          message: 'Failed to process course update',
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  // Handle student joining a course room when they access a course
  socket.on('course:join', async (courseId: number) => {
    try {
      // In real implementation, verify the user is enrolled in or teaching this course
      // const hasAccess = await courseService.verifyUserCourseAccess(courseId, userId, tenantId);
      // if (!hasAccess) {
      //   logger.warn(`Unauthorized course access: User ${userId} attempted to join course ${courseId}`);
      //   return;
      // }
      
      socket.join(`course:${courseId}`);
      logger.info(`User ${userId} joined course room for course ${courseId}`);
      
      socket.emit('course:join:success', {
        courseId,
        joined: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error handling course:join event:`, error);
      socket.emit('course:join:error', {
        message: 'Failed to join course room',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle student leaving a course room
  socket.on('course:leave', (courseId: number) => {
    socket.leave(`course:${courseId}`);
    logger.info(`User ${userId} left course room for course ${courseId}`);
    
    socket.emit('course:leave:success', {
      courseId,
      left: true,
      timestamp: new Date().toISOString()
    });
  });
};

/**
 * Broadcast a course update to all users in a course
 * @param io Socket.IO server instance
 * @param courseId Course ID
 * @param update Course update payload
 */
export const broadcastCourseUpdate = (
  io: Server,
  courseId: number,
  update: CourseUpdatePayload
): void => {
  io.to(`course:${courseId}`).emit(SocketEventName.COURSE_UPDATE, {
    ...update,
    timestamp: update.timestamp || new Date().toISOString()
  });
  
  logger.info(`Course update broadcast to all users in course ${courseId}`);
};
