# Database

This repository uses two data stores:

- MySQL for Laravel-managed application data
- SQL Server for legacy read-only data exposed through the Express service

## MySQL Ownership

The Laravel application owns:

- authentication users
- sessions
- tutorial periods
- notifications
- framework support tables

## Naming Strategy

Database tables and columns remain snake_case.

Examples:

- `registration_start_at`
- `study_end_at`
- `created_by`
- `password_hash`

The public Laravel API converts these to camelCase in API Resources.

Examples:

- `registrationStartAt`
- `studyEndAt`
- `createdBy`
- `createdAt`

This means:

- database schema stays idiomatic for Laravel and SQL
- backend internals stay aligned with Eloquent
- frontend consumes a consistent camelCase API contract

## Core MySQL Tables

### `users`

Primary authentication table.

Important columns:

- `id`
- `username`
- `password_hash`
- `role`
- `student_id`
- `lecturer_id`
- `department_id`
- `created_at`
- `updated_at`

Notes:

- Passwords are stored in `password_hash`.
- User role is stored as a numeric enum value internally.
- Imported legacy users currently use simple predictable source passwords in development. `TODO: verify` the production credential bootstrap policy before deployment.

### `sessions`

Laravel session storage table.

Important columns:

- `id`
- `user_id`
- `ip_address`
- `user_agent`
- `payload`
- `last_activity`

This table is required for the current Sanctum session-based SPA flow because the app uses `SESSION_DRIVER=database`.

### `tutorial_periods`

Main tutoring period table.

Important columns:

- `id`
- `academic_period_id`
- `title`
- `description`
- `registration_start_at`
- `registration_end_at`
- `study_start_at`
- `study_end_at`
- `status`
- `created_by`
- `created_at`
- `updated_at`
- `deleted_at`

Indexes:

- `status`
- `academic_period_id`
- `registration_start_at, registration_end_at`
- `study_start_at, study_end_at`

Notes:

- The date range columns were originally `date` columns.
- Migration `2026_05_16_000001_update_tutorial_period_dates_to_datetime.php` changed them to `datetime` to preserve time precision.
- Migration `2026_06_03_000001_update_tutorial_periods_for_time_driven_status.php` renamed the tutorial period datetime columns and removed the legacy transition timestamp columns.
- `academic_period_id` stores the selected legacy SQL Server `DM_Dot.Id` value.
- The stored `status` column is the tutorial period workflow source of truth.
- Current stored status values are:
  - `DRAFT`
  - `OPEN`
  - `ASSIGNING`
  - `ONGOING`
  - `CLOSED`
  - `CANCELLED`
- Status is updated in two ways:
  - manual admin actions for `DRAFT -> OPEN` and allowed cancellation
  - scheduled Laravel automation for `OPEN -> ASSIGNING -> ONGOING -> CLOSED`
- There is no separate computed `phase` column in MySQL.

### `notifications`

Notification storage for user-facing system events.

Important columns:

- `id`
- `user_id`
- `type`
- `title`
- `message`
- `related_type`
- `related_id`
- `is_read`
- `read_at`
- `created_at`
- `updated_at`

Indexes:

- `user_id, is_read`
- `type`
- `related_type, related_id`
- `read_at`

### Framework support tables

- `cache`
- `cache_locks`
- `jobs`
- `job_batches`
- `failed_jobs`
- `personal_access_tokens`

Notes:

- `personal_access_tokens` exists because Sanctum is installed.
- The current SPA auth flow uses sessions, not personal access tokens.

## SQL Server Ownership

SQL Server remains outside the Laravel application schema.

The Express legacy backend reads from SQL Server and exposes internal APIs for:

- students
- lecturers
- departments

Laravel consumes those endpoints and normalizes legacy data before it reaches the frontend.

## Timezone Notes

The Laravel app timezone is set to `Asia/Ho_Chi_Minh`.

Practical behavior:

- Laravel writes application timestamps in Vietnam time
- frontend display utilities also format dates in Vietnam time
- MySQL `datetime` columns are timezone-naive, so application consistency depends on Laravel and the UI using the same timezone assumptions
