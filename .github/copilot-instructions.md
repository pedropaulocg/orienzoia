# Copilot Instructions for Orienzoia

## Architecture Overview

This is a **PDI (Personal Development Plan) management system** built with Node.js, Express, TypeScript, and Prisma. The core domain models are:

- **Users** (with roles: USER, MANAGER, ADMIN)
- **Plans** (personal development plans with periods)
- **Goals** (SMART goals within plans)
- **ActionItems** (tasks to achieve goals)
- **CheckIns** and **Feedback** (progress tracking)

## Module Structure Pattern

Follow the **feature-based module** pattern in `src/modules/`:

```
modules/[domain]/
├── http/           # Route handlers (thin controllers)
├── repositories/   # Data access layer with interfaces
├── services/       # Business logic
└── types.ts        # Domain-specific types
```

**Key Pattern**: Always create both interface and Prisma implementation for repositories:

- `user.repository.ts` - Interface definition
- `prisma-user.repository.ts` - Prisma implementation

## Development Workflows

### Running the Application

```bash
npm run dev          # Development with hot reload
npm run build        # TypeScript compilation
npm start           # Production mode
```

### Database Management

```bash
npm run prisma:generate  # Generate Prisma client after schema changes
npm run prisma:migrate   # Apply database migrations
npm run prisma:studio   # Visual database browser
```

## Critical Conventions

### 1. Repository Pattern

- Always use **dependency injection** - services receive repository interfaces
- Implement `userSafeSelect` objects to exclude sensitive fields like passwords
- Use Prisma transactions for multi-operation queries (see `PrismaUserRepository.list()`)

### 2. Authentication & Authorization

- Use `AuthMiddleware` class with JWT tokens from `Authorization: Bearer <token>` headers
- Extend `AuthRequest` interface to add `req.user` with `{ id, role }`
- Apply role-based access with `AuthMiddleware.onlyRoles(['ADMIN', 'MANAGER'])`

### 3. Route Structure

- Routes are **thin controllers** - delegate to services immediately
- Use consistent HTTP patterns:
  - `POST /` for creation (201 status)
  - `GET /:id` for single resource (404 if not found)
  - `PATCH /:id/activate|deactivate` for state changes (204 status)

### 4. Error Handling

- Use `AppError` class for domain errors with custom status codes
- Central error handler in `App.errorHandler()` catches all exceptions
- Return consistent JSON error format: `{ message: string }`

### 5. Pagination

- Standardize on `PageParams` type with `{ page?, pageSize? }` query parameters
- Return `PageResult<T>` with `{ data, page, pageSize, total }`
- Use helper `toPage()` function for skip/take calculation

## Path Aliases & Imports

- Use `@/*` alias for `src/*` imports (configured in tsconfig.json)
- Import from `@/infra/prisma` for database client
- Import types from `@/core/types` for shared pagination types

## Database Patterns

- Use **soft deletes** with `deletedAt` timestamp when needed
- Prefer `@db.Citext` for case-insensitive email fields
- Always add proper indexes on foreign keys and frequently queried fields
- Use Prisma's `onDelete: Cascade` for parent-child relationships

## Security Notes

- Environment variables loaded via `--env-file=.env` flag (see package.json scripts)
- JWT secret from `process.env.JWT_SECRET`
- Password hashing with `Crypto.hashPassword()` using argon2
- Use Helmet, CORS, and compression middleware consistently
