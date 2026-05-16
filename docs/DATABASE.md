# Database

This repository uses two data stores:

- MySQL for Laravel-managed application data
- SQL Server for legacy read-only data exposed through the Express service

## MySQL Ownership

The Laravel application owns:

- authentication users
- sessions
- tutorial periods
- tutorial period status logs
- notifications
- framework support tables

## Naming Strategy

Database tables and columns remain snake_case.

Examples:

- `start_reg_date`
- `end_study_date`
- `created_by`
- `password_hash`

The public Laravel API converts these to camelCase in API Resources.

Examples:

- `startRegDate`
- `endStudyDate`
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
- `title`
- `description`
- `start_reg_date`
- `end_reg_date`
- `start_study_date`
- `end_study_date`
- `status`
- `opened_at`
- `assigned_at`
- `started_at`
- `closed_at`
- `created_by`
- `created_at`
- `updated_at`
- `deleted_at`

Indexes:

- `status`
- `start_reg_date, end_reg_date`
- `start_study_date, end_study_date`

Notes:

- The date range columns were originally `date` columns.
- Migration `2026_05_16_000001_update_tutorial_period_dates_to_datetime.php` changed them to `datetime` to preserve time precision.
- The model now casts them as `datetime`.

### `tutorial_period_status_logs`

Audit trail for tutorial period state transitions.

Important columns:

- `id`
- `tutorial_period_id`
- `old_status`
- `new_status`
- `changed_by`
- `note`
- `created_at`
- `updated_at`

Indexes:

- `tutorial_period_id`
- `tutorial_period_id, created_at`
- `old_status, new_status`

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
