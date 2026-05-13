# AI Agent Guidance

This file describes how AI coding agents should work in this repository.

## Scope

This repository contains three existing applications:

- `apps/frontend`: React SPA
- `apps/core-backend`: Laravel backend
- `apps/legacy-backend`: Express backend for legacy SQL Server data

Agents should treat this as an existing system with established folder boundaries and integration paths.

## Hard Rules

- Do not refactor code unless explicitly requested.
- Do not modify `.env` files unless explicitly requested.
- Do not install packages unless explicitly requested.
- Do not change database schema unless explicitly requested.
- Do not move responsibilities between frontend, Laravel, and Express without explicit approval.
- Do not replace legacy integration assumptions with guesses.
- If a behavior is unclear, write `TODO: verify` in documentation or ask the user before changing code.

## Architecture Awareness

Observed request/data flow:

1. Frontend sends browser requests to Laravel.
2. Laravel handles auth and core API orchestration.
3. Laravel calls the legacy Express backend for some datasets.
4. Express reads from SQL Server.
5. Laravel uses MySQL for its own application data.

Agents should preserve this separation unless the user requests an architecture change.

## Folder Ownership

### Frontend: `apps/frontend`

Use this area for:

- React UI
- client-side routing
- frontend state management
- browser API calls to Laravel

Avoid:

- direct SQL access
- direct calls to SQL Server
- embedding Laravel-only behavior in the UI unless already established

### Core Backend: `apps/core-backend`

Use this area for:

- authentication
- request validation
- API responses
- orchestration between frontend-facing API and legacy services
- Laravel-managed MySQL data

Avoid:

- duplicating legacy SQL queries unless explicitly requested
- undocumented changes to auth/session behavior

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

### API Responses

Both Laravel and Express currently return a similar envelope:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": null
}
```

Preserve this shape for new endpoints unless the user requests a change.

### API Versioning

Current code uses `/api/v1/...` for application endpoints.

### Auth

Observed frontend auth flow:

- request Sanctum CSRF cookie
- submit username/password to Laravel
- rely on cookie-based authenticated requests with `withCredentials: true`

Agents should not convert this to token-only auth without approval.

### Pagination

Observed shared conventions:

- `page`
- `limit`
- `meta.total`
- `meta.perPage`
- `meta.currentPage`
- `meta.lastPage`

### Validation

- Laravel uses Form Requests
- Express uses Joi-based query validation middleware

### Loading States (Frontend)

- React Query loading states are the source of truth for API data fetching
- Local component state is used for form submission loading (e.g., login)
- Axios interceptors track global request activity
- Redux is only for global loading UI/overlay (optional)

## Safe Working Process

1. Inspect the relevant app boundary first.
2. Confirm whether the behavior belongs in frontend, Laravel, or Express.
3. Prefer small, local changes over cross-service rewrites.
4. Update documentation when behavior, routes, or workflow changes.
5. Mark unknowns as `TODO: verify`.

## Documentation Expectations

When updating docs:

- base claims on actual files in the repo
- distinguish current runtime values from framework defaults
- call out inconsistencies explicitly
- do not present inferred intent as fact

## Known Ambiguities

- Laravel API routes live in `routes/web.php` instead of `routes/api.php`. `TODO: verify`
- Legacy backend production start workflow is not defined in `package.json`. `TODO: verify`
