# API

This document describes the current API contract in the repository.

## Scope

There are two API layers:

- Public application API: Laravel in `apps/core-backend`
- Internal legacy data API: Express in `apps/legacy-backend`

The frontend talks only to the Laravel API.

## API Conventions

### Base paths

- Laravel public API: `/api/v1/...`
- Sanctum CSRF bootstrap: `/sanctum/csrf-cookie`
- Legacy internal API: `/api/v1/...` on the Express service

### Response envelope

Successful responses:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": null
}
```

Standard errors:

```json
{
  "success": false,
  "message": "Error message",
  "data": null,
  "meta": null
}
```

Validation errors:

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "data": null,
  "meta": null,
  "errors": {
    "registrationStartAt": [
      "The registrationStartAt field is required."
    ]
  }
}
```

### Naming contract

- Public Laravel API requests use camelCase.
- Public Laravel API responses use camelCase.
- Database columns remain snake_case internally.
- Laravel Form Requests normalize incoming camelCase to internal snake_case before validation.

## Authentication

The SPA uses Sanctum session authentication with cookies.

### Required browser flow

1. `GET /sanctum/csrf-cookie`
2. `POST /api/v1/auth/login`
3. Authenticated requests with cookies and CSRF header
4. `GET /api/v1/auth/me` on app startup to restore session state
5. `POST /api/v1/auth/logout` to invalidate the session

### Frontend client requirements

- `withCredentials: true`
- `withXSRFToken: true`
- `xsrfCookieName: XSRF-TOKEN`
- `xsrfHeaderName: X-XSRF-TOKEN`

### Auth endpoints

#### `POST /api/v1/auth/login`

Request:

```json
{
  "username": "admin",
  "password": "secret"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  },
  "meta": null
}
```

Notes:

- Route uses `web` middleware and `throttle:login`.
- Session is regenerated after successful login.

#### `GET /api/v1/auth/me`

Response:

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  },
  "meta": null
}
```

#### `POST /api/v1/auth/logout`

Response:

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null,
  "meta": null
}
```

Notes:

- Uses the `web` guard for logout.
- Invalidates the current session.
- Regenerates the CSRF token.

## Tutorial Period API

All tutorial period routes require `auth:sanctum`.

### Resource shape

```json
{
  "id": 1,
  "academicPeriodId": 20261,
  "academicPeriod": {
    "id": 20261,
    "name": "Legacy Period 20261"
  },
  "title": "Đợt phụ đạo học kỳ 1",
  "description": "Mô tả đợt phụ đạo",
  "registrationStartAt": "2026-05-18 00:00:00",
  "registrationEndAt": "2026-05-23 00:00:00",
  "studyStartAt": "2026-06-01 00:00:00",
  "studyEndAt": "2026-06-30 00:00:00",
  "status": "DRAFT",
  "createdBy": {
    "id": 1,
    "username": "admin"
  },
  "createdAt": "2026-05-17 09:00:00",
  "updatedAt": "2026-05-17 09:00:00",
  "permissions": {
    "canEdit": true,
    "canDelete": true,
    "canOpen": true,
    "canCancel": true
  }
}
```

### `GET /api/v1/tutorial-periods`

Supported query params:

- `page`
- `limit`
- `search`
- `status`
- `sortBy`
- `sortOrder`

Example:

```http
GET /api/v1/tutorial-periods?page=1&limit=10&sortBy=registrationStartAt&sortOrder=desc&search=phu%20dao&status=OPEN
```

Allowed `sortBy` values:

- `id`
- `academicPeriodId`
- `title`
- `registrationStartAt`
- `registrationEndAt`
- `studyStartAt`
- `studyEndAt`
- `status`
- `createdAt`
- `updatedAt`

Allowed `status` values:

- `DRAFT`
- `OPEN`
- `ASSIGNING`
- `ONGOING`
- `CLOSED`
- `CANCELLED`

Notes:

- `status` is the only workflow field exposed by the API.
- `status` is stored in MySQL and updated manually or automatically depending on the workflow rule.
- `academicPeriodId` stores the selected legacy `DM_Dot.Id` value.
- `academicPeriod` is enriched by Laravel from the legacy periods API when available.

Response:

```json
{
  "success": true,
  "message": "Tutorial periods retrieved successfully",
  "data": [
    {
      "id": 1,
      "academicPeriodId": 20261,
      "academicPeriod": {
        "id": 20261,
        "name": "Legacy Period 20261"
      },
      "title": "Đợt phụ đạo học kỳ 1",
      "description": "Mô tả đợt phụ đạo",
      "registrationStartAt": "2026-05-18 00:00:00",
      "registrationEndAt": "2026-05-23 00:00:00",
      "studyStartAt": "2026-06-01 00:00:00",
      "studyEndAt": "2026-06-30 00:00:00",
      "status": "OPEN",
      "createdBy": {
        "id": 1,
        "username": "admin"
      },
      "createdAt": "2026-05-17 09:00:00",
      "updatedAt": "2026-05-17 09:00:00",
      "permissions": {
        "canEdit": false,
        "canDelete": false,
        "canOpen": false,
        "canCancel": true
      },
    }
  ],
  "meta": {
    "total": 1,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 1
  }
}
```

### `GET /api/v1/tutorial-periods/{id}`

Returns a single tutorial period resource.

### `GET /api/v1/legacy/periods`

Returns the legacy academic period list used to populate tutorial period form options.

Response:

```json
{
  "success": true,
  "message": "Legacy periods retrieved successfully",
  "data": [
    {
      "id": 20261,
      "name": "Legacy Period 20261"
    }
  ]
}
```

### `POST /api/v1/tutorial-periods`

Request:

```json
{
  "academicPeriodId": 20261,
  "title": "Đợt phụ đạo học kỳ 1",
  "description": "Mô tả đợt phụ đạo",
  "registrationStartAt": "2026-05-18",
  "registrationEndAt": "2026-05-23",
  "studyStartAt": "2026-06-01",
  "studyEndAt": "2026-06-30"
}
```

Notes:

- New tutorial periods are always created with stored status `DRAFT`.
- `createdBy` is derived from the authenticated user.
- The API accepts camelCase input and validates internally against snake_case model fields.

### `PUT /api/v1/tutorial-periods/{id}` or `PATCH /api/v1/tutorial-periods/{id}`

Request fields are the same as create.

- `PUT` or `PATCH` can be used.
- Update validation supports partial payloads.
- Normal editing is allowed only while the tutorial period is in `DRAFT`.

### `PATCH /api/v1/tutorial-periods/{id}/open`

Moves a tutorial period from `DRAFT` to `OPEN`.

Rules:

- only `DRAFT` records can be opened
- complete and valid registration/study dates are required

### `PATCH /api/v1/tutorial-periods/{id}/cancel`

Cancels a tutorial period.

Rules:

- `CLOSED` and `CANCELLED` records cannot be cancelled
- `DRAFT`, `OPEN`, `ASSIGNING`, and `ONGOING` can be cancelled

### `DELETE /api/v1/tutorial-periods/{id}`

Response:

```json
{
  "success": true,
  "message": "Tutorial period deleted successfully",
  "data": null,
  "meta": null
}
```

## Authorization

Tutorial period actions are protected by `TutorialPeriodPolicy`.

Controller authorization checks currently enforce:

- `viewAny`
- `view`
- `create`
- `update`
- `delete`
- `open`
- `cancel`

## Tutorial Period Status Workflow

Stored statuses:

- `DRAFT`
- `OPEN`
- `ASSIGNING`
- `ONGOING`
- `CLOSED`
- `CANCELLED`

Transitions:

- `DRAFT --manual open--> OPEN`
- `OPEN --auto after registrationEndAt--> ASSIGNING`
- `ASSIGNING --auto at studyStartAt--> ONGOING`
- `ONGOING --auto after studyEndAt--> CLOSED`
- `DRAFT`, `OPEN`, `ASSIGNING`, and `ONGOING --manual cancel--> CANCELLED`

Automatic transitions are performed by the scheduled Laravel command:

```bash
php artisan tutorial-periods:update-statuses
```

## Internal Legacy API

The Express service is not a browser-facing auth API. It is used by Laravel for legacy data reads.

Current internal endpoints:

- `GET /api/v1/legacy/periods`
- `GET /api/v1/students`
- `GET /api/v1/lecturers`
- `GET /api/v1/departments`

Characteristics:

- API key protected
- read-oriented
- backed by SQL Server
- intended for service-to-service access from Laravel
