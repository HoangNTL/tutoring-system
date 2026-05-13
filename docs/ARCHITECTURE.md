# Architecture

## Overview

This repository is organized as a three-application system:

- a React frontend in `apps/frontend`
- a Laravel backend in `apps/core-backend`
- an Express legacy-data backend in `apps/legacy-backend`

The current architecture is integration-oriented rather than fully consolidated. Laravel is the primary backend exposed to the frontend, while Express acts as a legacy data gateway to SQL Server.

## Top-Level Structure

```text
apps/
  frontend/
  core-backend/
  legacy-backend/
docs/
  Architecture.png
README.md
AGENTS.md
```

## Runtime Flow

```text
Browser
  -> React frontend
     -> Laravel core backend
        -> MySQL
        -> Express legacy backend
           -> SQL Server
```

## Frontend Architecture

Location: `apps/frontend`

Main areas:

- `src/api`: HTTP client and API wrappers
- `src/constants`: endpoint constants
- `src/features/auth`: login flow, auth types, auth service hooks
- `src/routes`: router and protected route handling
- `src/store`: Redux store and hooks
- `src/components/ui`: UI primitives

Observed frontend patterns:

- Axios instance uses `baseURL` from `VITE_API_BASE_URL`
- Axios sends cookies with `withCredentials: true`
- React Query is used for server state
- Redux Toolkit stores auth state
- React Router protects the root route via `ProtectedRoute`

Observed auth behavior:

1. Frontend requests `/sanctum/csrf-cookie`
2. Frontend posts credentials to `/api/v1/auth/login`
3. Frontend fetches `/api/v1/auth/me`
4. Protected routes redirect unauthenticated users to `/login`

## Laravel Architecture

Location: `apps/core-backend`

Main areas:

- `app/Http/Controllers`
- `app/Http/Requests`
- `app/Http/Resources`
- `app/Models`
- `app/Services`
- `app/Repositories`
- `app/Traits`
- `database/migrations`
- `routes/web.php`

Observed responsibilities:

- frontend-facing auth endpoints
- consistent JSON response envelope for API routes
- session-based auth backed by Sanctum middleware
- integration to legacy Express service through an HTTP macro
- legacy user import into Laravel `users`

Important implementation details:

- API-style routes are currently defined in `routes/web.php`
- `bootstrap/app.php` forces JSON exception rendering for `/api/*`
- `AppServiceProvider` defines `Http::legacy()` using `config('services.legacy_service')`
- `config/services.php` builds the legacy base URL as `LEGACY_BACKEND_URL + /api/v1`

## Express Architecture

Location: `apps/legacy-backend`

Main areas:

- `src/app.ts`
- `src/config/database.ts`
- `src/routes/v1`
- `src/controllers/v1`
- `src/services`
- `src/repositories`
- `src/middlewares`

Observed responsibilities:

- versioned internal API under `/api/v1`
- read access to SQL Server tables
- API key protection using `x-api-key`
- query validation with Joi
- response shaping with a shared `ApiResponse` helper

Observed middleware chain:

1. `express.json()`
2. `cors(...)`
3. `morgan(...)`
4. `cls-rtracer`
5. global API key middleware
6. `/api` router
7. global error handler

## Inter-Service Boundaries

### Frontend to Laravel

Current expectation:

- browser-facing auth and protected resource access go through Laravel
- frontend base URL defaults to `http://localhost:8000`

Relevant files:

- `apps/frontend/src/api/axiosInstance.ts`
- `apps/frontend/src/constants/api.ts`

### Laravel to Express

Current expectation:

- Laravel calls Express through `Http::legacy()`
- requests include `x-api-key`
- legacy base URL defaults to `http://localhost:5000/api/v1`

Relevant files:

- `apps/core-backend/app/Providers/AppServiceProvider.php`
- `apps/core-backend/config/services.php`
- `apps/legacy-backend/src/middlewares/authKey.ts`

### Express to SQL Server

Current expectation:

- Express is the layer that queries legacy academic tables
- Knex is configured with the `mssql` client

Relevant files:

- `apps/legacy-backend/src/config/database.ts`
- `apps/legacy-backend/src/repositories/*.ts`

## Current Endpoint Placement

### Laravel

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Express

- `GET /api/v1/students`
- `GET /api/v1/lecturers`
- `GET /api/v1/departments`

## Noted Inconsistencies

- API routes are placed in `routes/web.php`; no `routes/api.php` was found in current use. `TODO: verify` whether this is intentional

## Architecture Constraints For Future Work

- Preserve Laravel as the frontend-facing backend unless the user explicitly requests otherwise.
- Preserve Express as the SQL Server access layer unless the user explicitly requests otherwise.
- Preserve MySQL ownership for Laravel-managed user/session/framework data.
- Treat the current repo as partially modernized, with legacy integration still active.
