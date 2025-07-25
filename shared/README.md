# LMS Shared Types & Constraints

> Enterprise-grade, centralized TypeScript type system providing comprehensive domain modeling, advanced constraint validation, and production-ready patterns for distributed LMS architecture.

---

## Overview

The `shared` workspace is a sophisticated, enterprise-level type system that serves as the foundation for type safety across the entire LMS platform ecosystem. It provides comprehensive domain modeling, advanced constraint validation, video streaming integration, and production-ready patterns used by backend APIs, frontend applications, and all platform services.

## ✨ Features

### 🏗️ Enterprise Type System
- **Comprehensive Domain Coverage**: 17+ specialized type files covering all business domains
- **API Standardization**: Unified response structures with correlation IDs and pagination
- **Multi-Tenant Support**: Complete tenant isolation and context-aware type definitions
- **Production-Ready Patterns**: Audit fields, logging types, and validation structures

### 🔐 Advanced Constraint System
- **Database Constraints**: Type-safe validation rules, foreign keys, and performance indexes
- **Check Constraints**: Domain-specific validation rules across 7+ entity categories
- **Enum Constraints**: Comprehensive enumeration validations for data integrity
- **Unique Constraints**: Uniqueness validations with composite key support
- **Performance Optimization**: Database index definitions for optimal query performance

### 🎥 Video Streaming Integration
- **Bunny.net Types**: 573+ lines of comprehensive video platform integration
- **DRM Support**: Enterprise Multi-DRM type definitions (Widevine, PlayReady, FairPlay)
- **Video Processing**: Complete workflow types for upload, processing, and delivery
- **Analytics Integration**: Video performance and engagement tracking types

### 🚀 Development Excellence
- **Type-Only Build**: Optimized for type sharing with declaration-only compilation
- **Project References**: Advanced TypeScript configuration with incremental builds
- **Barrel Exports**: Organized exports for clean import patterns
- **Extensible Architecture**: Modular design supporting rapid platform evolution

## 🛠️ Tech Stack

### Core Technologies
- **TypeScript 5+** - Advanced type system with strict mode and comprehensive coverage
- **Project References** - Incremental builds and optimized type sharing
- **TSLib** - Runtime library for TypeScript helper functions

### Build & Configuration
- **Composite Projects** - Enables cross-project type references and incremental compilation
- **Declaration-Only Build** - Optimized output for type sharing without JavaScript emission
- **Source Maps** - Declaration source maps for enhanced debugging and IDE navigation
- **Modular Architecture** - Organized barrel exports for clean dependency management

### Advanced TypeScript Features
- **Strict Type Checking** - Maximum type safety with comprehensive validation
- **Template Literal Types** - Advanced string manipulation and validation
- **Conditional Types** - Dynamic type generation based on input types
- **Utility Types** - Comprehensive type transformation utilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ with npm
- TypeScript 5+ for development
- Understanding of advanced TypeScript patterns

### Quick Setup
```powershell
# Install dependencies
npm install

# Build type declarations
npx tsc

# Verify build output
ls ../dist/shared
```

### Integration with Projects
```typescript
// In your project's tsconfig.json
{
  "references": [
    { "path": "../shared" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}

// Import shared types
import { TApiSuccessResponse, CourseEntity, TenantConstraints } from '@shared/types';
```

## 📁 Project Structure

```text
shared/
├── types/                          # 🏷️ Comprehensive TypeScript type definitions
│   ├── index.ts                    # Barrel export for all type definitions
│   ├── api.types.ts               # Standardized API response/request structures
│   ├── base.types.ts              # Foundation types and audit fields
│   ├── validation.types.ts        # Input validation and sanitization types
│   ├── logger.types.ts            # Structured logging and monitoring types
│   ├── file.types.ts              # File upload and management types
│   │
│   ├── bunny.types.ts             # 🎥 Video streaming integration (573+ lines)
│   │                              # • DRM configuration and video processing
│   │                              # • Quality settings and analytics
│   │                              # • Webhook and streaming types
│   │
│   ├── Domain-Specific Types:     # 📚 Business domain modeling
│   ├── tenant.types.ts            # Multi-tenant architecture types
│   ├── system-users.types.ts      # System user and authentication types
│   ├── student.types.ts           # Student profile and enrollment types
│   ├── teacher.types.ts           # Teacher profile and assignment types
│   ├── course.types.ts            # Course structure and content types
│   ├── course-session.types.ts    # Session scheduling and attendance
│   ├── quiz.types.ts              # Assessment and quiz types
│   ├── assignment.types.ts        # Assignment submission and grading
│   ├── notification.types.ts      # Real-time notification system
│   └── analytics.types.ts         # Performance tracking and reporting
│
├── constraints/                    # 🔒 Advanced database constraint system
│   ├── index.ts                   # Constraint system barrel exports
│   ├── base-constraint.types.ts   # Foundation constraint interfaces
│   │
│   ├── check-constraints/         # ✅ Domain validation rules
│   │   ├── index.ts               # Check constraint exports
│   │   ├── core-entities-checks.types.ts      # Core entity validations
│   │   ├── user-entities-checks.types.ts      # User validation rules
│   │   ├── course-entities-checks.types.ts    # Course validation rules
│   │   ├── assessment-entities-checks.types.ts # Assessment validations
│   │   ├── analytics-entities-checks.types.ts # Analytics validations
│   │   ├── notification-entities-checks.types.ts # Notification rules
│   │   └── course-session-entities-checks.types.ts # Session validations
│   │
│   ├── foreign-key-constraints/   # 🔗 Referential integrity definitions
│   ├── unique-constraints/        # 🎯 Uniqueness validation rules
│   ├── enum-constraints/          # 📋 Enumeration validation types
│   └── performance-indexes/       # ⚡ Database optimization indexes
│
├── entity-relationships/          # 🌐 Enterprise entity modeling
│   ├── index.ts                   # Entity relationship exports
│   ├── core-entities.types.ts     # Foundation entity relationships
│   ├── user-entities.types.ts     # User domain entity mappings
│   ├── course-entities.types.ts   # Course structure relationships
│   ├── course-session-entities.types.ts # Session entity mappings
│   ├── assessment-entities.types.ts # Quiz and assignment relationships
│   ├── notification-entities.types.ts # Notification system entities
│   └── analytics-entities.types.ts # Analytics and reporting entities
│
├── utils/                         # 🛠️ Shared utility types and functions
│   ├── index.ts                   # Utility exports
│   ├── constants.ts               # Platform-wide constants
│   ├── duration.utils.ts          # Time and duration utilities
│   └── ui.utils.ts                # UI component helper types
│
├── tsconfig.json                  # 🔧 Advanced TypeScript configuration
│                                  # • Composite project setup
│                                  # • Declaration-only build
│                                  # • Project references enabled
└── package.json                   # 📦 Minimal dependencies for type-only project
```

### 🎯 Architecture Highlights

- **Enterprise Domain Modeling**: Complete business domain coverage with 17+ type files
- **Advanced Constraint System**: Database-level validation with performance optimization
- **Video Streaming Integration**: Comprehensive Bunny.net DRM and analytics support
- **Multi-Tenant Architecture**: Complete tenant isolation and context-aware types
- **Production-Ready Patterns**: Audit trails, logging, validation, and error handling
- **Modular Design**: Organized for maintainability and rapid platform evolution

## 📚 Usage Examples & Patterns

### API Response Standardization
```typescript
import { TApiSuccessResponse, TApiErrorResponse } from '@shared/types';

// Standardized success response with pagination
const courseListResponse: TApiSuccessResponse<Course[]> = {
  success: true,
  statusCode: 200,
  message: 'Courses retrieved successfully',
  data: courses,
  timestamp: new Date().toISOString(),
  correlationId: 'req-12345',
  pagination: {
    page: 1,
    limit: 10,
    total: 150,
    totalPages: 15,
    hasNext: true,
    hasPrev: false
  }
};

// Standardized error response with validation details
const validationErrorResponse: TApiErrorResponse = {
  success: false,
  statusCode: 400,
  message: 'Validation failed',
  errorCode: 'VALIDATION_ERROR',
  details: {
    email: ['Email format is invalid'],
    password: ['Password must be at least 8 characters']
  },
  timestamp: new Date().toISOString(),
  correlationId: 'req-12345',
  path: '/api/v1/auth/register'
};
```

### Multi-Tenant Entity Usage
```typescript
import { TenantEntity, StudentEntity, CourseEntity } from '@shared/types';

// Multi-tenant aware entity with audit fields
const studentWithTenant: StudentEntity = {
  id: 'student-123',
  tenantId: 'tenant-abc',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  // Audit fields automatically included
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'admin-456',
  updatedBy: 'admin-456'
};
```

### Video Streaming Integration
```typescript
import { BunnyVideoEntity, BunnyVideoStatus, BunnyDRMConfiguration } from '@shared/types';

// Comprehensive video management with DRM
const videoLecture: BunnyVideoEntity = {
  id: 'video-789',
  title: 'Introduction to TypeScript',
  status: BunnyVideoStatus.FINISHED,
  duration: 1800, // 30 minutes
  qualities: ['P720', 'P480', 'P360'],
  drmConfiguration: {
    enabled: true,
    widevineEnabled: true,
    playreadyEnabled: true,
    fairplayEnabled: true
  },
  analytics: {
    views: 1250,
    totalWatchTime: 2250000, // milliseconds
    averageWatchTime: 1800000,
    completionRate: 0.85
  }
};
```

### Advanced Constraint Usage
```typescript
import { CourseConstraints, StudentConstraints } from '@shared/constraints';

// Type-safe constraint validation
const validateCourseData = (course: Partial<CourseEntity>): boolean => {
  // Constraints provide compile-time and runtime validation
  return CourseConstraints.title.minLength <= (course.title?.length || 0) &&
         CourseConstraints.title.maxLength >= (course.title?.length || 0);
};
```

### Entity Relationship Patterns
```typescript
import { CourseWithRelations, StudentWithEnrollments } from '@shared/entity-relationships';

// Complete entity with all relationships
const courseWithDetails: CourseWithRelations = {
  id: 'course-456',
  title: 'Advanced React Patterns',
  // Course basic fields...
  modules: [/* CourseModule entities */],
  enrollments: [/* StudentEnrollment entities */],
  sessions: [/* CourseSession entities */],
  assignments: [/* Assignment entities */],
  quizzes: [/* Quiz entities */],
  teacher: {/* Teacher entity */},
  analytics: {/* CourseAnalytics */}
};
```

## 🔧 Development Workflow

### Type Development & Validation
```bash
# Build and validate all types
npm run build

# Development with watch mode
npm run dev

# Type validation across projects
npm run type-check

# Generate updated type documentation
npm run docs
```

### Integration Patterns
```typescript
// Frontend Integration (React)
import { CourseEntity, ApiClient } from '@shared/types';

const useCourses = () => {
  const [courses, setCourses] = useState<CourseEntity[]>([]);
  
  useEffect(() => {
    ApiClient.get<CourseEntity[]>('/api/courses')
      .then(response => setCourses(response.data));
  }, []);
};

// Backend Integration (Express)
import { TApiSuccessResponse, CourseEntity } from '@shared/types';

app.get('/api/courses', async (req, res) => {
  const courses = await courseService.getAllCourses();
  const response: TApiSuccessResponse<CourseEntity[]> = {
    success: true,
    statusCode: 200,
    data: courses,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});
```

### TypeScript Project References Setup
The shared types utilize TypeScript project references for optimal build performance:

```json
// tsconfig.json configuration
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "incremental": true
  },
  "references": [
    { "path": "../frontend" },
    { "path": "../backend" },
    { "path": "../student-frontend" }
  ]
}
```

## 🌟 Advanced Configuration & Best Practices

### 1. Type Safety Across Boundaries
- **API Contracts**: Use shared types for request/response validation
- **Database Entities**: Maintain single source of truth for data models
- **Event Handling**: Type-safe event definitions for real-time features

### 2. Constraint-Driven Development
- **Database Constraints**: Leverage constraint types for validation
- **Business Rules**: Encode business logic in type definitions
- **Performance**: Use indexes and constraints for query optimization

### 3. Multi-Tenant Considerations
- **Context Isolation**: Always include `tenantId` in entity operations
- **Access Control**: Use tenant-aware types for security
- **Data Segregation**: Ensure tenant boundaries in all operations

### 4. Video Platform Integration
- **DRM Compliance**: Follow Bunny.net DRM patterns for content protection
- **Analytics Tracking**: Implement comprehensive video analytics
- **Quality Management**: Support adaptive streaming across devices

### Custom Type Extensions
```typescript
// Extend base types for specific use cases
interface CustomCourseEntity extends CourseEntity {
  institutionSpecificField?: string;
  customMetadata?: Record<string, any>;
}
```

### Runtime Validation
```typescript
import { z } from 'zod';
import { CourseEntity } from '@shared/types';

// Generate Zod schemas from TypeScript types
const CourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  // ... other fields
});

export const validateCourse = (data: unknown): CourseEntity => {
  return CourseSchema.parse(data);
};
```

## 📈 Performance Considerations

- **Incremental Builds**: TypeScript project references enable fast rebuilds
- **Tree Shaking**: Modular exports support optimal bundling
- **Type-Only Imports**: Use `import type` for zero-runtime overhead
- **Constraint Indexing**: Database constraints include performance indexes

## 🔮 Future Enhancements

- **GraphQL Schema Generation**: Auto-generate GraphQL types from TypeScript
- **API Documentation**: Generate OpenAPI specs from shared types
- **Runtime Validation**: Enhanced Zod integration for request validation
- **Event Sourcing**: Event-driven architecture type definitions

## Usage Examples

- **API Types**: Import from [`types/api.types.ts`](types/api.types.ts) for standardized API contracts.
- **Constraints**: Use constraint types from [`constraints/`](constraints/) for validation and schema generation.
- **Entity Models**: Reference entity relationships in [`entity-relationships/`](entity-relationships/) for consistent data modeling.

## Best Practices

:::note
Always use shared types and constraints in backend and frontend code to avoid duplication and ensure data consistency.
:::

:::tip
Update shared types first when evolving data models, then propagate changes to dependent services.
:::

## Customization

- **Add new types**: Place in `types/` and export from `index.ts`.
- **Extend constraints**: Add to `constraints/` and update relevant entity models.
- **Modify relationships**: Update files in `entity-relationships/` as needed.

---

For platform integration, see the main project documentation. For data model details, refer to the tables documentation in the repository.
