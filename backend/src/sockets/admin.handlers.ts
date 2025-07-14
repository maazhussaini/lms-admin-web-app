/**
 * @file sockets/admin.handlers.ts
 * @description Socket.IO event handlers for admin-only functionality.
 * Implements tenant-wide broadcasts and system alerts.
 */

import { Server } from 'socket.io';
import { 
  NotificationPayload
} from '@shared/types/notification.types';
import logger from '@/config/logger';
import { AuthenticatedSocket } from './index';
import { checkSocketRoleAuthorization } from './socket.utils';
import { 
  validateTenantBroadcastPayload,
  validateSystemAlertPayload,
  withValidationAndErrorResponse
} from '@/utils/validation.utils';
import { SocketEventName } from '@/types/enums.types';

/**
 * Register admin-only socket event handlers
 * @param io Socket.IO server instance
 * @param socket Authenticated socket instance
 */
export const registerAdminHandlers = (
  io: Server,
  socket: AuthenticatedSocket
): void => {
  const { user } = socket.data;
  const userId = user.id;
  const tenantId = user.tenantId;

  // Join admin-specific room
  socket.join(`tenant:${tenantId}:admins`);
  /**
   * Handler for tenant-wide broadcasts
   * Only admins can trigger this event
   */
  socket.on(
    SocketEventName.TENANT_BROADCAST,
    withValidationAndErrorResponse(
      socket,
      SocketEventName.TENANT_BROADCAST,
      validateTenantBroadcastPayload,
      (payload: Omit<NotificationPayload, 'recipientId'>) => {
        // Double-check role authorization
        if (!checkSocketRoleAuthorization(socket, ['TENANT_ADMIN', 'SUPER_ADMIN'])) {
          logger.warn(`Unauthorized broadcast attempt: User ${userId} attempted to send tenant broadcast`);
          return;
        }

        // Validate tenant isolation
        if (payload.tenantId !== tenantId) {
          logger.warn(`Tenant mismatch attempt: Socket user ${userId} (tenant ${tenantId}) tried to broadcast to tenant ${payload.tenantId}`);
          return;
        }

        logger.info(`Tenant broadcast initiated by admin ${userId} for tenant ${tenantId}`);
        
        // Broadcast to all users in this tenant
        io.to(`tenant:${tenantId}`).emit(SocketEventName.NOTIFICATION_NEW, {
          ...payload,
          timestamp: new Date().toISOString()
        });
        
        // Confirm broadcast success back to admin
        socket.emit(`${SocketEventName.TENANT_BROADCAST}:success`, {
          sent: true,
          recipients: 'all-tenant-users', // In real implementation, could provide count
          timestamp: new Date().toISOString()
        });
      }
    )
  );
  /**
   * Handler for system alerts
   * Only super admins can trigger this event
   */
  socket.on(
    SocketEventName.SYSTEM_ALERT,
    withValidationAndErrorResponse(
      socket,
      SocketEventName.SYSTEM_ALERT,
      validateSystemAlertPayload,
      (payload: { message: string; severity: 'info' | 'warning' | 'critical' }) => {
        // Only super admins can send system alerts
        if (!checkSocketRoleAuthorization(socket, ['SUPER_ADMIN'])) {
          logger.warn(`Unauthorized system alert attempt: User ${userId} with role ${user.role} attempted to send system alert`);
          return;
        }

        logger.info(`System alert initiated by super admin ${userId}: ${payload.severity}`);
        
        // For critical alerts, broadcast to all connected users
        if (payload.severity === 'critical') {
          io.emit(SocketEventName.SYSTEM_ALERT, {
            ...payload,
            timestamp: new Date().toISOString()
          });
        } 
        // For non-critical alerts, just notify admins across all tenants
        else {
          // In a real implementation, would broadcast to admin rooms across all tenants
          // This is a simplified version
          socket.broadcast.to('admins').emit(SocketEventName.SYSTEM_ALERT, {
            ...payload,
            timestamp: new Date().toISOString()
          });
        }
        
        // Confirm alert sent
        socket.emit(`${SocketEventName.SYSTEM_ALERT}:success`, {
          sent: true,
          severity: payload.severity,
          timestamp: new Date().toISOString()
        });
      }
    )
  );

  /**
   * Admin-only event to get current active users count per tenant
   * Only accessible to admins
   */
  socket.on('admin:active-users', async () => {
    try {
      // Double-check role authorization
      if (!checkSocketRoleAuthorization(socket, ['TENANT_ADMIN', 'SUPER_ADMIN'])) {
        logger.warn(`Unauthorized active users query: User ${userId} attempted to access active users count`);
        return;
      }

      // In a real implementation, this would query Redis or another mechanism for tracking active users
      // For now, just return a simple count of sockets in the tenant room
      const room = io.sockets.adapter.rooms.get(`tenant:${tenantId}`);
      const connectedClients = room ? room.size : 0;
      
      socket.emit('admin:active-users:data', {
        tenantId,
        activeUsers: connectedClients,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error handling admin:active-users event:', error);
      socket.emit('admin:active-users:error', {
        message: 'Failed to retrieve active users count',
        timestamp: new Date().toISOString()
      });
    }
  });
};
