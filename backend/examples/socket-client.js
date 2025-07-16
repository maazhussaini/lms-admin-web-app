

/**
 * @file examples/socket-client.js
 * @description Example Socket.IO client for testing the LMS Socket.IO implementation.
 * 
 * Usage:
 * 1. Install dependencies: npm install socket.io-client
 * 2. Run with Node.js: node examples/socket-client.js <jwt-token>
 */

import { io } from 'socket.io-client';
import { SocketEventName } from '../shared/types/notification.types';

// Get JWT token from command line arguments
const token = process.argv[2];

if (!token) {
  console.error('Please provide a JWT token as a command line argument');
  process.exit(1);
}

// Configuration
const SERVER_URL = 'http://localhost:3000';
const SOCKET_PATH = '/socket.io';

// Connect to Socket.IO server
const socket = io(SERVER_URL, {
  path: SOCKET_PATH,
  auth: {
    token
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server');
  console.log('Socket ID:', socket.id);
  
  // Request notification count
  socket.emit(SocketEventName.NOTIFICATION_COUNT);
  
  // Listen for notifications
  socket.on(SocketEventName.NOTIFICATION_NEW, (notification) => {
    console.log('New notification received:', notification);
  });
  
  // Listen for notification count response
  socket.on(`${SocketEventName.NOTIFICATION_COUNT}:data`, (data) => {
    console.log('Notification count:', data);
  });
  
  // Listen for course updates
  socket.on(SocketEventName.COURSE_UPDATE, (update) => {
    console.log('Course update received:', update);
  });
  
  // Listen for errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// Simple CLI interface
process.stdin.on('data', (data) => {
  const input = data.toString().trim();
  
  if (input === 'exit') {
    console.log('Disconnecting...');
    socket.disconnect();
    process.exit(0);
  } else if (input === 'status') {
    console.log('Connection status:', socket.connected ? 'Connected' : 'Disconnected');
  } else if (input.startsWith('mark-read ')) {
    const notificationId = parseInt(input.split(' ')[1]);
    if (isNaN(notificationId)) {
      console.error('Invalid notification ID');
    } else {
      // Get user data from token (simplified example)
      const tenantId = 1; // Example tenant ID
      const userId = 1;   // Example user ID
      
      // Mark notification as read
      socket.emit(SocketEventName.NOTIFICATION_READ, {
        notificationId,
        tenantId,
        userId,
        status: 'READ',
        timestamp: new Date().toISOString()
      });
      
      console.log(`Marked notification ${notificationId} as read`);
    }
  } else if (input === 'help') {
    console.log('Available commands:');
    console.log('  status         - Check connection status');
    console.log('  mark-read <id> - Mark notification as read');
    console.log('  exit           - Disconnect and exit');
    console.log('  help           - Show this help message');
  } else {
    console.log('Unknown command. Type "help" for available commands.');
  }
});
