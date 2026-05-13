# Tasks

## Purpose

This document lists common repository tasks based on scripts and commands already present in the codebase.

It does not introduce new tooling or workflows.

## Start the Frontend

Working directory:

```text
apps/frontend
```

Command:

```bash
npm run dev
```

Expected default dev URL:

- `http://localhost:5173`

Notes:

- frontend API base URL comes from `VITE_API_BASE_URL`
- current frontend `.env` points to `http://localhost:8000`

## Start the Laravel Core Backend

Working directory:

```text
apps/core-backend
```

Minimal API server:

```bash
php artisan serve
```

Expected default URL:

- `http://localhost:8000`

Optional frontend asset watcher for the Laravel app itself:

```bash
npm run dev
```

Combined workflow already defined in `composer.json`:

```bash
composer dev
```

Observed `composer dev` responsibilities:

- `php artisan serve`
- `php artisan queue:listen --tries=1 --timeout=0`
- `php artisan pail --timeout=0`
- `npm run dev`

## Start the Legacy Express Backend

Working directory:

```text
apps/legacy-backend
```

Command:

```bash
npm run dev
```

Observed startup entry:

- `src/app.ts`

Expected URL from current `.env`:

- `http://localhost:5000`

Note:

- no explicit `start` production script was detected in `package.json`. `TODO: verify`

## Run the Full Local Stack

Suggested current order based on code dependencies:

1. Start `apps/legacy-backend`
2. Start `apps/core-backend`
3. Start `apps/frontend`

Reason:

- Laravel depends on the legacy Express service for some data
- frontend depends on Laravel for auth and API calls

## Authenticate Through the Frontend

Observed flow:

1. Open the frontend
2. Frontend requests Sanctum CSRF cookie from Laravel
3. Submit `username` and `password`
4. Frontend loads current user via `/api/v1/auth/me`

Relevant files:

- `apps/frontend/src/api/auth.api.ts`
- `apps/core-backend/app/Http/Controllers/Api/V1/AuthController.php`

## Import Legacy Users Into Laravel

Working directory:

```text
apps/core-backend
```

Command:

```bash
php artisan import:legacy-users
```

Observed prerequisites:

- Laravel must be able to call the legacy backend
- legacy backend must be running and reachable
- Laravel service config must include the legacy backend API key

Observed import targets:

- students
- lecturers
- departments

## Build the Frontend

Working directory:

```text
apps/frontend
```

Command:

```bash
npm run build
```

## Build Laravel Frontend Assets

Working directory:

```text
apps/core-backend
```

Command:

```bash
npm run build
```

## Lint the Frontend

Working directory:

```text
apps/frontend
```

Command:

```bash
npm run lint
```

## Troubleshooting Order

When a request fails, inspect in this order:

1. frontend request path and base URL
2. Laravel route and middleware
3. Laravel legacy service config
4. Express route and API key middleware
5. SQL Server connectivity

## Current Known Gaps

- documented production startup path for Express is missing. `TODO: verify`
- root-level unified dev orchestration command was not found. `TODO: verify`
