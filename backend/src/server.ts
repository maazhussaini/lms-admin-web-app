/**
 * @file server.ts
 * @description HTTP server initialization, database connection, and Socket.IO setup.
 */

import http from 'http';
import app from '@/app';
import env from '@/config/environment';
import logger from '@/config/logger';
import prisma, { handleDatabaseShutdown } from '@/config/database';
import { initializeSocket } from '@/config/socket';
import { Server as SocketServer } from 'socket.io';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Create global socket reference for use in other modules
declare global {
  var io: SocketServer | undefined;
}
global.io = io;

// Start the server
const startServer = async (): Promise<void> => {
  try {
    // Ensure database connection
    await prisma.$connect();
    logger.info('Database connection established');
    
    // Start the HTTP server
    await new Promise<void>((resolve, reject) => {
      server.listen(env.PORT, () => {
        logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        logger.info(`API base URL: ${env.API_BASE_URL}`);
        logger.info(`Socket.IO path: ${env.SOCKET_IO_PATH}`);
        resolve();
      });

      // Handle server startup errors
      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${env.PORT} is already in use`);
        } else {
          logger.error('Server startup error:', error);
        }
        reject(error);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, _promise: Promise<unknown>) => {
  logger.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close HTTP server
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          logger.error('Error closing HTTP server:', error);
          reject(error);
        } else {
          logger.info('HTTP server closed successfully');
          resolve();
        }
      });
    });

    // Close Socket.IO server
    if (io) {
      await new Promise<void>((resolve) => {
        io.close(() => {
          logger.info('Socket.IO server closed successfully');
          resolve();
        });
      });
    }

    // Close database connections
    await handleDatabaseShutdown();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

// Export for testing
export { server, io };
