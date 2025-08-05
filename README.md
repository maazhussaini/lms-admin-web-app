# Learning Management System (LMS)

> Enterprise-grade, production-ready learning platform with advanced video DRM, multi-tenant architecture, and comprehensive type safety.

The Learning Management System (LMS) is an enterprise-grade, scalable platform designed to revolutionize the delivery of educational content with production-level security and performance. Built with sophisticated multi-tenant architecture, advanced video protection via Bunny.net DRM integration, and comprehensive type-safe development patterns, this LMS empowers educational institutions to deliver secure, engaging, and scalable learning experiences across web and mobile platforms.

## ✨ Features

The LMS is broadly divided into an Admin/Instructor Panel for management and a Student Platform for learning and engagement.

### 🔑 Core & Differentiating Features

- **Enterprise Video Protection**:
  - Enterprise Multi-DRM (Widevine, PlayReady, FairPlay) via Bunny.net integration
  - Advanced token-based access with correlation ID tracking
  - Screenshot and screen recording prevention on supported platforms
  - Comprehensive video analytics and performance monitoring
- **Production-Ready Architecture**:
  - Multi-tenant architecture with complete tenant isolation
  - Advanced API system with interceptors, caching, and error boundaries
  - Enterprise-level type system with 17+ domain-specific type files
  - Comprehensive constraint validation and performance optimization
- **Cross-Platform Excellence**: Unified experience across web (Admin & Student) and native mobile apps (Android & iOS for Students)
- **Developer Experience**: Type-safe development with correlation IDs, structured logging, and comprehensive tooling

### 🧑‍🏫 Admin/Instructor Panel (Web)

The Web Admin Panel provides administrators and instructors with comprehensive tools to manage the educational ecosystem.

1.  **User Management**:
    - CRUD operations for user accounts (students, instructors).
    - Assign roles and permissions.
    - View and edit student profiles.
    - Manage student enrollments in courses.
2.  **Course Management**:
    - CRUD operations for courses.
    - Course categorization and organization (modules, chapters).
    - Manage course materials (upload, edit, delete documents, presentations, etc.).
    - Schedule live video lectures.
3.  **Content Management**:
    - Upload and manage lectures (video, audio, text).
    - Create and manage quizzes, exams, and assignments.
    - Organize course content structure.
4.  **Analytics and Reporting**:
    - View course analytics (enrollment numbers, completion rates).
    - Track student performance metrics.
    - Generate custom reports and export them (CSV, PDF).
    - Dashboard with key performance indicators.
5.  **Notifications and Announcements**:
    - Create and send announcements to students or specific groups.
    - Schedule announcements for future delivery.
    - Manage notification preferences and view history.
6.  **Assessment and Evaluation**:
    - Grade assignments, quizzes, and exams.
    - Provide detailed feedback on student submissions.
    - Track student progress and overall performance.
7.  **Support and Help**:
    - Access to a help center and FAQs.
    - Interface for contacting technical support and managing support tickets.
8.  **Feedback and Surveys**:
    - Create and distribute surveys to collect student feedback.
    - Analyze survey results to improve course content and delivery.
    - Respond to feedback.
9.  **Calendar Management**:
    - Schedule live lectures, exams, and other important events.
    - Option to sync with personal calendars.
    - Set reminders for key dates and view an academic calendar.

### 🎓 Student Platform (Web, Android, iOS)

The Student Platform provides an engaging and interactive learning environment accessible via web browsers and native mobile applications.

1.  **User Authentication**:
    - No sign-up by students and teacher only admin can create their accounts.
    - Secure login, and password recovery.
2.  **User Profile**:
    - View and edit personal profile information.
    - Change password and manage account settings.
    - Upload a profile picture.
3.  **Course Content Access**:
    - View lectures (video, audio, text) with secure playback.
    - Cannot download lectures and course materials for offline access.
    - Participate in quizzes and exams.
    - Submit assignments through the platform.
4.  **Progress Tracking**:
    - View individual course progress and completion status.
    - Track scores for quizzes and exams.
    - View grades and feedback for assignments.
5.  **Notifications**:
    - Receive real-time push notifications (on mobile) and web notifications for course updates, assignment deadlines, quiz reminders, and instructor announcements.
6.  **Course Catalog & Enrollment**:
    - Browse the enrolled course catalog only.
    - Search and filter courses (by category, difficulty, instructor, etc.).
    - View detailed course descriptions.
7.  **Support and Help**:
    - Access to a help center and FAQs.
    - Option to contact support.
8.  **Feedback and Ratings**:
    - Rate courses and provide feedback on lectures.
    - Review instructors and course content.

## 🛠️ Tech Stack

- **Backend** ([Enterprise Documentation](backend/README.md)):

  - **Core**: TypeScript, Node.js, Express.js 5 with advanced middleware stack
  - **Database**: PostgreSQL with Prisma ORM and sophisticated constraint system
  - **Architecture**: Multi-tenant with complete isolation and context-aware operations
  - **Security**: JWT auth, rate limiting, security headers, and DRM integration
  - **Real-time**: Socket.IO for notifications and live updates
  - **Testing**: Comprehensive Jest and Supertest coverage with 40+ npm scripts
  - **Video Integration**: Bunny.net DRM, transcoding, and secure delivery

- **Student Frontend** ([Enhanced API Documentation](student-frontend/src/api/README.md)):

  - **Framework**: React 19 with TypeScript and modern development patterns
  - **Styling**: TailwindCSS 4 with responsive design and dark mode
  - **Build**: Vite with optimized production builds and hot reload
  - **State**: TanStack React Query with intelligent caching
  - **UI/UX**: Framer Motion animations and React Icons
  - **API System**: Enterprise-grade client with interceptors, correlation IDs, caching, and error boundaries

- **Shared Type System** ([Comprehensive Documentation](shared/README.md)):

  - **Domain Modeling**: 17+ specialized type files covering all business domains
  - **Constraint System**: Advanced database validation with performance optimization
  - **Video Integration**: 573+ lines of Bunny.net DRM and streaming types
  - **Multi-Tenant**: Complete tenant isolation and context-aware type definitions
  - **Enterprise Patterns**: Audit trails, logging types, and production-ready validation

- **Mobile Applications** (Future):
  - Android: Kotlin (Native) with enterprise security patterns - Planned
  - iOS: Swift (Native) with DRM compliance - Planned

## 📁 Folder Structure Overview

The project follows industry-standard organizational patterns with clear separation of concerns:

```
lms-admin-web-app/
├── backend/                     # Node.js, Express, TypeScript, Prisma, Socket.IO
│   ├── src/                     # Backend source code
│   │   ├── api/                 # API routes (v1)
│   │   ├── controllers/         # Request handlers and route logic
│   │   ├── dtos/                # Data transfer objects
│   │   ├── services/            # Business logic and data access services
│   │   ├── middleware/          # Custom middleware (auth, validation, etc.)
│   │   ├── types/               # Backend-specific type definitions
│   │   ├── utils/               # Utility functions and helpers
│   │   ├── config/              # Configuration files and environment setup
│   │   ├── sockets/             # Socket.IO event handlers
│   │   ├── app.ts               # Express application setup
│   │   └── server.ts            # Backend server entry point
│   ├── prisma/                  # Prisma ORM configuration
│   │   ├── schema.prisma        # Database schema definition
│   │   ├── migrations/          # Database migration scripts
│   │   ├── seeds/               # Database seeding scripts
│   │   └── seed.ts              # Main seed file
│   ├── scripts/                 # CLI utilities (e.g., password hashing)
│   ├── tests/                   # Unit and integration tests
│   │   ├── unit/                # Unit tests
│   │   └── integration/         # Integration tests
│   ├── Tables Documentation/    # Data model documentation
│   ├── uploads/                 # File uploads storage
│   ├── package.json
│   ├── tsconfig.json            # TypeScript configuration
│   ├── jest.config.js           # Testing configuration
│   └── .env.example             # Environment variables template
│
├── student-frontend/            # React Student Portal with Vite
│   ├── src/                     # Frontend source code
│   │   ├── api/                 # Enhanced API client system
│   │   │   ├── client.ts        # Original API client (enhanced)
│   │   │   ├── client-with-meta.ts  # Enhanced client with metadata
│   │   │   ├── response-utils.ts    # Type-safe response handling
│   │   │   ├── interceptors.ts      # Request/response interceptors
│   │   │   └── logger.ts            # API logging utilities
│   │   ├── components/          # React components
│   │   │   └── APIErrorBoundary/    # Error boundary for API errors
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useApi.ts        # API operation hooks
│   │   │   └── useErrorBoundary.ts  # Error boundary hook
│   │   ├── pages/               # Page components
│   │   ├── assets/              # Static assets (images, fonts, styles)
│   │   └── main.tsx             # React application entry point
│   ├── public/                  # Public static files
│   ├── package.json
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vite.config.ts           # Vite build configuration
│   ├── tailwind.config.ts       # TailwindCSS configuration
│   └── eslint.config.js         # ESLint configuration
│
├── shared/                      # Shared code for type consistency
│   ├── types/                   # Domain type definitions
│   │   ├── index.ts             # Barrel file for all exports
│   │   ├── base.types.ts        # Base audit and common types
│   │   ├── api.types.ts         # API request/response types
│   │   ├── tenant.types.ts      # Tenant and client entity types
│   │   ├── user.types.ts        # User and authentication types
│   │   ├── course.types.ts      # Course and content types
│   │   └── assessment.types.ts  # Quiz and assignment types
│   ├── constraints/             # Database constraint definitions
│   │   ├── index.ts             # Constraint barrel file
│   │   ├── base-constraint.types.ts     # Base constraint interfaces
│   │   ├── check-constraints/           # Data validation constraints
│   │   ├── foreign-key-constraints/     # Referential integrity
│   │   ├── unique-constraints/          # Uniqueness constraints
│   │   ├── enum-constraints/            # Enumeration validations
│   │   └── performance-indexes/         # Database optimization
│   ├── entity-relationships/    # Entity relationship mappings
│   ├── constants/               # Shared application constants
│   ├── enums/                   # Shared enumeration definitions
│   └── utils/                   # Shared utility functions
│
├── documentation/               # Comprehensive project documentation
│   ├── api-designs/             # API design specifications
│   ├── api-conversion/          # API conversion documentation
│   ├── architectural-improvements/ # Architecture enhancement docs
│   ├── postman-collections/     # API testing collections
│   ├── ui-ux design documents/  # Design specifications
│   └── extras/                  # Additional documentation
│
├── .gitignore
├── llms.txt                     # LLM context file
└── README.md                    # This file
```

This structure promotes:

- **Enterprise Architecture**: Multi-tenant isolation, advanced security, and production-ready patterns
- **Type Safety**: Comprehensive type system with 17+ domain-specific files and advanced constraints
- **Scalability**: Microservice-ready modular architecture with sophisticated build system
- **Developer Experience**: Enhanced API system with interceptors, correlation IDs, and comprehensive tooling
- **Production Readiness**: 40+ npm scripts, comprehensive testing, and enterprise-level logging
- **Video Security**: Advanced DRM integration with Bunny.net and comprehensive video management

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL database

### Quick Start

```powershell
# Clone the repository
git clone <repository-url>
cd lms-admin-web-app

# --- Backend Setup ---
cd backend
npm install
# Setup database & generate Prisma client
npm run setup
cd ..

# --- Student Frontend Setup ---
cd student-frontend
npm install
cd ..

# --- Shared Types Setup ---
cd shared
npm install
npx tsc  # Build type declarations
cd ..
```

### Database Setup

The backend uses PostgreSQL with Prisma ORM. Make sure you have PostgreSQL running and create a `.env` file in the backend directory based on `.env.example`.

```powershell
cd backend
# Copy environment template
cp .env.example .env
# Edit .env with your database credentials
# Then run setup
npm run setup
```

## ⚙️ Usage

### Starting Development Servers

**Backend Server:**

```powershell
cd backend
npm run dev
```

The backend server will run on `http://localhost:3000` (or configured port).

**Student Frontend (React + Vite):**

```powershell
cd student-frontend
npm run dev
```

The student portal will run on `http://localhost:5173` (default Vite port).

**Running Both Simultaneously:**
You can open multiple terminals to run both services:

1. **Terminal 1:** `cd backend; npm run dev` (Backend server)
2. **Terminal 2:** `cd student-frontend; npm run dev` (Frontend server)

### Backend Development Commands

```powershell
cd backend

# Development
npm run dev                    # Start development server with hot reload
npm run dev:debug             # Start with debugging enabled

# Database operations
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run database migrations
npm run prisma:studio         # Open Prisma Studio (DB GUI)
npm run prisma:seed           # Seed database with demo data
npm run prisma:seed:reset     # Reset and reseed database

# Testing
npm run test                  # Run all tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage report
npm run test:unit            # Run only unit tests
npm run test:integration     # Run only integration tests

# Building and validation
npm run build                # Build for production
npm run type-check           # Check TypeScript types
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint issues automatically
```

### Frontend Development Commands

```powershell
cd student-frontend

# Development
npm run dev                  # Start development server
npm run preview              # Preview production build

# Building and validation
npm run build                # Build for production
npm run type-check           # Check TypeScript types
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint issues automatically
```

### API System Features

The student frontend includes an enterprise-grade API system ([Full Documentation](student-frontend/src/api/README.md)) featuring:

- **Enterprise-Level Architecture**: Type-safe clients with metadata access and correlation ID tracking
- **Advanced Interceptors**: Request/response middleware for cross-cutting concerns and performance monitoring
- **Intelligent Error Handling**: Custom error types with validation details and automatic retry logic
- **Performance Optimization**: Response caching with configurable TTL and request timing analytics
- **Developer Experience**: React hooks for common operations and comprehensive error boundaries
- **Production Monitoring**: Built-in logging, performance metrics, and distributed tracing support

See the [Enhanced API System Documentation](student-frontend/src/api/README.md) for comprehensive usage examples and patterns.

### Building for Production

**Backend:**

```powershell
cd backend
npm run build                # Build TypeScript to JavaScript
npm run start:prod          # Start production server
```

**Student Frontend:**

```powershell
cd student-frontend
npm run build               # Build React app for production
npm run preview             # Preview production build locally
```

### Testing

**Backend Testing:**

```powershell
cd backend
npm run test                # Run all tests
npm run test:ci             # Run tests in CI mode with coverage
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only
```

**Frontend Testing:**

```powershell
cd student-frontend
npm run lint                # Run ESLint checks
npm run type-check          # TypeScript type checking
```

### Key Features

#### Enterprise API System ([Full Documentation](student-frontend/src/api/README.md))

- **Advanced Architecture**: Type-safe operations with metadata access and correlation ID tracking
- **Production Monitoring**: Built-in performance metrics, timing analytics, and distributed tracing
- **Intelligent Caching**: Automatic response caching with configurable TTL and cache management
- **Error Boundaries**: Graceful error handling in React components with retry mechanisms
- **Interceptor System**: Comprehensive request/response middleware for cross-cutting concerns

#### Enterprise Backend ([Full Documentation](backend/README.md))

- **Multi-Tenant Architecture**: Complete tenant isolation with context-aware middleware and operations
- **Advanced Security**: JWT authentication, rate limiting, security headers, and comprehensive validation
- **Video DRM Integration**: Bunny.net enterprise Multi-DRM with secure streaming and analytics
- **Production Tooling**: 40+ npm scripts covering development, testing, deployment, and maintenance
- **Real-Time Features**: Socket.IO for notifications, progress tracking, and live collaborative features
- **Comprehensive Testing**: Unit and integration tests with Jest, Supertest, and coverage reporting

#### Enterprise Type System ([Full Documentation](shared/README.md))

- **Domain Modeling**: 17+ specialized type files covering all business domains with comprehensive coverage
- **Advanced Constraints**: Database-level validation rules, foreign keys, and performance optimization indexes
- **Video Integration**: 573+ lines of Bunny.net DRM, streaming, and analytics type definitions
- **Multi-Tenant Support**: Complete tenant isolation types and context-aware entity definitions
- **Production Patterns**: Audit trails, structured logging, validation, and error handling type systems

## 📚 Documentation

The project includes comprehensive documentation in the `documentation/` folder:

- **API Designs**: Complete API specifications and endpoint documentation
- **API Conversion**: Migration guides and conversion documentation
- **Architectural Improvements**: System architecture and enhancement proposals
- **Postman Collections**: Ready-to-use API testing collections
- **UI/UX Design Documents**: Design specifications and user experience guidelines

### Additional Documentation

- **Backend**: See [Backend Documentation](backend/README.md) for enterprise-level architecture, 40+ npm scripts, and comprehensive feature documentation
- **Student Frontend API**: See [Enhanced API System Documentation](student-frontend/src/api/README.md) for advanced interceptors, caching, and production patterns
- **Shared Types**: See [Enterprise Type System Documentation](shared/README.md) for comprehensive domain modeling, constraint system, and video integration types
- **Tables Documentation**: See `backend/Tables Documentation/` for detailed data model specifications and relationship mappings

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the project's coding standards:
   - **Backend**: Use ESLint and TypeScript strict mode
   - **Frontend**: Follow React best practices and ESLint rules
   - **Shared**: Maintain type safety and consistency
4. Write tests for new features
5. Ensure all tests pass (`npm run test` in respective directories)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- **Monorepo Structure**: Use appropriate navigation commands for Windows PowerShell
- **Type Safety**: Always use shared types from the `shared/` directory
- **API Design**: Follow the enhanced API system patterns
- **Database Changes**: Update Prisma schema and run migrations
- **Documentation**: Update relevant README files and documentation

## � Troubleshooting

### Common Issues

**Backend Database Issues:**

```powershell
cd backend
# Reset database if needed
npm run prisma:reset
# Regenerate Prisma client
npm run prisma:generate
```

**Frontend API Issues:**

- Check if backend server is running on correct port
- Verify API endpoints match backend routes
- Check browser console for correlation IDs in error messages

**Type Errors:**

```powershell
# Rebuild shared types
cd shared
npx tsc
# Check types in other projects
cd ../backend
npm run type-check
cd ../student-frontend
npm run type-check
```

## 📄 License

This project is licensed under the MIT License - see the `LICENSE.MD` file for details.

---

_This README reflects the current state of the LMS Admin Web App as of 2025._
