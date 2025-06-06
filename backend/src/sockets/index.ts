/**
 * @file sockets/index.ts
 * @description Socket.IO event handlers aggregation for the LMS.
 * This file imports and registers all socket event handlers.
 */

import { Server, Socket } from 'socket.io';
import { registerNotificationHandlers } from './notification.handlers.js';
import { registerCourseHandlers } from './course.handlers.js';
import { registerProgressHandlers } from './progress.handlers.js';
import { registerAdminHandlers } from './admin.handlers.js';
import logger from '@/config/logger.js';

/**
 * Supported user roles for socket authorization
 */
export type UserRole = 'STUDENT' | 'TEACHER' | 'TENANT_ADMIN' | 'SUPER_ADMIN';

/**
 * Socket user data from authentication middleware
 */
export interface SocketUser {
  id: number;
  role: UserRole;
  tenantId: number;
  email: string;
}

/**
 * Extended Socket interface with user data
 */
export interface AuthenticatedSocket extends Socket {
  data: {
    user: SocketUser;
  };
}

/**
 * Register all socket event handlers
 * @param io Socket.IO server instance
 */
export const registerSocketHandlers = (io: Server): void => {
  logger.info('Registering socket event handlers');
  
  // Set up connection handler
  io.on('connection', (socket: Socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    const { user } = authenticatedSocket.data;
    
    logger.info(`Socket connected: ${socket.id} (User: ${user.id}, Tenant: ${user.tenantId}, Role: ${user.role})`);

    // Register domain-specific handlers
    registerNotificationHandlers(io, authenticatedSocket);
    registerCourseHandlers(io, authenticatedSocket);
    registerProgressHandlers(io, authenticatedSocket);
      // Register admin handlers only for admin roles
    if (['SUPER_ADMIN', 'TENANT_ADMIN'].includes(user.role)) {
      registerAdminHandlers(io, authenticatedSocket);
    }

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} - ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });
};

export default registerSocketHandlers;
