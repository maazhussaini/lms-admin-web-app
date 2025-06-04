/**
 * @file server.ts
 * @description HTTP server initialization and database connection.
 */

import http from 'http';
import app from '@/app.js';
import env from '@/config/environment.js';
import logger from '@/config/logger.js';
import prisma from '@/config/database.js';
import { initializeSocket } from '@/config/socket.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start the server
const startServer = async () => {  try {
    // Ensure database connection (commented out for initial setup)
    await prisma.$connect();
    logger.info('Database connection established');
    
    logger.info('Starting server without database connection for initial setup...');

    // Start the HTTP server
    server.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`API base URL: ${env.API_BASE_URL}`);
      logger.info(`Socket.IO path: ${env.SOCKET_IO_PATH}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();

// Export for testing
export { server, io };
