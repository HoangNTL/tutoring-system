# AI Agent Guidance

This file describes how AI coding agents should work in this repository.

## Scope

This repository contains three applications:

- `apps/frontend`: React SPA
- `apps/core-backend`: Laravel backend
- `apps/legacy-backend`: Express backend for legacy SQL Server data

Agents should treat this as an existing multi-app system with established boundaries.

## Hard Rules

- Do not refactor code unless explicitly requested.
- Do not modify `.env` files unless explicitly requested.
- Do not install packages unless explicitly requested.
- Do not change database schema unless explicitly requested.
- Do not move responsibilities between frontend, Laravel, and Express without explicit approval.
- Do not replace legacy integration assumptions with guesses.
- If a behavior is unclear, write `TODO: verify` in documentation or ask before changing code.

## Architecture Awareness

Observed request and data flow:

1. Frontend sends browser requests to Laravel.
2. Laravel handles auth, validation, authorization, and application orchestration.
3. Laravel calls the legacy Express backend for some datasets.
4. Express reads from SQL Server.
5. Laravel uses MySQL for its own application data.

Preserve this separation unless the user requests an architecture change.

## Folder Ownership

### Frontend: `apps/frontend`

Use this area for:

- React UI
- client-side routing
- role-based layouts and navigation
- frontend state management
- browser API calls to Laravel

Avoid:

- direct SQL access
- direct calls to SQL Server
- backend-specific business logic that belongs in Laravel

### Core Backend: `apps/core-backend`

Use this area for:

- authentication
- request validation
- API responses
- authorization policies
- orchestration between frontend-facing API and legacy services
- Laravel-managed MySQL data

Avoid:

- duplicating legacy SQL queries unless explicitly requested
- undocumented changes to auth or session behavior

### Legacy Backend: `apps/legacy-backend`

Use this area for:

- SQL Server reads
- legacy data mapping
- read-oriented versioned API endpoints
- API key protected internal service access

Avoid:

- exposing unauthenticated endpoints unless explicitly requested
- assuming write support exists

## Current Conventions

### API contract

Laravel public API responses use this envelope:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": null
}
```

Laravel public API field naming uses camelCase for:

- request bodies
- query params
- response payloads

Database columns remain snake_case internally.

### API versioning

Current public routes use `/api/v1/...`.

### Auth

Observed frontend auth flow:

- request Sanctum CSRF cookie
- submit username and password to Laravel
- rely on cookie-based authenticated requests with `withCredentials: true`
- restore auth state with `GET /api/v1/auth/me`
- logout with `POST /api/v1/auth/logout`

Agents should not convert this to token-only auth without approval.

### Query conventions

Current list-style APIs use:

- `page`
- `limit`
- `search`
- `sortBy`
- `sortOrder`

Pagination metadata uses:

- `meta.total`
- `meta.perPage`
- `meta.currentPage`
- `meta.lastPage`

### Validation

- Laravel uses Form Requests
- Laravel normalizes incoming camelCase into internal snake_case before validation
- Express uses Joi-based query validation middleware

### Frontend state

- React Query is the source of truth for API data fetching
- Redux stores auth state and small global app concerns
- local component state is still used for local UI flows such as form submission

### Frontend structure

The frontend is feature-based under `apps/frontend/src/features`.

Role-aware layouts currently exist for:

- admin and department users
- lecturers
- students

## Safe Working Process

1. Inspect the relevant app boundary first.
2. Confirm whether the behavior belongs in frontend, Laravel, or Express.
3. Prefer small, local changes over cross-service rewrites.
4. Update documentation when behavior, routes, or workflow changes.
5. Mark unknowns as `TODO: verify`.

## Documentation Expectations

When updating docs:

- base claims on actual files in the repo
- distinguish current implementation from framework defaults
- call out incomplete or placeholder areas explicitly
- do not present inferred intent as fact

## Known Ambiguities

- Imported user password handling is development-oriented at the moment. `TODO: verify` the production-safe onboarding approach.
- Several frontend role-based pages exist before matching backend APIs are implemented. Keep docs explicit about what is integrated versus placeholder.
