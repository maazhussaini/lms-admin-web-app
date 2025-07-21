<p align="center">
  <img src="https://raw.githubusercontent.com/Azure-Samples/serverless-chat-langchainjs/main/public/logo.png" alt="LMS Backend Logo" width="80" />
</p>

# LMS Backend API

> Scalable, secure, and modular backend for Learning Management Systems, built with Node.js, TypeScript, Express, Prisma, and Socket.IO.

---

## Overview

The LMS Backend powers the core business logic, data management, and real-time features for the LMS platform. It provides RESTful APIs, authentication, multi-tenant support, and robust integrations for frontend clients and external systems.

## Features

- **RESTful API**: Modular endpoints for courses, users, assignments, quizzes, notifications, and more.
- **Authentication & Authorization**: JWT-based auth, role & permission checks, tenant isolation.
- **Database ORM**: Prisma for type-safe, scalable PostgreSQL access.
- **Real-Time**: Socket.IO for notifications, progress tracking, and live updates.
- **Validation & Security**: Input validation, rate limiting, CORS, Helmet, and secure password hashing.
- **Testing**: Unit & integration tests with Jest and Supertest.
- **Documentation**: Swagger UI for interactive API docs.
- **Data Seeding**: Automated scripts for demo and test data.

## Tech Stack

- **Node.js** & **TypeScript**
- **Express** for HTTP APIs
- **Prisma** ORM (PostgreSQL)
- **Socket.IO** for real-time
- **Jest** for testing
- **Swagger** for API docs
- **Docker** (optional, for deployment)

## Getting Started

```powershell
# Install dependencies
npm install

# Setup database & generate Prisma client
npm run setup

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```text
backend/
├── src/                # Main source code
│   ├── api/            # API routes (v1)
│   ├── config/         # App, DB, logger, socket config
│   ├── controllers/    # Request handlers
│   ├── dtos/           # Data transfer objects
│   ├── middleware/     # Express middleware
│   ├── services/       # Business logic
│   ├── sockets/        # Real-time handlers
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── app.ts, server.ts
├── prisma/             # Prisma schema, seeds, migrations
├── scripts/            # CLI utilities (e.g., password hashing)
├── tests/              # Unit & integration tests
├── Tables Documentation/ # Data model docs
├── uploads/            # File uploads
└── package.json        # Project metadata & scripts
```

## Usage Examples

- **Password Hashing**: See [`scripts/README.md`](scripts/README.md) for secure password utilities.
- **API Endpoints**: Explore [`src/api/v1/index.ts`](src/api/v1/index.ts) for available routes.
- **Data Models**: Reference [`Tables Documentation/`](Tables Documentation/) for entity relationships.

## Security & Best Practices

:::note
All sensitive operations require authentication and permission checks. Rate limiting, input validation, and secure password storage are enforced by default.
:::

:::tip
Use environment variables for secrets and configuration. See `.env.example` for reference.
:::

## Customization

- **Database**: Update models in [`prisma/schema.prisma`](prisma/schema.prisma) and run migrations.
- **API**: Add new endpoints in [`src/api/`](src/api/), controllers, and services.
- **Socket.IO**: Extend real-time features in [`src/sockets/`](src/sockets/).
- **Seeding**: Customize demo data in [`prisma/seed.ts`](prisma/seed.ts).

## Troubleshooting

:::caution
If you encounter database connection errors, check your `DATABASE_URL` and run `npm run prisma:migrate`.
:::

---

For frontend integration, see the main project documentation. For data model details, refer to the tables documentation in the repository.
