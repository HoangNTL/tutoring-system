# Tutoring System Monorepo

This repository contains a tutoring system split across three applications:

- `apps/frontend`: React SPA used by end users
- `apps/core-backend`: Laravel backend for authentication and core API orchestration
- `apps/legacy-backend`: Express backend that reads legacy academic data from SQL Server

The current codebase is organized as a monorepo with the frontend calling Laravel, and Laravel calling the legacy Express service for some data access.

## Repository Layout

```text
.
|-- apps/
|   |-- frontend/
|   |-- core-backend/
|   `-- legacy-backend/
|-- docs/
|   `-- Architecture.png
|-- AGENTS.md
`-- README.md
```

## High-Level Architecture

```text
React frontend
  -> Laravel core backend
     -> MySQL
     -> Legacy Express backend
        -> SQL Server
```

Observed runtime values in the current repository:

- Frontend API base URL: `http://localhost:8000`
- Laravel app URL: `http://localhost`
- Laravel current DB connection: `mysql`
- Legacy backend URL from Laravel config: `http://localhost:5000/api/v1`
- Legacy backend port: `5000`

## Detected Tech Stack

### Frontend

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Redux Toolkit
- TanStack React Query
- Axios
- React Hook Form
- Zod

Loading system summary:

- React Query handles API loading states
- Local component state handles form submissions
- Axios interceptors feed an optional global loading overlay via Redux

Logout summary:

- UserMenu triggers `POST /api/v1/auth/logout` and clears client auth state/cache

### Core Backend

- PHP 8.2
- Laravel 12
- Laravel Sanctum 4
- Laravel Vite plugin
- Tailwind CSS 4

### Legacy Backend

- Node.js
- TypeScript
- Express 5
- Knex
- `mssql`
- Joi
- Morgan
- Winston

### Databases

- MySQL for Laravel-managed application data
- SQL Server for legacy academic data accessed by Express

## Application Organization

### `apps/frontend`

Key folders:

- `src/api`: Axios client and API wrappers
- `src/constants`: shared constants such as endpoint paths
- `src/features`: feature modules, currently including `auth`
- `src/routes`: router and route guards
- `src/store`: Redux store setup
- `src/components`: UI and layout components

Observed auth flow:

- Axios uses `withCredentials: true`
- Frontend requests Sanctum CSRF cookie
- Frontend posts login credentials to Laravel
- Protected pages use `/api/v1/auth/me`

### `apps/core-backend`

Key folders:

- `app/Http/Controllers`: HTTP controllers
- `app/Http/Requests`: request validation
- `app/Http/Resources`: API resource serialization
- `app/Models`: Eloquent models
- `app/Services`: business and integration services
- `app/Repositories`: data access layer
- `database/migrations`: Laravel-managed schema
- `routes/web.php`: current route definitions, including API-style routes

Observed responsibilities:

- Session-based login/logout and current-user lookup
- JSON API responses for `/api/*`
- Proxy/integration calls to the legacy Express backend
- Legacy user import command

### `apps/legacy-backend`

Key folders:

- `src/config`: DB config
- `src/routes`: versioned routers
- `src/controllers`: HTTP controllers
- `src/services`: service layer
- `src/repositories`: SQL Server queries via Knex
- `src/models`: TypeScript interfaces
- `src/middlewares`: API key auth, validation, error handling

Observed responsibilities:

- Read-only API endpoints under `/api/v1`
- SQL Server access for students, lecturers, and departments
- API key protection for all mounted routes

## Running the Project

These commands are based on scripts and framework defaults already present in the repo.

### Frontend

Working directory: `apps/frontend`

Development:

```bash
npm run dev
```

Expected default URL:

- `http://localhost:5173`

### Core Backend

Working directory: `apps/core-backend`

Minimal Laravel API server:

```bash
php artisan serve
```

Vite assets for the Laravel app itself:

```bash
npm run dev
```

Combined development workflow defined in `composer.json`:

```bash
composer dev
```

Observed/default API URL used by the frontend:

- `http://localhost:8000`

### Legacy Backend

Working directory: `apps/legacy-backend`

Development:

```bash
npm run dev
```

Expected URL from current `.env`:

- `http://localhost:5000`

## Current API Surface

Laravel routes currently defined in `apps/core-backend/routes/web.php`:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Express routes currently mounted under `/api/v1`:

- `GET /api/v1/students`
- `GET /api/v1/lecturers`
- `GET /api/v1/departments`

Common response envelope observed in both backends:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": null
}
```

Error shape:

```json
{
  "success": false,
  "message": "Error",
  "errors": null
}
```

See the detailed docs:

- [AGENTS.md](AGENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Database](docs/DATABASE.md)
- [Tasks](docs/TASKS.md)
- [Decisions](docs/DECISIONS.md)

## Known Unclear Points

- Laravel API routes are currently defined in `routes/web.php` instead of a dedicated `routes/api.php`. This is code-accurate, but intent is not documented. `TODO: verify`
- Legacy backend has a development script but no explicit production `start` script. `TODO: verify`
