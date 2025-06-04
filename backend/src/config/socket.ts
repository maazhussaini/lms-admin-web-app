/**
 * @file config/socket.ts
 * @description Socket.IO configuration and initialization.
 */

import { Server } from 'socket.io';
import http from 'http';
import env from './environment.js';
import logger from './logger.js';
import { verifyAccessToken } from '@/utils/jwt.utils.js';

// Initialize Socket.IO
export const initializeSocket = (server: http.Server) => {
  // Create Socket.IO server with CORS options
  const io = new Server(server, {
    path: env.SOCKET_IO_PATH,
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware for authentication and tenant scoping
  io.use(async (socket, next) => {
    try {
      // Get token from handshake query or headers
      const token = 
        socket.handshake.auth.token ||
        socket.handshake.query.token || 
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const decoded = verifyAccessToken(token);
      
      // Add user data to socket
      socket.data.user = {
        id: decoded.id,
        role: decoded.role,
        tenantId: decoded.tenantId,
      };
      
      // Add user to tenant-specific room
      socket.join(`tenant:${decoded.tenantId}`);
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const { user } = socket.data;
    
    logger.info(`Socket connected: ${socket.id} (User: ${user.id}, Tenant: ${user.tenantId})`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} - ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  return io;
};

export default initializeSocket;
