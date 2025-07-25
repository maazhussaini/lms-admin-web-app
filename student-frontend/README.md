# LMS Student Frontend

> Modern, secure, and scalable student portal featuring an enterprise-grade API system, built with React, TypeScript, Vite, and advanced data management patterns.

---

## Overview

The LMS Student Frontend is a production-ready web application that showcases advanced React patterns and enterprise-level API management. Built for students to manage courses, assignments, quizzes, and grades, it features a sophisticated type-safe API system with interceptors, caching, error boundaries, and comprehensive performance monitoring.

## ✨ Features

### 🎓 Core Student Features
- **Course Management**: Browse, enroll, and view course details with real-time updates
- **Interactive Learning**: Submit assignments, take quizzes, and track detailed progress
- **Grades & Analytics**: Comprehensive grade tracking with performance insights
- **Real-time Notifications**: Instant updates via WebSocket integration
- **Responsive Design**: Mobile-first, accessible UI with dark mode support

### 🚀 Advanced API System
- **Type-safe API Clients**: Full TypeScript support with automatic type inference
- **Response Metadata Access**: Debugging info, correlation IDs, and performance metrics
- **Automatic Error Handling**: Custom error types with detailed validation feedback
- **Request/Response Interceptors**: Cross-cutting concerns like auth, logging, and retries
- **Response Caching**: Configurable TTL with intelligent cache invalidation
- **React Hooks Integration**: Purpose-built hooks for common API patterns
- **Performance Monitoring**: Request timing, correlation tracking, and metrics
- **Error Boundaries**: Graceful error handling with retry mechanisms

### 🔐 Security & Authentication
- **JWT Token Management**: Automatic refresh and secure storage
- **Route-based Access Control**: Protected routes with role-based permissions
- **Request Correlation**: Distributed tracing for debugging and monitoring
- **Secure Token Storage**: Encrypted storage with auto-cleanup

## 🛠️ Tech Stack

### Core Technologies
- **React 19** with **TypeScript** - Latest React with full type safety
- **Vite** - Lightning-fast development and optimized builds
- **Tailwind CSS 4** - Utility-first styling with modern features
- **React Router** - Client-side routing with protected routes

### State Management & Data Fetching
- **TanStack React Query** - Powerful data synchronization and caching
- **React Context** - Global state for auth and UI preferences
- **Custom Hooks** - Reusable stateful logic patterns

### API & Communication
- **Enhanced Axios Client** - Type-safe HTTP client with interceptors
- **Request/Response Interceptors** - Automatic auth, logging, and error handling
- **Correlation IDs** - Distributed tracing and debugging support
- **Response Caching** - Intelligent caching with TTL and invalidation
- **Error Boundaries** - Graceful error handling and recovery

### Development & Quality
- **ESLint** - Advanced linting with React-specific rules
- **TypeScript Strict Mode** - Maximum type safety and error prevention
- **JWT Authentication** - Secure token management with auto-refresh
- **Performance Monitoring** - Built-in request timing and metrics

## Getting Started

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter & type checks
npm run check-all
```

## 📁 Project Structure

```text
student-frontend/
├── public/                    # Static assets (logo, icons, manifest)
├── src/                       # Main source code
│   ├── api/                   # 🚀 Enhanced API System
│   │   ├── index.ts           # Main API exports and initialization
│   │   ├── client.ts          # Core API client with interceptors
│   │   ├── client-with-meta.ts # Enhanced client with metadata access
│   │   ├── client-utils.ts    # API utility functions
│   │   ├── response-utils.ts  # Type-safe response handling
│   │   ├── interceptors.ts    # Request/response interceptors
│   │   ├── logger.ts          # API logging and debugging
│   │   ├── interfaces.ts      # API-specific TypeScript interfaces
│   │   ├── auth-provider.ts   # Authentication management
│   │   └── README.md          # Comprehensive API documentation
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base UI components (buttons, inputs, etc.)
│   │   ├── forms/             # Form components with validation
│   │   ├── layout/            # Layout components (header, sidebar)
│   │   └── APIErrorBoundary/  # Error boundary for API errors
│   ├── hooks/                 # Custom React hooks
│   │   ├── useApi.ts          # API operation hooks (CRUD, lists, etc.)
│   │   ├── useAuth.ts         # Authentication hooks
│   │   ├── useErrorBoundary.ts # Error boundary hooks
│   │   └── index.ts           # Hook exports
│   ├── pages/                 # Page components (routes)
│   ├── routes/                # Routing configuration
│   │   ├── ProtectedRoute.tsx # Route protection with auth checks
│   │   └── AppRoutes.tsx      # Main routing setup
│   ├── config/                # Configuration files
│   │   ├── routeConfig.ts     # Route definitions and permissions
│   │   └── apiConfig.ts       # API configuration and endpoints
│   ├── context/               # React context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   └── ThemeContext.tsx   # Theme and UI preferences
│   ├── store/                 # State management setup
│   │   └── queryClient.ts     # React Query configuration
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions and helpers
│   ├── constants/             # Application constants
│   ├── services/              # Business logic services
│   ├── examples/              # 📚 API usage examples and patterns
│   │   └── ApiUsageExamples.tsx # Comprehensive API demonstrations
│   ├── styles/                # Global styles and themes
│   └── main.tsx               # Application entry point
├── index.html                 # HTML template
├── tailwind.config.ts         # Tailwind CSS configuration
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This documentation
```

### 🎯 Key Architectural Highlights

- **API-First Design**: Comprehensive API system with enterprise patterns
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Error Resilience**: Multi-layer error handling with graceful degradation
- **Performance**: Optimized caching, lazy loading, and bundle splitting
- **Developer Experience**: Extensive tooling, logging, and debugging support

## 🚀 Enhanced API System

The student frontend features a sophisticated API system with enterprise-level capabilities:

### Core Features
- **Type-safe API clients** with automatic TypeScript inference
- **Response metadata access** for debugging and performance tracking
- **Request/response interceptors** for authentication, logging, and error handling
- **Response caching** with configurable TTL and intelligent invalidation
- **Correlation IDs** for distributed tracing and debugging
- **Automatic retry logic** for network errors and server issues
- **Performance monitoring** with timing metrics and request tracking

### Quick API Usage

```typescript
import { apiClient, apiClientWithMeta, ApiError } from '@/api';
import { useApiList, useApiCreate } from '@/hooks/useApi';

// Basic API call
const course = await apiClient.get<Course>('/courses/1');

// API call with metadata
const response = await apiClientWithMeta.get<Course>('/courses/1', { 
  includeMeta: true 
});

// Using React hooks for data management
function CourseList() {
  const { 
    data: courses, 
    loading, 
    error, 
    pagination,
    search 
  } = useApiList<Course>('/courses', { page: 1, limit: 10 });

  const { create: createCourse } = useApiCreate<Course>('/courses');

  // Component logic with built-in state management
}
```

### Error Handling

```typescript
import { ApiErrorBoundary } from '@/components/APIErrorBoundary';

function App() {
  return (
    <ApiErrorBoundary
      fallback={(error, retry) => (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <YourAppComponents />
    </ApiErrorBoundary>
  );
}
```

## 📚 Usage Examples & Patterns

### Comprehensive API Examples
See [`src/examples/ApiUsageExamples.tsx`](src/examples/ApiUsageExamples.tsx) for:
- Advanced API patterns and interceptors
- React hooks for CRUD operations
- Error boundary implementations
- Performance monitoring examples
- Caching strategies and invalidation
- Authentication token management

### Detailed API Documentation
See [`src/api/README.md`](src/api/README.md) for complete documentation including:
- API client configuration options
- Interceptor system usage
- Response caching patterns
- Custom hook implementations
- Performance monitoring setup
- Debugging and troubleshooting guides

### Development Commands

```powershell
# Development server with hot reload
npm run dev

# Type checking and linting
npm run type-check          # TypeScript type checking
npm run type-check:watch    # Watch mode type checking
npm run lint                # ESLint with error reporting
npm run lint:fix            # Auto-fix ESLint issues
npm run check-all           # Combined type check + lint

# Production builds
npm run build               # Production build
npm run preview             # Preview production build locally

# Advanced development
npm run type-check:strict   # Strict TypeScript checking
npm run lint:warn-only      # ESLint with warnings only
```

## 🔐 Security & Best Practices

### Authentication & Authorization
- **JWT Token Management**: Automatic refresh, secure storage, and cleanup
- **Route Protection**: Role-based access control with redirect handling
- **Token Security**: Encrypted storage with automatic expiration handling
- **CORS Protection**: Secure cross-origin request handling

### API Security Features
- **Request Correlation**: Unique correlation IDs for request tracing
- **Error Sanitization**: Sensitive data filtering in error responses
- **Performance Monitoring**: Request timing and size tracking
- **Automatic Retry**: Intelligent retry logic for failed requests

### Development Security
```typescript
// Secure API configuration
const apiConfig = {
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Correlation-ID': generateCorrelationId()
  }
};

// Protected route example
<ProtectedRoute requiredRole="STUDENT">
  <CourseDetailPage />
</ProtectedRoute>
```

:::note
All protected routes require authentication and permission checks. Token storage is encrypted and auto-cleaned for security. See [`src/config/routeConfig.ts`](src/config/routeConfig.ts) for route protection details.
:::

:::tip
Use the provided React hooks and error boundaries for robust API integration and graceful error handling. Check [`src/api/README.md`](src/api/README.md) for comprehensive API usage patterns.
:::

:::caution
For production deployments, ensure HTTPS is enabled for full token security and enable security headers via the API interceptors.
:::

## 🎨 Customization & Extension

### UI Customization
- **Theme System**: Customize colors, fonts, and breakpoints in [`src/index.css`](src/index.css) and [`tailwind.config.ts`](tailwind.config.ts)
- **Component Library**: Extend base components in [`src/components/ui/`](src/components/ui/)
- **Layout System**: Modify layouts in [`src/components/layout/`](src/components/layout/)

### API System Extension
- **Custom Interceptors**: Add request/response interceptors in [`src/api/interceptors.ts`](src/api/interceptors.ts)
- **API Clients**: Extend API clients in [`src/api/client.ts`](src/api/client.ts) and [`src/api/client-with-meta.ts`](src/api/client-with-meta.ts)
- **Custom Hooks**: Create reusable API hooks in [`src/hooks/useApi.ts`](src/hooks/useApi.ts)
- **Error Handling**: Customize error boundaries in [`src/components/APIErrorBoundary/`](src/components/APIErrorBoundary/)

### Routing & Navigation
- **Route Configuration**: Define routes and permissions in [`src/config/routeConfig.ts`](src/config/routeConfig.ts)
- **Protected Routes**: Customize route protection in [`src/routes/ProtectedRoute.tsx`](src/routes/ProtectedRoute.tsx)
- **Navigation**: Modify routing logic in [`src/routes/AppRoutes.tsx`](src/routes/AppRoutes.tsx)

### Development Workflow
- **API Logging**: Configure detailed API logging in [`src/api/logger.ts`](src/api/logger.ts)
- **Performance Monitoring**: Extend performance tracking in API interceptors
- **State Management**: Customize React Query configuration in [`src/store/queryClient.ts`](src/store/queryClient.ts)

## 🔧 Troubleshooting

### Common API Issues

**Authentication Errors:**
```powershell
# Check if tokens are properly configured
# Look for correlation IDs in browser console
# Verify API base URL configuration
```

**Network & Timeout Issues:**
- Check browser console for correlation IDs in error messages
- Verify backend server is running on correct port
- Review network tab for failed requests with timing information
- Check API interceptor logs for retry attempts

**Type Errors:**
```powershell
# Run strict type checking
npm run type-check:strict

# Check API interface definitions
# Verify shared types from parent project
```

**Performance Issues:**
- Check React Query DevTools for cache status
- Review API logger output for request timing
- Monitor correlation IDs for request tracing
- Verify response caching is working correctly

### Development Debugging

**Enable Detailed API Logging:**
```typescript
// In development mode, all requests are automatically logged
// Check browser console for:
// - Request/response timing
// - Correlation IDs
// - Cache hit/miss information
// - Retry attempts and error details
```

**API System Health Check:**
```typescript
// Test API connectivity
await apiClient.get('/health');

// Check authentication status
await apiClient.get('/auth/me');

// Verify interceptors are working
// Look for correlation IDs in request headers
```

### Security Warnings

:::caution
If you see warnings about insecure context or token storage, ensure:
- The app is served over HTTPS in production
- Environment variables are properly configured
- API base URLs use HTTPS protocol
- Token storage encryption is enabled
:::

### Performance Optimization

:::tip
For optimal performance:
- Use the provided React hooks for data fetching
- Leverage response caching for frequently accessed data
- Monitor correlation IDs for debugging distributed issues
- Enable React Query DevTools for cache inspection
:::

---

## 🚀 Advanced Features Summary

This student frontend showcases enterprise-level React patterns and API management:

- **🔧 Enhanced API System**: Type-safe clients with interceptors, caching, and monitoring
- **🎣 Custom React Hooks**: Purpose-built hooks for common API operations
- **🛡️ Error Boundaries**: Comprehensive error handling with graceful recovery
- **📊 Performance Monitoring**: Built-in timing, correlation tracking, and metrics
- **🔐 Security First**: JWT management, route protection, and secure storage
- **📚 Comprehensive Documentation**: Detailed guides and usage examples

For complete API documentation and advanced usage patterns, see [`src/api/README.md`](src/api/README.md).

For backend integration and overall project architecture, refer to the main project documentation.

---

*This frontend demonstrates production-ready React architecture with enterprise API patterns - perfect for modern web applications requiring robust data management and user experience.*
