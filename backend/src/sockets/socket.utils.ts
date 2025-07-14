/**
 * @file sockets/socket.utils.ts
 * @description Utility functions for Socket.IO event handlers.
 * Provides common functionality for socket authorization and tenant isolation.
 */

import { AuthenticatedSocket, UserRole } from './index';
import logger from '@/config/logger';

/**
 * Check if a socket user has the required role(s)
 * @param socket Authenticated socket instance
 * @param allowedRoles Array of roles allowed to perform the action
 * @returns Boolean indicating if the user has permission
 */
export const checkSocketRoleAuthorization = (
  socket: AuthenticatedSocket,
  allowedRoles: UserRole[]
): boolean => {
  const { role } = socket.data.user;
  
  if (!role || !allowedRoles.includes(role)) {
    return false;
  }
  
  return true;
};

/**
 * Verify tenant isolation for socket events
 * @param socket Authenticated socket instance
 * @param eventTenantId Tenant ID from the event payload
 * @returns Boolean indicating if the tenant matches
 */
export const verifySocketTenantIsolation = (
  socket: AuthenticatedSocket,
  eventTenantId: number
): boolean => {
  const { tenantId } = socket.data.user;
  
  if (tenantId !== eventTenantId) {
    logger.warn(`Tenant mismatch: Socket user from tenant ${tenantId} attempted to access tenant ${eventTenantId} data`);
    return false;
  }
  
  return true;
};

/**
 * Join socket to standard rooms based on user data
 * @param socket Authenticated socket instance
 */
export const joinStandardRooms = (
  socket: AuthenticatedSocket
): void => {
  const { id: userId, tenantId, role } = socket.data.user;
  
  // Join tenant room
  socket.join(`tenant:${tenantId}`);
  
  // Join user-specific room
  socket.join(`user:${userId}`);
  
  // Join role-specific rooms
  socket.join(`role:${role.toLowerCase()}`);
  socket.join(`tenant:${tenantId}:role:${role.toLowerCase()}`);
  
  // Join admin rooms if applicable
  if (['ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'].includes(role)) {
    socket.join('admins');
    socket.join(`tenant:${tenantId}:admins`);
  }
  
  logger.debug(`Socket ${socket.id} joined standard rooms for user ${userId} in tenant ${tenantId}`);
};

/**
 * Create an error response for socket events
 * @param message Error message
 * @param code Error code
 * @returns Formatted error response object
 */
export const createSocketErrorResponse = (
  message: string,
  code: string = 'SOCKET_ERROR'
) => {
  return {
    success: false,
    error: {
      message,
      code
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Create a success response for socket events
 * @param data Response data
 * @param message Success message
 * @returns Formatted success response object
 */
export const createSocketSuccessResponse = <T>(
  data: T,
  message: string = 'Success'
) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};
