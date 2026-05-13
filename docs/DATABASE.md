# Database

## Overview

This repository uses two database systems for different responsibilities:

- MySQL for the Laravel core backend
- SQL Server for legacy academic data exposed by the Express backend

The repo also includes Laravel support for other connection types such as SQLite and SQL Server, but the current Laravel runtime `.env` selects MySQL.

## Database Ownership

### Laravel / MySQL

Current connection source:

- `apps/core-backend/config/database.php`
- `apps/core-backend/.env`

Observed current runtime values:

- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=tutoring_db`

Laravel is currently responsible for:

- application users
- sessions
- cache tables
- job tables
- Sanctum personal access tokens

### Express / SQL Server

Current connection source:

- `apps/legacy-backend/src/config/database.ts`
- `apps/legacy-backend/.env`

Observed current runtime values:

- SQL Server host from `DB_SERVER`
- port `1433`
- database `EDU_NUCE`

Express is currently responsible for:

- read access to legacy academic tables
- translating SQL Server rows into API response objects

## Laravel Schema

Observed migration files:

- `0001_01_01_000000_create_users_table.php`
- `0001_01_01_000001_create_cache_table.php`
- `0001_01_01_000002_create_jobs_table.php`
- `2026_05_11_162139_create_personal_access_tokens_table.php`

### `users`

Columns detected:

- `id`
- `username` unique
- `password_hash`
- `role`
- `student_id` nullable
- `lecturer_id` nullable
- `department_id` nullable
- `created_at`
- `updated_at`

Observed model:

- `app/Models/User.php`

Important behavior:

- the auth password field is mapped to `password_hash`
- `role` is cast to `App\Enums\UserRole`

Current enum values:

- `1`: `ADMIN`
- `2`: `DEPARTMENT`
- `3`: `LECTURER`
- `4`: `STUDENT`

### `sessions`

Columns detected:

- `id`
- `user_id`
- `ip_address`
- `user_agent`
- `payload`
- `last_activity`

Reason:

- Laravel session driver is currently `database`

### `cache`

Columns detected:

- `key`
- `value`
- `expiration`

### `cache_locks`

Columns detected:

- `key`
- `owner`
- `expiration`

### `jobs`

Columns detected:

- `id`
- `queue`
- `payload`
- `attempts`
- `reserved_at`
- `available_at`
- `created_at`

### `job_batches`

Columns detected:

- `id`
- `name`
- `total_jobs`
- `pending_jobs`
- `failed_jobs`
- `failed_job_ids`
- `options`
- `cancelled_at`
- `created_at`
- `finished_at`

### `failed_jobs`

Columns detected:

- `id`
- `uuid`
- `connection`
- `queue`
- `payload`
- `exception`
- `failed_at`

### `personal_access_tokens`

Columns detected:

- `id`
- `tokenable_type`
- `tokenable_id`
- `name`
- `token`
- `abilities`
- `last_used_at`
- `expires_at`
- `created_at`
- `updated_at`

Note:

- Sanctum is installed, but the current frontend auth flow appears to use session/cookie auth rather than personal access tokens. `TODO: verify`

## Legacy SQL Server Usage

The repo does not contain SQL Server migration files. The following usage is inferred only from repository query code.

### Table: `DT_SinhVien`

Referenced by:

- `src/repositories/StudentRepository.ts`

Observed selected columns:

- `Id`
- `MaSinhVien`
- `NgaySinh2`
- `NgayNhapHoc`
- `QuocTich`

### Table: `DM_GiangVien`

Referenced by:

- `src/repositories/LecturerRepository.ts`

Observed selected columns:

- `Id`
- `MaGiangVien`
- `NgaySinh`
- `IsChamDutHopDong`

### Table: `TMP_DsBoMonKhoa`

Referenced by:

- `src/repositories/DepartmentRepository.ts`

Observed selected columns:

- `Id`
- `TenBoMon`

## Cross-Database Relationship Pattern

The current design links Laravel users to legacy entities by identifier fields rather than foreign keys across systems.

Observed fields in Laravel `users`:

- `student_id`
- `lecturer_id`
- `department_id`

This indicates an application-level relationship to SQL Server-backed entities, not a direct DB-level join.

## Legacy Import Behavior

Laravel includes a legacy user import command:

```bash
php artisan import:legacy-users
```

Observed import behavior:

- students are imported from legacy `/students`
- lecturers are imported from legacy `/lecturers`
- departments are imported from legacy `/departments`
- Laravel usernames are derived from legacy codes or department IDs
- passwords are derived from DOB strings or fallback values

Observed default password behavior:

- student/lecturer password: DOB with `/` removed when available
- fallback password: `1`
- department username format: `bm<department_id>`
- department password: `1`

The security and business rationale for these defaults is not documented in the repo. `TODO: verify`

## Connection Notes

### Laravel Supported Connections

Detected in `config/database.php`:

- `sqlite`
- `mysql`
- `mariadb`
- `pgsql`
- `sqlsrv`

Current runtime choice from `.env`:

- `mysql`

### Express SQL Server Connection

Detected in `src/config/database.ts`:

- Knex client: `mssql`
- `encrypt: false`
- `trustServerCertificate: true`

The intended production-grade SQL Server security settings are not documented. `TODO: verify`
