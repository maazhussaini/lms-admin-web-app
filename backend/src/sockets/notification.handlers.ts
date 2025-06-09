/**
 * @file sockets/notification.handlers.ts
 * @description Socket.IO event handlers for notifications.
 * Implements real-time notification delivery and management.
 */

import { Server } from 'socket.io';
import { 
  NotificationPayload,
  NotificationStatusPayload
} from '@shared/types/notification.types';
import logger from '@/config/logger.js';
import { AuthenticatedSocket } from './index.js';
import { 
  validateNotificationStatusPayload,
  withValidationAndErrorResponse
} from '@/utils/validation.utils.js';
import { SocketEventName } from '@/types/enums';

/**
 * Register notification related socket event handlers
 * @param _io Socket.IO server instance
 * @param socket Authenticated socket instance
 */
export const registerNotificationHandlers = (
  _io: Server,
  socket: AuthenticatedSocket
): void => {
  const { user } = socket.data;
  const userId = user.id;
  const tenantId = user.tenantId;

  // Join user-specific notification room for targeted delivery
  socket.join(`user:${userId}:notifications`);
  /**
   * Handler for marking a notification as read
   * @param payload Notification status update data
   */
  socket.on(
    SocketEventName.NOTIFICATION_READ,
    withValidationAndErrorResponse(
      socket,
      SocketEventName.NOTIFICATION_READ,
      validateNotificationStatusPayload,
      async (payload: NotificationStatusPayload) => {
        // Validate tenant isolation
        if (payload.tenantId !== tenantId) {
          logger.warn(`Tenant mismatch attempt: Socket user ${userId} (tenant ${tenantId}) tried to access tenant ${payload.tenantId} data`);
          return;
        }

        // Validate user can only mark their own notifications
        if (payload.userId !== userId) {
          logger.warn(`Unauthorized notification access: Socket user ${userId} tried to mark notifications for user ${payload.userId}`);
          return;
        }

        logger.info(`User ${userId} marked notification ${payload.notificationId} as read`);
        
        // Update notification in database (would use a service method in real implementation)
        // await notificationService.markAsRead(payload.notificationId, userId, tenantId);
        
        // Emit confirmation back to the user
        socket.emit(`${SocketEventName.NOTIFICATION_READ}:success`, {
          notificationId: payload.notificationId,
          status: 'READ',
          timestamp: new Date().toISOString()
        });
      }
    )
  );
  /**
   * Handler for dismissing a notification
   * @param payload Notification status update data
   */
  socket.on(
    SocketEventName.NOTIFICATION_DISMISSED,
    withValidationAndErrorResponse(
      socket,
      SocketEventName.NOTIFICATION_DISMISSED,
      validateNotificationStatusPayload,
      async (payload: NotificationStatusPayload) => {
        // Validate tenant isolation
        if (payload.tenantId !== tenantId) {
          logger.warn(`Tenant mismatch attempt: Socket user ${userId} (tenant ${tenantId}) tried to access tenant ${payload.tenantId} data`);
          return;
        }

        // Validate user can only dismiss their own notifications
        if (payload.userId !== userId) {
          logger.warn(`Unauthorized notification access: Socket user ${userId} tried to dismiss notifications for user ${payload.userId}`);
          return;
        }

        logger.info(`User ${userId} dismissed notification ${payload.notificationId}`);
        
        // Update notification in database (would use a service method in real implementation)
        // await notificationService.dismiss(payload.notificationId, userId, tenantId);
        
        // Emit confirmation back to the user
        socket.emit(`${SocketEventName.NOTIFICATION_DISMISSED}:success`, {
          notificationId: payload.notificationId,
          status: 'DISMISSED',
          timestamp: new Date().toISOString()
        });
      }
    )
  );

  /**
   * Request unread notification count
   * No payload needed as it's scoped to the authenticated user
   */
  socket.on(SocketEventName.NOTIFICATION_COUNT, async () => {
    try {
      // In a real implementation, we would fetch counts from the database
      // const counts = await notificationService.getUnreadCounts(userId, tenantId);
      
      // For now, just emit mock data
      socket.emit(`${SocketEventName.NOTIFICATION_COUNT}:data`, {
        userId,
        tenantId,
        unreadCount: 5, // Mock data
        urgentCount: 1, // Mock data
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error handling ${SocketEventName.NOTIFICATION_COUNT} event:`, error);
      socket.emit(`${SocketEventName.NOTIFICATION_COUNT}:error`, {
        message: 'Failed to retrieve notification counts',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Request paginated notification list
   * @param options Pagination options
   */
  socket.on(SocketEventName.NOTIFICATION_LIST, async (options: { page?: number; limit?: number; status?: string }) => {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      
      // In a real implementation, we would fetch notifications from the database
      // const notifications = await notificationService.listForUser(userId, tenantId, page, limit, options.status);
      
      // For now, just emit mock data
      socket.emit(`${SocketEventName.NOTIFICATION_LIST}:data`, {
        userId,
        tenantId,
        items: [], // Mock data - would be actual notifications
        page,
        limit,
        total: 0, // Mock total count
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error handling ${SocketEventName.NOTIFICATION_LIST} event:`, error);
      socket.emit(`${SocketEventName.NOTIFICATION_LIST}:error`, {
        message: 'Failed to retrieve notifications',
        timestamp: new Date().toISOString()
      });
    }
  });
};

/**
 * Send a new notification to a specific user
 * @param io Socket.IO server instance
 * @param notification Notification payload
 */
export const sendNotificationToUser = (
  io: Server,
  notification: NotificationPayload
): void => {
  const { recipientId, tenantId } = notification;
  
  // Emit to user-specific room
  io.to(`user:${recipientId}:notifications`).emit(
    SocketEventName.NOTIFICATION_NEW, 
    {
      ...notification,
      timestamp: notification.timestamp || new Date().toISOString()
    }
  );
  
  logger.info(`Notification sent to user ${recipientId} in tenant ${tenantId}`);
};

/**
 * Broadcast a notification to all users in a tenant
 * @param io Socket.IO server instance
 * @param notification Notification payload
 */
export const broadcastNotificationToTenant = (
  io: Server,
  notification: Omit<NotificationPayload, 'recipientId'>
): void => {
  const { tenantId } = notification;
  
  // Emit to tenant-specific room
  io.to(`tenant:${tenantId}`).emit(
    SocketEventName.NOTIFICATION_NEW, 
    {
      ...notification,
      timestamp: notification.timestamp || new Date().toISOString()
    }
  );
  
  logger.info(`Notification broadcast to all users in tenant ${tenantId}`);
};
