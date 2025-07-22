# LMS Student Frontend

> Modern, secure, and scalable student portal for Learning Management Systems, built with React, TypeScript, Vite, and Tailwind CSS.

---

## Overview

The LMS Student Frontend is a feature-rich, production-ready web application designed for students to manage courses, assignments, quizzes, grades, and notifications. It leverages a modular architecture, robust API patterns, and advanced security practices for a seamless user experience.

## Features

- **Course Management**: Browse, enroll, and view course details and lectures.
- **Assignments & Quizzes**: Submit assignments, take quizzes, and track progress.
- **Grades & Notifications**: View grades, receive real-time notifications.
- **Authentication & Security**: Secure token management, route-based access control, and error boundaries.
- **Responsive UI**: Mobile-first design powered by Tailwind CSS.
- **API Patterns**: Enhanced API client, React hooks, interceptors, and error handling.

## Tech Stack

- **React 19** & **TypeScript**
- **Vite** for fast development & builds
- **Tailwind CSS** for styling
- **React Query** for data fetching & caching
- **React Router** for navigation
- **Axios** for API requests
- **JWT** for authentication

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

## Project Structure

```text
student-frontend/
├── public/           # Static assets (logo, icons, etc.)
├── src/              # Main source code
│   ├── api/          # API clients & interceptors
│   ├── components/   # Reusable UI components
│   ├── config/       # App & route configuration
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── routes/       # App routing (public/protected)
│   ├── store/        # State management (React Query)
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   └── examples/     # API usage examples
├── index.html        # App entry point
├── tailwind.config.ts# Tailwind CSS config
├── package.json      # Project metadata & scripts
└── README.md         # Project documentation
```

## Usage Examples

See [`src/examples/ApiUsageExamples.tsx`](src/examples/ApiUsageExamples.tsx) for advanced API patterns, hooks, and error handling.

## Security & Best Practices

:::note
All protected routes require authentication and permission checks. Token storage is encrypted and auto-cleaned for security. See [`src/config/routeConfig.ts`](src/config/routeConfig.ts) for details.
:::

:::tip
Use the provided React hooks and error boundaries for robust API integration and graceful error handling.
:::

## Customization

- **Theme**: Easily customize colors, fonts, and breakpoints in [`src/index.css`](src/index.css) and [`tailwind.config.ts`](tailwind.config.ts).
- **Routing**: Add or modify routes in [`src/routes/`](src/routes/) and [`src/config/routeConfig.ts`](src/config/routeConfig.ts).
- **API**: Extend API clients and hooks in [`src/api/`](src/api/) and [`src/hooks/`](src/hooks/).

## Troubleshooting

:::caution
If you see a warning about insecure context, ensure the app is served over HTTPS for full token security.
:::

---

For backend integration, see the main project documentation. For UI/UX guidelines, refer to the design documents in the repository.
