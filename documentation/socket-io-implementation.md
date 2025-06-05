# Socket.IO Implementation for LMS

## Overview

This document outlines the Socket.IO implementation for the Learning Management System (LMS), providing real-time communication capabilities for notifications, course updates, progress tracking, and more.

## Features

- **Authentication**: JWT-based authentication for all socket connections
- **Tenant Isolation**: Strict tenant-based data separation
- **Role-Based Authorization**: Controls access to socket events based on user roles
- **Structured Event Handlers**: Organized by domain (notifications, courses, progress, admin)
- **Type Safety**: Shared TypeScript types for all socket events

## Architecture

The Socket.IO implementation follows a modular architecture:

1. **Initialization** (`config/socket.ts`): Configures the Socket.IO server with authentication middleware and CORS settings
2. **Handler Registration** (`sockets/index.ts`): Registers domain-specific event handlers
3. **Domain Handlers** (`sockets/*.handlers.ts`): Implement event handlers for specific domains
4. **Utilities** (`sockets/socket.utils.ts`): Shared helper functions for socket operations
5. **Service Layer** (`services/socket.service.ts`): Provides an API for other services to interact with Socket.IO

## Event Types

Event types are defined in `shared/types/notification.types.ts` and include:

- Connection events (connect, disconnect, error)
- Notification events (new, read, dismissed, count)
- Course events (updates, enrollment changes)
- Progress tracking events (content progress, video progress)
- Admin events (tenant broadcasts, system alerts)

## Authentication

Socket connections are authenticated using JWT tokens, which can be provided in:
- Handshake query params: `?token=<jwt>`
- Handshake auth: `{ auth: { token: '<jwt>' } }`
- Authorization header: `Authorization: Bearer <jwt>`

The token is verified and user data (id, role, tenantId) is attached to the socket.

## Room Structure

Sockets are automatically joined to rooms based on user data:

- `tenant:<tenantId>`: All users in a tenant
- `user:<userId>`: User-specific room
- `role:<roleName>`: Role-specific room
- `tenant:<tenantId>:role:<roleName>`: Tenant and role-specific room
- `course:<courseId>`: Users enrolled in or teaching a course
- `tenant:<tenantId>:admins`: Admins for a specific tenant

## Usage Examples

### Server-side

```typescript
// Send notification to a specific user
socketService.sendNotificationToUser(userId, {
  tenantId,
  title: 'New Assignment',
  message: 'A new assignment has been posted',
  type: NotificationType.ASSIGNMENT_DUE,
  priority: NotificationPriority.NORMAL
});

// Broadcast to all users in a tenant
socketService.broadcastToTenant(tenantId, {
  title: 'System Maintenance',
  message: 'The system will be down for maintenance tonight',
  type: NotificationType.SYSTEM_ALERT,
  priority: NotificationPriority.HIGH
});
```

### Client-side (example)

```typescript
// Connect with authentication
const socket = io(baseUrl, {
  path: '/socket.io',
  auth: {
    token: jwtToken
  }
});

// Listen for new notifications
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
  // Update UI with new notification
});

// Mark notification as read
socket.emit('notification:read', {
  tenantId: currentTenantId,
  notificationId: 123,
  userId: currentUserId,
  status: 'READ'
});

// Join a course room when viewing course
socket.emit('course:join', courseId);
```

## Security Considerations

- All events enforce tenant isolation
- Role-based authorization for sensitive operations
- User-specific operations are validated against the authenticated user
- All event handlers include comprehensive error handling
- Logging of security events (failed access attempts, tenant isolation violations)

## Monitoring

- Connection events are logged (connect, disconnect, errors)
- Performance metrics can be gathered from room sizes and event frequencies
- Errors are logged with context for troubleshooting
