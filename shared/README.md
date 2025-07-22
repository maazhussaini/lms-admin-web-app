# LMS Shared Types & Constraints

> Centralized, reusable TypeScript types, constraints, and entity relationships for the LMS platform.

---

## Overview

The `shared` workspace provides a unified set of type definitions, constraints, and entity relationship models used across all LMS services (backend, frontend, student portal, etc.). This ensures consistency, type safety, and maintainability for all data contracts and validation logic.

## Features

- **TypeScript Types**: Standardized types for API responses, entities, validation, and business logic.
- **Constraints**: Base, enum, foreign key, and unique constraints for robust data modeling.
- **Entity Relationships**: Core, user, course, session, analytics, and notification entity models.
- **Type-Only Build**: Emits only `.d.ts` files for consumption by other projects.
- **Extensible**: Easily add new types, constraints, or relationships as the platform evolves.

## Tech Stack

- **TypeScript**
- **Project References** (for type sharing)

## Getting Started

```powershell
# Install dependencies
npm install

# Build type declarations
npx tsc
```

## Project Structure

```text
shared/
├── types/                # TypeScript types (API, entities, validation, etc.)
├── constraints/          # Data constraints (base, enums, FKs, unique)
├── entity-relationships/ # Entity relationship models
├── utils/                # Shared utility types/functions
├── tsconfig.json         # Type-only build config
└── package.json          # Project metadata
```

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
