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
import { registerSocketHandlers, type SocketUser, type UserRole } from '@/sockets/index.js';
import { joinStandardRooms } from '@/sockets/socket.utils.js';

/**
 * Socket.IO error response interface for consistent error handling
 */
export interface SocketErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

/**
 * Socket.IO success response interface for consistent success handling
 */
export interface SocketSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

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
  });  /**
   * Safely extract Bearer token from authorization header
   * @param authHeader Authorization header value
   * @returns JWT token string or undefined if not valid
   */
  const extractBearerToken = (authHeader: string | string[] | undefined): string | undefined => {
    if (!authHeader || Array.isArray(authHeader) || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  };

  // Middleware for authentication and tenant scoping  // Enhanced authentication middleware with better error typing
  io.use(async (socket, next) => {
    try {
      // Extract token from handshake (query parameter for socket connections)
      const token = extractBearerToken(socket.handshake.auth?.['token'] || socket.handshake.query?.['token']);
      
      if (!token) {
        logger.warn(`Socket connection rejected: Missing authentication token (IP: ${socket.handshake.address})`);
        const authError = new Error('Authentication required') as Error & { data?: SocketErrorResponse };
        authError.data = {
          success: false,
          error: {
            message: 'Authentication required',
            code: 'SOCKET_AUTH_REQUIRED'
          },
          timestamp: new Date().toISOString()
        };
        return next(authError);
      }

      // Verify JWT token
      const decoded = verifyAccessToken(token);
        // Add user data to socket with proper typing
      (socket.data as { user: SocketUser }).user = {
        id: decoded.id,
        role: decoded.role as UserRole,
        tenantId: decoded.tenantId,
        email: decoded.email,
      };
      
      // Join standard rooms based on user role and tenant
      joinStandardRooms(socket);
      
      logger.debug(`Socket authenticated: ${socket.id} (User: ${decoded.id}, Role: ${decoded.role}, Tenant: ${decoded.tenantId})`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      const authError = new Error('Authentication failed') as Error & { data?: SocketErrorResponse };
      const errorDetails: Record<string, any> | undefined = process.env['NODE_ENV'] === 'development' 
        ? { error: String(error) } 
        : undefined;
        authError.data = {
        success: false,
        error: {
          message: 'Authentication failed',
          code: 'SOCKET_AUTH_FAILED',
          ...(errorDetails && { details: errorDetails })
        },
        timestamp: new Date().toISOString()
      };
      return next(authError);
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
