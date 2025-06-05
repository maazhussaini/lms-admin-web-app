/**
 * @file config/socket.ts
 * @description Socket.IO configuration and initialization.
 * Configures Socket.IO server with authentication, CORS, and event handlers.
 */

import { Server } from 'socket.io';
import http from 'http';
import env from './environment.js';
import logger from './logger.js';
import { verifyAccessToken } from '@/utils/jwt.utils.js';
import { registerSocketHandlers } from '@/sockets/index.js';
import { joinStandardRooms } from '@/sockets/socket.utils.js';

/**
 * Initialize Socket.IO server with authentication middleware and event handlers
 * @param server HTTP server instance
 * @returns Configured Socket.IO server
 */
export const initializeSocket = (server: http.Server) => {
  // Create Socket.IO server with CORS options
  const io = new Server(server, {
    path: env.SOCKET_IO_PATH,
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Configure Socket.IO options
    connectionStateRecovery: {
      // Enable connection state recovery for better reconnection experience
      maxDisconnectionDuration: 30 * 60 * 1000, // 30 minutes
    },
    pingTimeout: 30000, // 30 seconds
    pingInterval: 25000, // 25 seconds
  });

  // Middleware for authentication and tenant scoping
  io.use(async (socket, next) => {
    try {
      // Get token from handshake query or headers
      const token = 
        socket.handshake.auth.token ||
        socket.handshake.query.token?.toString() || 
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        logger.warn(`Socket connection rejected: Missing authentication token (IP: ${socket.handshake.address})`);
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
      
      // Join standard rooms based on user role and tenant
      joinStandardRooms(socket);
      
      logger.debug(`Socket authenticated: ${socket.id} (User: ${decoded.id}, Role: ${decoded.role}, Tenant: ${decoded.tenantId})`);
      next();
    } catch (error) {      logger.error('Socket authentication error:', error);
      return next(new Error('Authentication failed'));
    }
  });

  // Register all socket event handlers
  registerSocketHandlers(io);

  // Add instrumentation middleware for debugging and monitoring in development
  if (env.NODE_ENV === 'development') {
    io.engine.on('connection_error', (err) => {
      logger.error('Socket.IO connection error:', {
        type: err.code,
        message: err.message,
        context: err.context
      });
    });
  }

  logger.info('Socket.IO server initialized successfully');
  return io;
};

export default initializeSocket;
