/**
 * @file services/socket.service.ts
 * @description Service for interacting with Socket.IO from other parts of the application.
 * Provides methods for sending notifications and broadcasting messages.
 */

import { Server } from 'socket.io';
import { 
  NotificationPayload,
  CourseUpdatePayload
} from '@shared/types/notification.types';
import logger from '@/config/logger.js';
import { SocketEventName } from '@/types/enums';

/**
 * Get the global Socket.IO server instance
 * @returns Socket.IO server instance
 * @throws Error if Socket.IO is not initialized
 */
export const getSocketIO = (): Server => {
  if (!global.io) {
    throw new Error('Socket.IO is not initialized');
  }
  return global.io;
};

/**
 * Socket service for interacting with Socket.IO from other parts of the application
 */
export class SocketService {
  private io: Server;
  
  /**
   * Create a new SocketService instance
   */
  constructor() {
    this.io = getSocketIO();
  }
  
  /**
   * Send a notification to a specific user
   * @param userId User ID to send notification to
   * @param notification Notification payload
   */
  sendNotificationToUser(userId: number, notification: Omit<NotificationPayload, 'recipientId'>): void {
    try {
      this.io.to(`user:${userId}`).emit(
        SocketEventName.NOTIFICATION_NEW, 
        {
          ...notification,
          recipientId: userId,
          timestamp: notification.timestamp || new Date().toISOString()
        }
      );
      
      logger.info(`Notification sent to user ${userId} in tenant ${notification.tenantId}`);
    } catch (error) {
      logger.error(`Failed to send notification to user ${userId}:`, error);
    }
  }
  
  /**
   * Broadcast a notification to all users in a tenant
   * @param tenantId Tenant ID to broadcast to
   * @param notification Notification payload
   */
  broadcastToTenant(tenantId: number, notification: Omit<NotificationPayload, 'recipientId' | 'tenantId'>): void {
    try {
      this.io.to(`tenant:${tenantId}`).emit(
        SocketEventName.NOTIFICATION_NEW, 
        {
          ...notification,
          tenantId,
          timestamp: notification.timestamp || new Date().toISOString()
        }
      );
      
      logger.info(`Notification broadcast to all users in tenant ${tenantId}`);
    } catch (error) {
      logger.error(`Failed to broadcast notification to tenant ${tenantId}:`, error);
    }
  }
  
  /**
   * Send a course update to all users enrolled in a course
   * @param courseId Course ID
   * @param tenantId Tenant ID
   * @param update Course update data
   */
  sendCourseUpdate(courseId: number, tenantId: number, update: Omit<CourseUpdatePayload, 'tenantId'>): void {
    try {
      this.io.to(`course:${courseId}`).emit(
        SocketEventName.COURSE_UPDATE, 
        {
          ...update,
          tenantId,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.info(`Course update sent for course ${courseId} in tenant ${tenantId}`);
    } catch (error) {
      logger.error(`Failed to send course update for course ${courseId}:`, error);
    }
  }
  
  /**
   * Get count of active users for a tenant
   * @param tenantId Tenant ID
   * @returns Promise resolving to count of active users
   */
  async getActiveUsersCount(tenantId: number): Promise<number> {
    try {
      const room = this.io.sockets.adapter.rooms.get(`tenant:${tenantId}`);
      return room ? room.size : 0;
    } catch (error) {
      logger.error(`Failed to get active users count for tenant ${tenantId}:`, error);
      return 0;
    }
  }
  
  /**
   * Get active sockets for a specific user
   * @param userId User ID
   * @returns Array of socket IDs for the user
   */
  getUserActiveSockets(userId: number): string[] {
    try {
      const room = this.io.sockets.adapter.rooms.get(`user:${userId}`);
      return room ? Array.from(room) : [];
    } catch (error) {
      logger.error(`Failed to get active sockets for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Check if a user is currently online
   * @param userId User ID
   * @returns Boolean indicating if user has active sockets
   */
  isUserOnline(userId: number): boolean {
    return this.getUserActiveSockets(userId).length > 0;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
