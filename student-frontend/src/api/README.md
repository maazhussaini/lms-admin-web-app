# Enhanced API System

This document describes the enhanced API system implemented in the student frontend application. The system provides a robust, type-safe, and feature-rich foundation for API communications that aligns with the backend's established patterns.

## 🚀 Features

### Core Features
- **Type-safe API clients** with full TypeScript support
- **Response metadata access** for debugging and tracking
- **Automatic error handling** with custom error types
- **Request/response interceptors** for cross-cutting concerns
- **Comprehensive logging** for development and debugging
- **Error boundaries** for graceful error handling in React components
- **React hooks** for common API operations
- **Automatic retry logic** for network errors
- **Request correlation IDs** for distributed tracing

### Advanced Features
- **Response caching** with configurable TTL
- **Request timeouts** with abort controller support
- **Pagination helpers** with built-in navigation
- **Validation error handling** with detailed field-level errors
- **Authentication token management** with automatic refresh
- **Performance monitoring** with timing and metrics

## 📁 File Structure

```
src/api/
├── index.ts                 # Main entry point and exports
├── client.ts               # Original API client (enhanced)
├── client-with-meta.ts     # Enhanced client with metadata access
├── response-utils.ts       # Type-safe response handling utilities
├── interceptors.ts         # Request/response interceptor system
├── logger.ts              # Enhanced API logging utilities
└── examples/
    └── ApiUsageExamples.tsx # Comprehensive usage examples

src/hooks/
├── index.ts               # Barrel file
├── useApi.ts              # React hooks for API operations
└── useErrorBoundary.ts    # Exports the useErrorBoundary hook.

src/components/APIErrorBoundary/
├── ApiErrorBoundary.tsx   # Error boundary for API errors
```

## 🔧 Quick Start

### 1. Initialize the API System

```typescript
// In your main.tsx or app entry point
import { initializeApi } from '@/api';

// Initialize with common interceptors
initializeApi();
```

### 2. Basic Usage

```typescript
import { apiClient, ApiError } from '@/api';

// Simple GET request
try {
  const course = await apiClient.get<Course>('/courses/1');
  console.log(course); // Just the data
} catch (error) {
  if (error instanceof ApiError) {
    console.log('API Error:', error.message);
    console.log('Status:', error.statusCode);
    console.log('Correlation ID:', error.correlationId);
  }
}
```

### 3. Enhanced Usage with Metadata

```typescript
import { apiClientWithMeta } from '@/api';

// GET request with full response metadata
const response = await apiClientWithMeta.get<Course>('/courses/1', { 
  includeMeta: true 
});

console.log('Data:', response.data);
console.log('Status:', response.statusCode);
console.log('Message:', response.message);
console.log('Correlation ID:', response.correlationId);
console.log('Timestamp:', response.timestamp);
```

### 4. Paginated Data

```typescript
import { apiPatterns } from '@/api';

// Get paginated list with search and sorting
const result = await apiPatterns.getList<Course>('/courses', {
  page: 1,
  limit: 10,
  search: 'javascript',
  sortBy: 'createdAt',
  order: 'desc'
});

console.log('Courses:', result.items);
console.log('Pagination:', result.pagination);
```

### 5. React Hooks

```typescript
import { useApiList, useApiCreate } from '@/hooks/useApi';

function CourseList() {
  // Fetch paginated courses with built-in state management
  const { 
    data: courses, 
    loading, 
    error, 
    pagination,
    search,
    goToPage 
  } = useApiList<Course>('/courses', { page: 1, limit: 10 });

  // Create operation with state management
  const { 
    create: createCourse, 
    loading: createLoading, 
    error: createError 
  } = useApiCreate<Course, CreateCourseData>('/courses');

  const handleSearch = (query: string) => {
    search(query); // Automatically updates the list
  };

  const handleCreateCourse = async (data: CreateCourseData) => {
    const newCourse = await createCourse(data);
    // Handle success/error states automatically managed
  };

  // ... render logic
}
```

## 🛠 API Client Options

### Standard Options (ApiClientOptions)

```typescript
interface ApiClientOptions {
  headers?: Record<string, string>;    // Additional headers
  withAuth?: boolean;                  // Include auth token (default: true)
  signal?: AbortSignal;               // Abort controller signal
  timeout?: number;                   // Request timeout in ms
}
```

### Enhanced Options (ApiClientOptionsWithMeta)

```typescript
interface ApiClientOptionsWithMeta extends ApiClientOptions {
  includeMeta?: boolean;              // Return full response metadata
}
```

## 🔄 Interceptors

### Built-in Interceptors

```typescript
import { commonInterceptors } from '@/api';

// Add correlation ID to all requests
const correlationId = commonInterceptors.addCorrelationId();

// Add request timing
const timingId = commonInterceptors.addRequestTiming();

// Add user agent
const userAgentId = commonInterceptors.addUserAgent();

// Add development logging (dev mode only)
const loggingIds = commonInterceptors.addDevelopmentLogging();

// Add retry for network errors
const retryId = commonInterceptors.addRetryOnNetworkError(3, 1000);

// Add response caching
const cacheId = commonInterceptors.addResponseCaching(300000); // 5 minutes
```

### Custom Interceptors

```typescript
import { interceptorManager } from '@/api';

// Request interceptor
const requestId = interceptorManager.addRequestInterceptor(
  (config, url) => {
    // Modify request config
    const headers = new Headers(config.headers);
    headers.set('X-Custom-Header', 'value');
    return { ...config, headers };
  },
  { id: 'custom-request', priority: 100 }
);

// Response interceptor
const responseId = interceptorManager.addResponseInterceptor(
  (response) => {
    // Process response
    console.log('Response received:', response.statusCode);
    return response;
  },
  { id: 'custom-response', priority: 100 }
);

// Error interceptor
const errorId = interceptorManager.addErrorInterceptor(
  async (error) => {
    // Handle specific errors
    if (error.statusCode === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return error;
  },
  { id: 'custom-error', priority: 100 }
);
```

## 📊 Logging

### Basic Logging

```typescript
import { apiLogger } from '@/api';

// Configure logger
apiLogger.updateConfig({
  enabled: true,
  level: LogLevel.DEBUG,
  enableColors: true,
  enableGrouping: true,
  maxDataLength: 1000
});
```

### Custom Logging

```typescript
import { ApiLogger, LogLevel } from '@/api';

// Create custom logger instance
const customLogger = new ApiLogger({
  enabled: true,
  level: LogLevel.INFO,
  sensitiveHeaders: ['authorization', 'x-api-key'],
  sensitiveFields: ['password', 'secret']
});
```

## 🎣 React Hooks

### Available Hooks

- `useApiItem<T>(endpoint, options)` - Fetch single item
- `useApiList<T>(endpoint, params, options)` - Fetch paginated list
- `useApiCreate<T, D>(endpoint)` - Create operations
- `useApiUpdate<T, D>(endpoint)` - Update operations
- `useApiDelete(endpoint)` - Delete operations

### Hook Options

```typescript
interface ApiHookOptions {
  immediate?: boolean;        // Fetch immediately (default: true)
  retryOnError?: boolean;    // Retry on server errors (default: false)
  maxRetries?: number;       // Maximum retry attempts (default: 3)
  retryDelay?: number;       // Delay between retries in ms (default: 1000)
}
```

## 🚨 Error Handling

### Error Boundary

```typescript
import { ApiErrorBoundary } from '@/api';

function App() {
  return (
    <ApiErrorBoundary
      enableRetry={true}
      maxRetries={3}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('API Error:', error, errorInfo);
      }}
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

### Error Types

```typescript
import { ApiError } from '@/api';

try {
  await apiClient.get('/courses/1');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status Code:', error.statusCode);      // HTTP status
    console.log('Error Code:', error.errorCode);        // Backend error code
    console.log('Message:', error.message);             // Human readable message
    console.log('Details:', error.details);             // Validation details
    console.log('Correlation ID:', error.correlationId); // Request tracking
  }
}
```

## 🔧 Response Utilities

### Type-safe Response Handling

```typescript
import { 
  handlePaginatedResponse, 
  handleItemResponse, 
  getCorrelationId,
  hasValidationErrors,
  getValidationErrors 
} from '@/api';

// Handle paginated response
const paginatedData = handlePaginatedResponse(response);
console.log('Items:', paginatedData.items);
console.log('Pagination:', paginatedData.pagination);

// Handle single item response
const item = handleItemResponse(response);

// Check for validation errors
if (hasValidationErrors(errorResponse)) {
  const errors = getValidationErrors(errorResponse);
  console.log('Validation errors:', errors);
}
```

## 🎯 API Patterns

### Common Operations

```typescript
import { apiPatterns } from '@/api';

// Get by ID
const course = await apiPatterns.getById<Course>('/courses', 1);

// Create
const newCourse = await apiPatterns.create<Course>('/courses', courseData);

// Update
const updatedCourse = await apiPatterns.update<Course>('/courses', 1, updateData);

// Delete
await apiPatterns.delete('/courses', 1);

// Search
const searchResults = await apiPatterns.search<Course>('/courses', 'javascript', {
  category: 'programming',
  level: 'beginner'
});
```

## 📈 Performance Monitoring

### Built-in Metrics

The system automatically tracks:
- Request/response timing
- Request/response sizes
- Cache hit rates
- Retry counts
- Correlation IDs for tracing

### Custom Metrics

```typescript
import { apiLogger } from '@/api';

apiLogger.logPerformance('correlation-id-123', {
  duration: 150,
  requestSize: 1024,
  responseSize: 2048,
  cacheHit: false,
  retryCount: 1
});
```

## 🔐 Authentication

The system automatically handles:
- JWT token attachment to requests
- Token refresh on expiration
- Authentication error handling
- Automatic retry after token refresh

## 🌐 CORS and Headers

### Default Headers

- `Content-Type: application/json`
- `Authorization: Bearer <token>` (when authenticated)
- `X-Correlation-ID: <generated-id>`
- `User-Agent: <app-name>/<version>`

### Custom Headers

```typescript
await apiClient.get('/courses', {
  headers: {
    'X-Custom-Header': 'value',
    'Accept-Language': 'en-US'
  }
});
```

## 🧪 Testing

### Mock Interceptors

```typescript
import { interceptorManager } from '@/api';

// Add mock interceptor for testing
const mockId = interceptorManager.addResponseInterceptor(
  (response) => {
    // Return mock data
    return {
      ...response,
      data: mockData
    };
  },
  { id: 'test-mock', priority: 1000 }
);

// Run tests...

// Remove mock interceptor
interceptorManager.removeInterceptor(mockId);
```

## 📝 Migration Guide

### From Basic Client

```typescript
// Before
const data = await apiClient.get<Course>('/courses/1');

// After (same, fully backward compatible)
const data = await apiClient.get<Course>('/courses/1');

// Or with metadata
const response = await apiClientWithMeta.get<Course>('/courses/1', { includeMeta: true });
```

### Adding Error Handling

```typescript
// Before
try {
  const data = await apiClient.get('/courses/1');
} catch (error) {
  console.error(error.message);
}

// After
try {
  const data = await apiClient.get('/courses/1');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.log('Status:', error.statusCode);
    console.log('Correlation ID:', error.correlationId);
    if (error.details) {
      console.log('Validation errors:', getValidationErrors(error));
    }
  }
}
```

## 🔍 Debugging

### Development Mode

In development mode, the system automatically:
- Logs all requests and responses
- Shows detailed error information
- Displays performance metrics
- Provides debugging tools in console

### Correlation IDs

Every request gets a unique correlation ID that can be used to trace:
- Request through logs
- Error reporting
- Performance monitoring
- Distributed tracing

## 🚀 Best Practices

1. **Always use type parameters** for API calls
2. **Handle ApiError instances** specifically
3. **Use correlation IDs** for debugging
4. **Leverage React hooks** for component state
5. **Wrap components** with ApiErrorBoundary
6. **Use interceptors** for cross-cutting concerns
7. **Configure logging** appropriately for environment
8. **Monitor performance** using built-in metrics

## 📚 Examples

Check the `src/examples/ApiUsageExamples.tsx` file for comprehensive examples demonstrating all features of the enhanced API system.

## 🔄 Updates and Maintenance

The enhanced API system is designed to be:
- **Backward compatible** with existing code
- **Extensible** through interceptors and hooks
- **Maintainable** with clear separation of concerns
- **Testable** with built-in mocking capabilities

Regular updates should focus on:
- Adding new interceptors for common patterns
- Enhancing error handling for new error types
- Improving performance monitoring
- Adding new utility functions as needed
