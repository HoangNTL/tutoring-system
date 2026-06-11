# Tutoring System

Tutoring System is a three-app repository for managing tutoring periods, authentication, and legacy academic data access.

## Applications

| App | Path | Responsibility |
| --- | --- | --- |
| Frontend SPA | `apps/frontend` | React application for login, role-based navigation, and tutoring period UI |
| Core backend | `apps/core-backend` | Laravel API, Sanctum session auth, validation, orchestration, MySQL data |
| Legacy backend | `apps/legacy-backend` | Express API for read-only SQL Server access used by Laravel |

## Current Implementation Snapshot

- The public application API is served by Laravel under `/api/v1/...`.
- Authentication uses Laravel Sanctum with session cookies and CSRF protection.
- The public API contract uses camelCase for request and response fields.
- Tutorial period management is the main fully integrated feature today.
- Several frontend role-specific pages already exist, but many of them are UI placeholders until matching backend modules are implemented.

## Architecture Summary

1. The browser talks to the Laravel backend.
2. Laravel handles authentication, validation, authorization, and MySQL-backed domain logic.
3. Laravel calls the legacy Express service for some imported or legacy datasets.
4. The Express service reads from SQL Server and exposes internal versioned endpoints.

For a fuller system breakdown, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Authentication Flow

The SPA uses cookie-based Sanctum authentication:

1. `GET /sanctum/csrf-cookie`
2. `POST /api/v1/auth/login`
3. authenticated browser requests with `withCredentials: true`
4. `GET /api/v1/auth/me` to restore session state on reload
5. `POST /api/v1/auth/logout` to end the session

The frontend Axios client is configured with:

- `withCredentials: true`
- `withXSRFToken: true`
- `xsrfCookieName: 'XSRF-TOKEN'`
- `xsrfHeaderName: 'X-XSRF-TOKEN'`

## Frontend Structure

The frontend is organized by feature:

- `src/features/auth`
- `src/features/tutorial-period`
- `src/features/users`
- `src/features/reports`
- `src/features/settings`
- `src/features/tutorial-scheduling`
- `src/features/lecturer-assignments`
- `src/features/teaching-schedule`
- `src/features/tutorial-registration`
- `src/features/study-schedule`
- `src/features/profile`

Role-based layouts are selected from the authenticated user role:

- `ADMIN` and `DEPARTMENT` use the admin-style layout
- `LECTURER` uses the lecturer layout
- `STUDENT` uses the student layout

## Core API Surface

Currently implemented Laravel endpoints:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/legacy/periods`
- `GET /api/v1/tutorial-periods`
- `GET /api/v1/tutorial-periods/{id}`
- `POST /api/v1/tutorial-periods`
- `PATCH /api/v1/tutorial-periods/{id}/open`
- `PATCH /api/v1/tutorial-periods/{id}/cancel`
- `PUT /api/v1/tutorial-periods/{id}`
- `PATCH /api/v1/tutorial-periods/{id}`
- `DELETE /api/v1/tutorial-periods/{id}`

See [docs/API.md](docs/API.md) for request and response examples.

Tutorial period workflow currently uses one stored status field:

- `DRAFT --manual open--> OPEN --auto--> ASSIGNING --auto--> ONGOING --auto--> CLOSED`
- `DRAFT`, `OPEN`, `ASSIGNING`, and `ONGOING --manual cancel--> CANCELLED`

Automatic transitions run through the scheduled Laravel command `php artisan tutorial-periods:update-statuses`.

## Tech Stack

### Frontend

- React 19
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
- date-fns + date-fns-tz

### Core Backend

- Laravel 12
- Sanctum
- MySQL

### Legacy Backend

- Express 5
- TypeScript
- Knex
- SQL Server

## Local Setup

This repository does not provide a single root runner. Start each app from its own directory.

### 1. Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### 2. Core Backend

```bash
cd apps/core-backend
composer install
php artisan migrate
php artisan serve
```

### 3. Legacy Backend

```bash
cd apps/legacy-backend
npm install
npm run dev
```

If you do not have SQL Server locally yet, set `ALLOW_START_WITHOUT_DB=true` in `apps/legacy-backend/.env`. The legacy service will still boot and return empty fallback data for legacy-backed endpoints so the rest of the stack can run.

For a production-style legacy backend start:

```bash
cd apps/legacy-backend
npm run build
npm start
```

## Documentation Index

- [docs/API.md](docs/API.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATABASE.md](docs/DATABASE.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/TASKS.md](docs/TASKS.md)
- [AGENTS.md](AGENTS.md)
