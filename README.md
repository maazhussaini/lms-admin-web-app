# Learning Management System (LMS)

The Learning Management System (LMS) is a comprehensive, secure, and scalable platform designed to revolutionize the delivery of educational content. It focuses on protecting intellectual property, particularly high-value video content, while offering a modern, engaging, and accessible user experience across web and mobile platforms. This LMS empowers educational institutions and instructors to manage courses, engage students, and track progress effectively, with robust integration with Bunny.net for secure video hosting, streaming, and DRM.

## ✨ Features

The LMS is broadly divided into an Admin/Instructor Panel for management and a Student Platform for learning and engagement.

### 🔑 Core & Differentiating Features
*   **Advanced Video Protection**:
    *   Enterprise Multi-DRM (Widevine, PlayReady, FairPlay) via Bunny.net integration to secure video playback.
    *   Token-Based Access for authorized video streaming.
    *   Screenshot and Screen Recording Prevention mechanisms on supported platforms.
*   **Cross-Platform Accessibility**: Unified experience across web (Admin & Student) and native mobile apps (Android & iOS for Students).
*   **Bunny.net Integration**: Leverages Bunny.net for secure video hosting, global CDN delivery, DRM, and scalable streaming infrastructure.
*   **User-Centric Design**: Modern UI/UX with interactive components, responsive layouts, and accessibility features like dark mode.

### 🧑‍🏫 Admin/Instructor Panel (Web)

The Web Admin Panel provides administrators and instructors with comprehensive tools to manage the educational ecosystem.

1.  **User Management**:
    *   CRUD operations for user accounts (students, instructors).
    *   Assign roles and permissions.
    *   View and edit student profiles.
    *   Manage student enrollments in courses.
2.  **Course Management**:
    *   CRUD operations for courses.
    *   Course categorization and organization (modules, chapters).
    *   Manage course materials (upload, edit, delete documents, presentations, etc.).
    *   Schedule live video lectures.
3.  **Content Management**:
    *   Upload and manage lectures (video, audio, text).
    *   Create and manage quizzes, exams, and assignments.
    *   Organize course content structure.
4.  **Analytics and Reporting**:
    *   View course analytics (enrollment numbers, completion rates).
    *   Track student performance metrics.
    *   Generate custom reports and export them (CSV, PDF).
    *   Dashboard with key performance indicators.
5.  **Notifications and Announcements**:
    *   Create and send announcements to students or specific groups.
    *   Schedule announcements for future delivery.
    *   Manage notification preferences and view history.
6.  **Assessment and Evaluation**:
    *   Grade assignments, quizzes, and exams.
    *   Provide detailed feedback on student submissions.
    *   Track student progress and overall performance.
7.  **Support and Help**:
    *   Access to a help center and FAQs.
    *   Interface for contacting technical support and managing support tickets.
8.  **Feedback and Surveys**:
    *   Create and distribute surveys to collect student feedback.
    *   Analyze survey results to improve course content and delivery.
    *   Respond to feedback.
9.  **Calendar Management**:
    *   Schedule live lectures, exams, and other important events.
    *   Option to sync with personal calendars.
    *   Set reminders for key dates and view an academic calendar.

### 🎓 Student Platform (Web, Android, iOS)

The Student Platform provides an engaging and interactive learning environment accessible via web browsers and native mobile applications.

1.  **User Authentication**:
    *   No sign-up by students and teacher only admin can create their accounts.
    *   Secure login, and password recovery.
2.  **User Profile**:
    *   View and edit personal profile information.
    *   Change password and manage account settings.
    *   Upload a profile picture.
3.  **Course Content Access**:
    *   View lectures (video, audio, text) with secure playback.
    *   Cannot download lectures and course materials for offline access.
    *   Participate in quizzes and exams.
    *   Submit assignments through the platform.
4.  **Progress Tracking**:
    *   View individual course progress and completion status.
    *   Track scores for quizzes and exams.
    *   View grades and feedback for assignments.
5.  **Notifications**:
    *   Receive real-time push notifications (on mobile) and web notifications for course updates, assignment deadlines, quiz reminders, and instructor announcements.
6.  **Course Catalog & Enrollment**:
    *   Browse the enrolled course catalog only.
    *   Search and filter courses (by category, difficulty, instructor, etc.).
    *   View detailed course descriptions.
7.  **Support and Help**:
    *   Access to a help center and FAQs.
    *   Option to contact support.
8.  **Feedback and Ratings**:
    *   Rate courses and provide feedback on lectures.
    *   Review instructors and course content.

## 🛠️ Tech Stack

*   **Backend**:
    *   Language: TypeScript
    *   Runtime Environment: Node.js
    *   Framework: Express.js
    *   Database: PostgreSQL
    *   Real-time Communication: Socket.IO
*   **Frontend (Web Admin Panel & Student Web Portal)**:
    *   Framework: Angular
    *   Language: TypeScript
    *   UI Components: PrimeNG
    *   Build Tool: Vite
*   **Mobile Applications (Student Android & iOS)**:
    *   Android: Kotlin (Native)
    *   iOS: Swift (Native)
*   **Video Infrastructure & Security**:
    *   Bunny.net: Video Hosting, Secure Streaming (HLS/DASH), Global CDN, Enterprise Multi-DRM (Widevine, PlayReady, FairPlay).

## 📁 Folder Structure Overview

The project follows industry-standard organizational patterns with clear separation of concerns:

```
learning-management-system/
├── backend/                     # Node.js, Express, TypeScript, PostgreSQL, Socket.IO
│   ├── src/                     # Backend source code
│   │   ├── controllers/         # Request handlers and route logic
│   │   ├── models/              # Database schema definitions (TypeORM entities)
│   │   ├── routes/              # API route definitions and middleware
│   │   ├── services/            # Business logic and data access services
│   │   ├── middleware/          # Custom middleware (auth, validation, etc.)
│   │   ├── types/               # Backend-specific type definitions
│   │   ├── utils/               # Utility functions and helpers
│   │   ├── config/              # Configuration files and environment setup
│   │   ├── migrations/          # Database migration scripts
│   │   ├── seeds/               # Database seeding scripts
│   │   ├── sockets/             # Socket.IO event handlers
│   │   └── server.ts            # Backend server entry point
│   ├── tests/                   # Unit and integration tests
│   ├── docs/                    # API documentation (OpenAPI/Swagger)
│   ├── package.json
│   ├── tsconfig.json            # TypeScript configuration
│   ├── jest.config.js           # Testing configuration
│   └── .env.example             # Environment variables template
│
├── frontend-admin-panel/        # Angular Admin Panel with Vite
│   ├── src/                     # Frontend source code
│   │   ├── app/                 # Core application modules and components
│   │   │   ├── core/            # Core services, guards, interceptors
│   │   │   ├── shared/          # Shared components, pipes, directives
│   │   │   ├── features/        # Feature modules (users, courses, etc.)
│   │   │   ├── layouts/         # Application layouts
│   │   │   └── pages/           # Page components
│   │   ├── assets/              # Static assets (images, fonts, styles)
│   │   ├── environments/        # Environment-specific configurations
│   │   └── styles/              # Global styles and themes
│   ├── tests/                   # Unit and e2e tests
│   ├── docs/                    # Component documentation
│   ├── angular.json             # Angular CLI workspace configuration
│   ├── package.json
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vite.config.ts           # Vite build configuration
│   └── karma.conf.js            # Testing configuration
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
├── docs/                        # Project documentation
│   ├── architecture/            # System architecture documentation
│   ├── database/                # Database schema and ERD
│   ├── api/                     # API documentation
│   ├── deployment/              # Deployment guides
│   └── development/             # Development setup and guidelines
│
├── scripts/                     # Build and deployment scripts
├── docker/                      # Docker configuration files
├── .github/                     # GitHub workflows and templates
├── .gitignore
├── LICENSE.MD                   # Project license information
├── README.MD                    # This file
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history and changes
└── package.json                 # Root workspace configuration
```

This structure promotes:
- **Separation of Concerns**: Clear boundaries between different layers
- **Type Safety**: Shared types ensure consistency across frontend and backend
- **Scalability**: Modular architecture supports growth
- **Maintainability**: Well-organized code is easier to maintain
- **Industry Standards**: Follows established patterns and conventions

## 🚀 Installation

(Note: Specific commands might vary based on final setup and chosen package managers like npm or yarn.)

```bash
# Clone the repository (example)
# git clone https://github.com/yourusername/learning-management-system.git
# cd learning-management-system

# --- Backend Installation ---
cd backend
npm install # or yarn install
cd ..

# --- Frontend Admin Panel Installation ---
cd frontend-admin-panel
npm install # or yarn install
cd ..

# --- Frontend Student Portal Installation ---
cd frontend-student-portal
npm install # or yarn install
cd ..

# --- Mobile Applications ---
# Android: Open 'mobile-student-android' project in Android Studio and sync Gradle.
# iOS: Open 'mobile-student-ios/LMSProjectName.xcodeproj' in Xcode and install dependencies (e.g., using CocoaPods or Swift Package Manager if applicable).
```

## ⚙️ Usage

### Starting Development Servers

**Backend:**
```bash
cd backend
npm run dev # or your specific script, e.g., npm run start:dev
# or
yarn dev
```
The backend server will typically run on a port specified in your backend configuration (e.g., `http://localhost:3000`).

**Frontend Admin Panel (Angular with Vite):**
```bash
cd frontend-admin-panel
npm run dev # or yarn dev
```
The admin panel development server will typically run on `http://localhost:4200` or another port specified by Vite.

**Frontend Student Portal (Angular with Vite):**
```bash
cd frontend-student-portal
npm run dev # or yarn dev
```
The student portal development server will typically run on a different port (e.g., `http://localhost:4201`).

**Mobile Applications:**
*   **Android**: Run from Android Studio on an emulator or physical device.
*   **iOS**: Run from Xcode on an emulator or physical device.

### Building for Production

**Backend (if applicable, e.g., compiling TypeScript):**
```bash
cd backend
npm run build # or your specific build script
# or
yarn build
```

**Frontend Admin Panel:**
```bash
cd frontend-admin-panel
npm run build
# or
yarn build
```

**Frontend Student Portal:**
```bash
cd frontend-student-portal
npm run build
# or
yarn build
```

**Mobile Applications:**
*   **Android**: Build an APK or App Bundle using Android Studio.
*   **iOS**: Archive and build the app using Xcode.

### Previewing Production Build (Frontend with Vite)

**Frontend Admin Panel:**
```bash
cd frontend-admin-panel
npm run preview
# or
yarn preview
```

**Frontend Student Portal:**
```bash
cd frontend-student-portal
npm run preview
# or
yarn preview
```

## 🤝 Contributing

Contributions are welcome! Please follow these general steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourAmazingFeature`).
3.  Make your changes and commit them (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please ensure your code adheres to the project's coding standards and includes relevant tests.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE.MD` file for details. (You'll need to create this `LICENSE.MD` file and add the MIT License text or your chosen license).

---

*This README was generated with the assistance of GitHub Copilot.*
*User: @abdulazeem1357*
*Date: 2025-05-25*