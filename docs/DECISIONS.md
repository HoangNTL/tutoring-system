# Decisions

## Purpose

This file records architecture and implementation decisions that are already visible in the codebase.

Where intent is not explicitly documented in code, the item is marked `TODO: verify`.

## Current Decisions

### 1. The repository is a multi-application monorepo

Status:

- confirmed from folder structure

Evidence:

- `apps/frontend`
- `apps/core-backend`
- `apps/legacy-backend`

Implication:

- work should preserve clear boundaries between UI, core backend, and legacy integration layers

### 2. Laravel is the frontend-facing backend

Status:

- confirmed from frontend API configuration

Evidence:

- frontend `VITE_API_BASE_URL=http://localhost:8000`
- frontend auth API paths target Laravel-style routes

Implication:

- browser clients should not need to call SQL Server-facing services directly

### 3. Express is used as a legacy data gateway

Status:

- confirmed from Laravel service integration and Express SQL Server repositories

Evidence:

- Laravel `Http::legacy()` macro
- Express Knex SQL Server config
- Express versioned routes for students, lecturers, departments

Implication:

- legacy academic data access currently lives behind a dedicated service boundary

### 4. Laravel currently uses MySQL for application data

Status:

- confirmed from current Laravel `.env`

Evidence:

- `DB_CONNECTION=mysql`
- `DB_DATABASE=tutoring_db`

Implication:

- Laravel-managed users, sessions, cache, jobs, and Sanctum tables belong to MySQL in the current local setup

### 5. Legacy academic data currently comes from SQL Server

Status:

- confirmed from Express DB configuration and repositories

Evidence:

- Knex client `mssql`
- SQL Server tables queried in repositories

Implication:

- SQL Server schema knowledge should be derived from query code unless external DB docs are provided

### 6. Frontend authentication uses cookie/session flow with Sanctum support

Status:

- confirmed from frontend and Laravel code

Evidence:

- frontend calls `/sanctum/csrf-cookie`
- axios uses `withCredentials: true`
- Laravel protects `/api/v1/auth/me` with `auth:sanctum`
- Laravel auth guard is `web`

Implication:

- new frontend auth work should preserve cookie/session expectations unless explicitly changed

### 7. API responses are intentionally normalized across backends

Status:

- confirmed from helper implementations

Evidence:

- Laravel `ApiResponse` trait
- Express `ApiResponse` utility

Implication:

- new endpoints should keep the `success` / `message` / `data` / `meta` shape unless a deliberate API redesign is approved

### 8. Pagination shape is shared across backends

Status:

- confirmed from pagination helpers

Evidence:

- Laravel and Express both expose `total`, `perPage`, `currentPage`, `lastPage`

Implication:

- cross-service pagination remains consistent for frontend consumers

### 9. Legacy import creates Laravel users from external records

Status:

- confirmed from command and service code

Evidence:

- `php artisan import:legacy-users`
- import service pulls students, lecturers, and departments from the legacy API

Implication:

- Laravel auth identity is partially synchronized from the legacy system rather than manually entered only in MySQL

## Unclear Or Implicit Decisions

### 10. Laravel API routes are defined in `routes/api.php`

Status:

- confirmed in code

Evidence:

- `bootstrap/app.php` registers `routes/api.php`
- `apps/core-backend/routes/api.php` defines the `/api/v1/...` endpoints

Implication:

- Laravel API routing now follows the framework's standard API route structure

### 11. Express appears to be internal-service oriented

Status:

- likely, but not explicitly documented

Evidence:

- API key middleware is applied globally
- Laravel service config is wired directly to Express
- CORS is restricted to `CORE_BACKEND_URL`

Implication:

- changes should assume Express is primarily for backend-to-backend use unless product requirements say otherwise

Decision note:

- `TODO: verify`

### 12. Legacy import password defaults are operational but not explained

Status:

- confirmed in code, rationale undocumented

Evidence:

- DOB-derived passwords
- fallback password `1`

Implication:

- this behavior should not be silently normalized or expanded without security review

Decision note:

- `TODO: verify`
