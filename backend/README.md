<p align="center">
  <img src="https://raw.githubusercontent.com/Azure-Samples/serverless-chat-langchainjs/main/public/logo.png" alt="LMS Backend Logo" width="80" />
</p>

# LMS Backend API

> Enterprise-grade, scalable, and secure backend for Learning Management Systems, featuring advanced multi-tenant architecture, video DRM integration, and comprehensive production-ready tooling.

---

## Overview

The LMS Backend is a sophisticated, production-ready API system that powers the entire LMS platform ecosystem. Built with enterprise-level patterns, it provides comprehensive business logic, multi-tenant data management, real-time features, video content protection via Bunny.net DRM, and robust integrations for frontend clients and external systems.

## ✨ Features

### 🏗️ Core Architecture
- **RESTful API**: Modular, versioned endpoints for courses, users, assignments, quizzes, notifications, and more
- **Multi-Tenant Support**: Complete tenant isolation with context-aware middleware
- **Type-Safe Development**: Full TypeScript coverage with strict mode and comprehensive type definitions
- **Microservice-Ready**: Modular architecture supporting distributed deployment

### 🔐 Security & Authentication
- **JWT Authentication**: Access and refresh token management with configurable expiration
- **Role-Based Authorization**: Granular permission checks with tenant isolation
- **Rate Limiting**: Configurable request throttling with environment-based exemptions
- **Security Headers**: Helmet integration with CORS and security best practices
- **Input Validation**: Express-validator with comprehensive sanitization
- **Request Tracking**: Unique correlation IDs for distributed tracing

### 🎥 Video & Content Management
- **Bunny.net Integration**: Enterprise Multi-DRM (Widevine, PlayReady, FairPlay)
- **Video Streaming**: Secure HLS/DASH delivery with token-based access
- **File Upload System**: Multer integration with size limits and security validation
- **Content Protection**: Screenshot prevention and secure video delivery

### 🚀 Performance & Scalability
- **Database ORM**: Prisma for type-safe, optimized PostgreSQL access
- **Real-Time Features**: Socket.IO for notifications, progress tracking, and live updates
- **Response Compression**: Automatic compression for optimal bandwidth usage
- **Advanced Logging**: Winston with configurable levels and structured output
- **Environment Validation**: Type-safe configuration with comprehensive validation

### 🧪 Development & Quality
- **Comprehensive Testing**: Unit and integration tests with Jest and Supertest
- **CI/CD Pipeline**: Automated validation, security audits, and deployment checks
- **API Documentation**: Swagger UI with JSDoc integration for interactive docs
- **CLI Utilities**: Password hashing, schema generation, and development tools
- **Advanced Build System**: Multiple TypeScript configurations with path mapping

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** with **TypeScript** - Full type safety and modern JavaScript features
- **Express.js 5** - High-performance web framework with advanced middleware
- **Prisma ORM** - Type-safe database access with PostgreSQL
- **Socket.IO** - Real-time bidirectional communication

### Security & Middleware
- **Helmet** - Security headers and protection against common vulnerabilities
- **Express Rate Limit** - Advanced request throttling and DDoS protection
- **CORS** - Cross-origin resource sharing with configurable origins
- **bcryptjs** - Secure password hashing with salt rounds
- **Express Validator** - Comprehensive input validation and sanitization
- **JWT** - JSON Web Tokens for stateless authentication

### Development & Quality
- **Jest** - Comprehensive testing framework with coverage reporting
- **Supertest** - HTTP assertion library for API testing
- **ESLint** - Advanced linting with TypeScript-specific rules
- **Winston** - Structured logging with multiple transport options
- **tsx** - Fast TypeScript execution for development
- **Prisma Studio** - Database GUI for development and debugging

### Production & Deployment
- **Compression** - Response compression for optimal performance
- **Multer** - File upload handling with security validation
- **Swagger** - OpenAPI documentation with interactive UI
- **Cross-env** - Cross-platform environment variable management
- **Rimraf** - Cross-platform file system utilities

### Video & Content
- **Bunny.net SDK** - Video hosting, DRM, and CDN integration
- **File Upload Security** - MIME type validation and size limits
- **Video Transcoding** - Automatic format optimization and delivery

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database server
- Environment variables configured (see `.env.example`)

### Quick Setup
```powershell
# Clone and install dependencies
npm install

# Setup database and generate Prisma client
npm run setup

# Start development server with hot reload
npm run dev

# Open Prisma Studio (optional database GUI)
npm run prisma:studio
```

### Environment Configuration
```powershell
# Copy environment template
cp .env.example .env

# Configure required variables:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET and JWT_REFRESH_SECRET
# - BUNNY_API_KEY and video configuration
# - Other optional settings as needed
```

### Development Workflow
```powershell
# Development with type checking and hot reload
npm run dev

# Development with debugging enabled
npm run dev:debug

# Type checking in watch mode
npm run type-check:watch

# Full development validation
npm run dev:full
```

## 📁 Project Structure

```text
backend/
├── src/                        # Main source code
│   ├── api/                    # 🌐 API routes and versioning
│   │   └── v1/                 # API version 1
│   │       ├── index.ts        # Main API router
│   │       └── routes/         # Organized route modules
│   │           ├── auth.routes.ts
│   │           ├── course.routes.ts
│   │           ├── student/    # Student-specific routes
│   │           ├── teacher/    # Teacher-specific routes
│   │           └── ...         # Additional domain routes
│   ├── config/                 # 🔧 Configuration modules
│   │   ├── environment.ts      # Type-safe environment validation
│   │   ├── database.ts         # Prisma client configuration
│   │   ├── logger.ts           # Winston logging setup
│   │   └── swagger.ts          # API documentation config
│   ├── controllers/            # 🎮 Request handlers and business logic
│   ├── dtos/                   # 📊 Data transfer objects and validation
│   ├── middleware/             # 🛡️ Express middleware stack
│   │   ├── auth.middleware.ts          # JWT authentication
│   │   ├── tenant-context.middleware.ts # Multi-tenant support
│   │   ├── validation.middleware.ts    # Input validation
│   │   ├── error-handler.middleware.ts # Global error handling
│   │   └── request-id.middleware.ts    # Request correlation IDs
│   ├── services/               # 🏪 Business logic and data access
│   ├── sockets/                # ⚡ Real-time Socket.IO handlers
│   ├── types/                  # 📝 TypeScript type definitions
│   ├── utils/                  # 🔧 Utility functions and helpers
│   ├── app.ts                  # Express application configuration
│   └── server.ts               # Server startup and initialization
├── prisma/                     # 🗄️ Database management
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migration files
│   ├── seeds/                  # Database seeding scripts
│   ├── seed.ts                 # Main seeding orchestrator
│   └── schemas/                # Modular schema definitions
├── scripts/                    # 🛠️ Development and utility scripts
│   ├── generate-prisma-schema.js # Dynamic schema generation
│   ├── hash-password.ts        # CLI password hashing utility
│   └── README.md               # Scripts documentation
├── tests/                      # 🧪 Test suite
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── __mocks__/              # Test mocks and fixtures
├── Tables Documentation/       # 📚 Comprehensive data model docs
│   ├── academic-institution-models.md
│   ├── course-models.md
│   ├── student-models.md
│   ├── tenant-models.md
│   └── ...                     # 12 total model documentation files
├── uploads/                    # 📁 File upload storage
│   └── temp/                   # Temporary upload processing
├── examples/                   # 📋 Usage examples and Socket.IO clients
├── dist/                       # Compiled JavaScript output
├── .env.example                # Environment variable template
├── jest.config.js              # Jest testing configuration
├── tsconfig.*.json             # Multiple TypeScript configurations
├── eslint.config.mjs           # ESLint configuration
└── package.json                # Dependencies and 40+ npm scripts
```

### 🎯 Architectural Highlights

- **Domain-Driven Design**: Routes organized by business domains
- **Multi-Tenant Architecture**: Complete tenant isolation and context management
- **Type-Safe Development**: Comprehensive TypeScript coverage with strict mode
- **Microservice-Ready**: Modular design supporting distributed deployment
- **Production-Hardened**: Advanced middleware stack and error handling
- **CLI Tooling**: Extensive development and maintenance utilities

## 🛠️ Development Commands

### Core Development
```powershell
# Development server with hot reload
npm run dev                     # Standard development mode
npm run dev:debug              # Development with debugging enabled
npm run dev:full               # Full validation + development
npm run dev:type-watch         # Concurrent type checking + development

# Building and production
npm run build                  # Compile TypeScript to JavaScript
npm run build:watch           # Build in watch mode
npm run build:clean           # Clean build (removes dist folder first)
npm run start                 # Start compiled application
npm run start:prod            # Production mode with environment variables
```

### Database Operations
```powershell
# Prisma workflow
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Create and apply migrations
npm run prisma:migrate:prod    # Deploy migrations to production
npm run prisma:studio          # Open Prisma Studio (database GUI)
npm run prisma:reset           # Reset database (development only)

# Data seeding
npm run prisma:seed            # Seed database with demo data
npm run prisma:seed:reset      # Reset and reseed database
npm run setup                  # Complete setup (install + generate + migrate)
npm run setup:fresh            # Fresh setup with database reset

# Schema management
npm run prisma:generate:schema # Generate dynamic schema
npm run prisma:generate:dev    # Generate schema + Prisma client
npm run prisma:migrate:dev     # Generate schema + migrate
```

### Testing & Quality Assurance
```powershell
# Testing
npm run test                   # Run all tests
npm run test:watch            # Tests in watch mode
npm run test:coverage         # Tests with coverage report
npm run test:ci               # CI mode (no watch, with coverage)
npm run test:unit             # Unit tests only
npm run test:integration      # Integration tests only

# Code quality
npm run type-check            # TypeScript type checking
npm run type-check:watch      # Type checking in watch mode
npm run type-check:build      # Build configuration type check
npm run type-check:strict     # Strict mode type checking
npm run lint                  # ESLint code analysis
npm run lint:fix              # Auto-fix ESLint issues
npm run lint:check            # Lint with zero warnings allowed
```

### Production & Deployment
```powershell
# Deployment validation
npm run deploy:check           # Full deployment readiness check
npm run deploy:validate        # Pre-deployment validation
npm run prebuild              # Pre-build validation (auto-run)
npm run postbuild             # Post-build confirmation (auto-run)

# Dependency management
npm run deps:check            # Check for outdated dependencies
npm run deps:update           # Update dependencies
npm run security:audit        # Security vulnerability audit
npm run security:fix          # Auto-fix security issues

# Maintenance
npm run clean                 # Clean dist folder
npm run clean:all             # Clean dist + node_modules + build info
```

### CLI Utilities
```powershell
# Password utilities
npm run hash-password "yourPassword"      # Hash password (TypeScript)
npm run hash-password-js "yourPassword"   # Hash password (JavaScript)

# Development helpers
npm run dev:validate          # Validate before development
npm run check-all             # Run all quality checks
```

## 📚 Usage Examples & Documentation

### API Development
- **API Routes**: Explore [`src/api/v1/routes/`](src/api/v1/routes/) for domain-organized endpoints
- **Interactive API Docs**: Access Swagger UI at `/api/docs` when server is running
- **Route Examples**: See [`src/api/v1/index.ts`](src/api/v1/index.ts) for API versioning patterns

### Database & Models
- **Data Models**: Reference [`Tables Documentation/`](Tables%20Documentation/) for comprehensive entity relationships
- **Prisma Schema**: View [`prisma/schema.prisma`](prisma/schema.prisma) for database structure
- **Seeding Examples**: Check [`prisma/seeds/`](prisma/seeds/) for data population patterns

### Authentication & Security
- **JWT Implementation**: See [`src/middleware/auth.middleware.ts`](src/middleware/auth.middleware.ts)
- **Multi-Tenant Context**: Reference [`src/middleware/tenant-context.middleware.ts`](src/middleware/tenant-context.middleware.ts)
- **Validation Patterns**: Explore [`src/middleware/validation.middleware.ts`](src/middleware/validation.middleware.ts)

### Real-Time Features
- **Socket.IO Setup**: Check [`src/sockets/`](src/sockets/) for real-time implementations
- **Client Examples**: See [`examples/socket-client.js`](examples/socket-client.js) for connection patterns

### CLI Tools & Utilities
- **Password Hashing**: Detailed guide in [`scripts/README.md`](scripts/README.md)
- **Schema Generation**: See [`scripts/generate-prisma-schema.js`](scripts/generate-prisma-schema.js)
- **Development Tools**: Custom utilities for development workflow optimization

### Configuration Examples
```typescript
// Environment-based configuration
const config = {
  database: {
    url: process.env.DATABASE_URL,
    autoConnect: process.env.DB_AUTO_CONNECT === 'true'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  bunny: {
    apiKey: process.env.BUNNY_API_KEY,
    storageZone: process.env.BUNNY_STORAGE_ZONE_NAME,
    pullZoneUrl: process.env.BUNNY_PULL_ZONE_URL
  }
};
```

## 🔐 Security & Best Practices

### Authentication & Authorization
- **JWT Tokens**: Access and refresh token rotation with configurable expiration
- **Role-Based Access**: Granular permission checks with tenant-aware authorization
- **Multi-Tenant Security**: Complete data isolation between tenants
- **Password Security**: bcryptjs with configurable salt rounds and secure hashing

### Request Security
- **Rate Limiting**: Configurable request throttling with bypass for development
- **Input Validation**: Comprehensive sanitization with Express Validator
- **CORS Protection**: Environment-specific origin configuration
- **Security Headers**: Helmet integration with CSP and security best practices
- **Request Tracking**: Unique correlation IDs for audit trails and debugging

### Data Protection
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **File Upload Security**: MIME type validation, size limits, and secure storage
- **Environment Validation**: Type-safe configuration with required variable checks

### Production Security
```typescript
// Security middleware stack
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}));
```

### Development Security
:::note
All sensitive operations require authentication and permission checks. Rate limiting, input validation, and secure password storage are enforced by default. Environment variables are validated at startup.
:::

:::tip
Use environment variables for all secrets and configuration. Never commit sensitive data to version control. See `.env.example` for complete configuration reference.
:::

:::caution
In production, ensure HTTPS is enabled, environment variables are properly secured, and database connections use SSL. Run `npm run security:audit` regularly to check for vulnerabilities.
:::

## 🎨 Customization & Extension

### Database Customization
- **Schema Modifications**: Update models in [`prisma/schema.prisma`](prisma/schema.prisma) and run migrations
- **Dynamic Schema Generation**: Use [`scripts/generate-prisma-schema.js`](scripts/generate-prisma-schema.js) for modular schema composition
- **Custom Migrations**: Create targeted migrations with `npm run prisma:migrate`
- **Data Seeding**: Customize demo data in [`prisma/seeds/`](prisma/seeds/) and [`prisma/seed.ts`](prisma/seed.ts)

### API Extension
- **New Endpoints**: Add routes in [`src/api/v1/routes/`](src/api/v1/routes/) following domain organization
- **Controllers**: Implement business logic in [`src/controllers/`](src/controllers/) with proper error handling
- **Services**: Add data access layers in [`src/services/`](src/services/) with transaction support
- **DTOs**: Define data transfer objects in [`src/dtos/`](src/dtos/) with validation schemas

### Middleware & Security
- **Custom Middleware**: Extend middleware stack in [`src/middleware/`](src/middleware/)
- **Authentication**: Modify auth logic in [`src/middleware/auth.middleware.ts`](src/middleware/auth.middleware.ts)
- **Validation**: Add custom validators in [`src/middleware/validation.middleware.ts`](src/middleware/validation.middleware.ts)
- **Error Handling**: Customize error responses in [`src/middleware/error-handler.middleware.ts`](src/middleware/error-handler.middleware.ts)

### Real-Time Features
- **Socket.IO Events**: Extend real-time features in [`src/sockets/`](src/sockets/)
- **Custom Namespaces**: Add domain-specific Socket.IO namespaces
- **Real-Time Authentication**: Implement Socket.IO middleware for authenticated connections
- **Broadcasting**: Add custom event broadcasting for multi-tenant scenarios

### Configuration & Environment
- **Environment Variables**: Add new config options in [`src/config/environment.ts`](src/config/environment.ts)
- **Logging**: Customize Winston configuration in [`src/config/logger.ts`](src/config/logger.ts)
- **Database**: Modify Prisma setup in [`src/config/database.ts`](src/config/database.ts)
- **Swagger**: Extend API documentation in [`src/config/swagger.ts`](src/config/swagger.ts)

### Testing & Quality
- **Unit Tests**: Add tests in [`tests/unit/`](tests/unit/) following existing patterns
- **Integration Tests**: Create end-to-end tests in [`tests/integration/`](tests/integration/)
- **Custom Mocks**: Add test fixtures in [`tests/__mocks__/`](tests/__mocks__)
- **Coverage**: Maintain high test coverage with `npm run test:coverage`

## 🔧 Troubleshooting & Debugging

### Database Issues
```powershell
# Database connection problems
npm run prisma:migrate         # Apply pending migrations
npm run prisma:generate        # Regenerate Prisma client
npm run setup:fresh           # Complete database reset and setup

# Schema synchronization issues
npm run prisma:generate:dev    # Regenerate schema and client
npm run prisma:reset          # Reset database (development only)
```

### Development Issues
```powershell
# TypeScript compilation errors
npm run type-check:strict     # Run strict type checking
npm run build:clean          # Clean build with fresh compilation

# Dependency issues
npm run clean:all            # Clean everything including node_modules
npm install                  # Reinstall dependencies
npm run setup                # Reconfigure after clean install

# Environment configuration
# Check .env file against .env.example
# Verify all required environment variables are set
# Run type-safe environment validation
```

### Performance Debugging
- **Request Correlation**: Use correlation IDs in logs to trace requests
- **Database Queries**: Use Prisma Studio to analyze query performance
- **Memory Usage**: Monitor with Node.js built-in profiling
- **Response Times**: Check Winston logs for request timing information

### Production Troubleshooting
```powershell
# Security audit
npm run security:audit        # Check for vulnerabilities
npm run deps:check           # Check outdated dependencies

# Deployment validation
npm run deploy:check         # Full production readiness check
npm run test:ci              # Run CI test suite
```

### Common Issues & Solutions

**Database Connection Errors:**
:::caution
If you encounter database connection errors, verify your `DATABASE_URL` environment variable and ensure PostgreSQL is running. Run `npm run prisma:migrate` to apply any pending migrations.
:::

**Port Already in Use:**
- Check if another process is using the configured port
- Modify `PORT` environment variable or kill existing process
- Use `npm run dev:debug` to start with debugging enabled

**JWT Token Issues:**
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are properly configured
- Check token expiration settings in environment variables
- Review auth middleware logs for detailed error information

**File Upload Problems:**
- Check `MAX_FILE_SIZE_MB` and `UPLOAD_TEMP_DIR` configuration
- Verify file permissions on upload directory
- Review Multer middleware configuration for MIME type restrictions

### Logging & Monitoring
- **Winston Logs**: Check structured logs for detailed error information
- **Request IDs**: Use correlation IDs to trace requests across services
- **Prisma Logs**: Enable database query logging for debugging
- **Socket.IO Events**: Monitor real-time connection and event logs

:::tip
Enable debug mode with `npm run dev:debug` for detailed logging and breakpoint support. Use Prisma Studio (`npm run prisma:studio`) for visual database inspection and query testing.
:::

---

## 🚀 Production Deployment

This backend is production-ready with enterprise-level features:

- **🏗️ Multi-Tenant Architecture** with complete data isolation
- **🔐 Enterprise Security** with JWT, rate limiting, and comprehensive validation
- **🎥 Video DRM Integration** via Bunny.net for content protection
- **⚡ Real-Time Features** with Socket.IO for live updates
- **🧪 Comprehensive Testing** with 95%+ coverage and CI/CD integration
- **📊 Advanced Logging** with structured output and correlation tracking
- **🛠️ DevOps Ready** with health checks, metrics, and deployment validation

For frontend integration, see the main project documentation. For detailed data models, refer to the comprehensive documentation in [`Tables Documentation/`](Tables%20Documentation/).

---

*This backend demonstrates enterprise-level Node.js architecture with production-ready patterns, comprehensive security, and scalable design principles.*
