# Architecture

This document describes the current system architecture in the repository.

## System Overview

The repository is split into three applications:

1. `apps/frontend`: browser SPA
2. `apps/core-backend`: Laravel API and application logic
3. `apps/legacy-backend`: Express service for legacy SQL Server data

High-level request flow:

```text
Browser SPA
  -> Laravel API
     -> MySQL
     -> Legacy Express API
        -> SQL Server
```

## Frontend Architecture

### Stack

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui

### Structure

The frontend follows a feature-based structure.

```text
apps/frontend/src/
  app/
  features/
    auth/
    tutorial-period/
    users/
    reports/
    settings/
    tutorial-scheduling/
    lecturer-assignments/
    teaching-schedule/
    tutorial-registration/
    study-schedule/
    profile/
  layouts/
  routes/
  shared/
```

Key boundaries:

- `features/*`: feature-specific pages, hooks, schema, API usage
- `layouts/*`: role-aware shells
- `routes/*`: route guards and route configuration
- `shared/*`: shared UI, API client, utilities, config

### Role-based layouts

The UI chooses a layout by authenticated role:

- `ADMIN` -> admin layout
- `DEPARTMENT` -> admin layout
- `LECTURER` -> lecturer layout
- `STUDENT` -> student layout

The route layer uses:

- `RequireAuth`
- `RequireRole`
- `GuestOnlyRoute`

### Server state and auth state

- TanStack Query is the primary server-state layer.
- Redux stores authentication state and global UI-level concerns.
- Auth bootstrap runs on app startup and calls `/api/v1/auth/me`.

### Current feature maturity

Fully integrated today:

- authentication
- tutorial period management

Frontend pages that currently exist mostly as placeholders:

- users
- reports
- settings
- tutorial scheduling
- lecturer assignments
- teaching schedule
- tutorial registration
- study schedule
- profile

## Laravel Backend Architecture

### Stack

- Laravel 12
- Sanctum
- MySQL

### Application flow

The Laravel app follows the current layered pattern:

```text
Request
  -> FormRequest
  -> Controller
  -> Service
  -> Model / External service
  -> API Resource
  -> JSON response
```

Responsibilities:

- Form Requests: validation, camelCase request normalization, safe query parsing
- Controllers: thin orchestration and authorization
- Services: business logic
- Models: persistence and relationships
- Resources: public camelCase API contract

### Public API modules currently implemented

- auth
- tutorial periods

### Auth architecture

Sanctum is used in SPA session mode:

1. frontend requests `/sanctum/csrf-cookie`
2. login posts credentials to Laravel
3. Laravel creates a session
4. browser sends session and XSRF cookies on subsequent requests
5. frontend restores state with `/api/v1/auth/me`

Laravel route middleware shape:

- auth routes run through `web`
- protected routes use `auth:sanctum`
- the API middleware stack prepends `EnsureFrontendRequestsAreStateful`

### Query system

The Laravel API exposes a standard query shape for list endpoints:

- `page`
- `limit`
- `search`
- `sortBy`
- `sortOrder`

Internally:

- public query params remain camelCase
- validated request data is normalized to internal snake_case
- allowed sort fields are explicitly mapped to database columns

### API contract

The public Laravel API is camelCase end to end:

- request bodies use camelCase
- query params use camelCase
- resources return camelCase

The database remains snake_case internally.

## Legacy Backend Architecture

### Stack

- Express 5
- TypeScript
- Knex
- SQL Server

### Responsibility

The legacy backend is a read-oriented internal service.

It is responsible for:

- querying legacy SQL Server datasets
- exposing versioned internal endpoints
- protecting those endpoints with an API key

Current endpoint groups:

- students
- lecturers
- departments

Laravel owns the browser-facing integration boundary and normalizes legacy data for the frontend.

## Data Contract Boundaries

### Database

- MySQL tables use snake_case
- SQL Server remains legacy-driven

### Laravel internals

- Eloquent attributes and columns remain snake_case
- request validation normalizes camelCase into internal snake_case

### Frontend contract

- frontend domain models use camelCase
- no frontend response mapper is required for the Laravel API

## UI Architecture Notes

The frontend UI has recently been simplified around:

- shadcn/ui components
- shared date utilities
- `Calendar + Popover` date picking instead of native `type="date"`
- lighter modal and form composition

Date display is formatted in Vietnam time using shared utilities, while API payloads remain raw data values until they reach the display layer.
