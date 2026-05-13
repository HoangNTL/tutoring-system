# API

## Overview

This document describes the currently detected API behavior from the codebase. It does not assume undocumented endpoints.

There are two backend APIs in this repository:

- Laravel API in `apps/core-backend`
- Express API in `apps/legacy-backend`

The frontend currently targets Laravel, and Laravel targets Express for some data retrieval.

## Shared Response Convention

Both backends currently use a similar JSON response shape.

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": null
}
```

Error:

```json
{
  "success": false,
  "message": "Error",
  "errors": null
}
```

Observed implementation sources:

- Laravel: `app/Traits/ApiResponse.php`
- Express: `src/utils/ApiResponse.ts`

## Versioning

Current code uses `v1` route prefixes:

- Laravel: `/api/v1/...`
- Express: `/api/v1/...`

## Laravel API

Source of current routes:

- `apps/core-backend/routes/api.php`

### `POST /api/v1/auth/login`

Purpose:

- authenticate a user using `username` and `password`

Request body:

```json
{
  "username": "string",
  "password": "string"
}
```

Validation source:

- `app/Http/Requests/Auth/LoginRequest.php`

Auth behavior:

- uses `Auth::attempt(...)`
- maps password checking to `User::getAuthPassword()` which returns `password_hash`
- regenerates the session on success

Success response shape:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "example",
      "role": 4,
      "studentId": 10,
      "lecturerId": null,
      "departmentId": null
    }
  },
  "meta": null
}
```

Failure behavior:

- returns `401` with message `Invalid credentials`

### `POST /api/v1/auth/logout`

Purpose:

- log out the current user

Current behavior:

- calls `Auth::logout()`
- invalidates the session
- regenerates the CSRF token

Frontend handling:

- logout is triggered from the UserMenu
- clears React Query cache and Redux auth state
- clears axios `Authorization` header
- clears common token storage keys if present (e.g., `authToken`, `token`). `TODO: verify`

### `GET /api/v1/auth/me`

Middleware:

- `auth:sanctum`

Purpose:

- return the current authenticated user

Response user fields:

- `id`
- `username`
- `role`
- `studentId`
- `lecturerId`
- `departmentId`

Serialization source:

- `app/Http/Resources/UserResource.php`

## Sanctum / Session Auth

Observed frontend usage:

- frontend first calls `GET /sanctum/csrf-cookie`
- frontend then posts login credentials
- axios uses `withCredentials: true`

Relevant frontend files:

- `apps/frontend/src/api/axiosInstance.ts`
- `apps/frontend/src/api/auth.api.ts`
- `apps/frontend/src/constants/api.ts`

Observed Sanctum/session configuration:

- guard: `web`
- session driver: `database`
- stateful domain in current `.env`: `localhost:5173`

## Express API

Mount path:

- `app.use('/api', rootRouter)`
- `rootRouter.use('/v1', v1Router)`

This yields the following endpoint prefix:

- `/api/v1`

### Authentication

All Express routes are currently protected by API key middleware.

Required header:

```http
x-api-key: <CORE_BACKEND_API_KEY>
```

Behavior:

- missing configured secret returns `500`
- missing or invalid client key returns `403`

Source:

- `apps/legacy-backend/src/middlewares/authKey.ts`

### `GET /api/v1/students`

Purpose:

- retrieve paginated student data

Query parameters:

- `page`
- `limit`

Returned fields:

- `id`
- `studentCode`
- `dateOfBirth`

Source:

- `src/repositories/StudentRepository.ts`

Current filter logic:

- nationality is non-empty
- nationality is not `Việt Nam`
- `YEAR(NgayNhapHoc) + 6 > 2024`

This appears to be domain-specific filtering logic, but no rationale is documented in the repo. `TODO: verify`

### `GET /api/v1/lecturers`

Purpose:

- retrieve paginated lecturer data

Returned fields:

- `id`
- `lecturerCode`
- `dateOfBirth`

Current filter logic:

- `IsChamDutHopDong = 0 OR IsChamDutHopDong IS NULL`

Rationale is not documented in the repo. `TODO: verify`

### `GET /api/v1/departments`

Purpose:

- retrieve paginated department data

Returned fields:

- `id`
- `name`

## Pagination Convention

Observed pagination metadata:

```json
{
  "total": 100,
  "perPage": 10,
  "currentPage": 1,
  "lastPage": 10
}
```

Laravel source:

- `app/Traits/PaginationHelper.php`

Express source:

- `src/utils/PaginationHelper.ts`

## Error Handling

### Laravel

Observed behavior in `bootstrap/app.php`:

- `/api/*` exceptions are forced to JSON
- validation exceptions return `422`
- generic API exceptions return JSON with `success`, `message`, and optional `errors`

### Express

Observed behavior:

- Joi query validation returns `400`
- global error handler logs request context and returns JSON

Source:

- `src/middlewares/validate.ts`
- `src/middlewares/errorHandler.ts`

## Current Unclear Points

- It is not documented whether Express is intended for internal-only use or also for external clients. Current code suggests internal use through Laravel. `TODO: verify`
