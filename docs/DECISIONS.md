# Technical Decisions

This document captures current technical decisions reflected in the codebase.

## 1. Laravel remains the public application API

Status: adopted

Laravel is the single browser-facing backend for:

- authentication
- validation
- authorization
- application orchestration
- MySQL-backed domain logic

Why:

- keeps browser auth, policy enforcement, and response contracts in one place
- prevents the frontend from depending directly on legacy SQL Server behavior
- allows Laravel to normalize legacy data before it reaches the UI

## 2. Legacy SQL Server access stays isolated in the Express service

Status: adopted

Legacy SQL Server access remains inside `apps/legacy-backend`.

Why:

- preserves separation between core application logic and legacy data access
- keeps SQL Server concerns out of the frontend and Laravel controllers
- allows API key protection and read-oriented endpoint design at the internal boundary

## 3. Sanctum is used in session-based SPA mode

Status: adopted

Authentication is based on:

- `/sanctum/csrf-cookie`
- cookie-backed session login
- `auth:sanctum`
- session restoration via `/api/v1/auth/me`

Why:

- aligns with first-party SPA usage
- avoids introducing token storage into the browser
- keeps logout and session invalidation aligned with Laravel defaults

## 4. Public API contract uses camelCase

Status: adopted

Laravel request and response contracts use camelCase.

Examples:

- `startRegDate`
- `sortBy`
- `createdBy`

Why:

- matches frontend TypeScript and React conventions
- removes repetitive mapping code in the frontend
- keeps the external contract consistent across query params, request bodies, and responses

## 5. Database schema stays snake_case

Status: adopted

MySQL tables and Eloquent attributes remain snake_case internally.

Why:

- preserves Laravel and SQL conventions
- avoids unnecessary schema churn
- allows API contract concerns to stay at the request/resource layer

## 6. Frontend no longer uses a response mapping layer for Laravel API data

Status: adopted

The previous frontend mapping layer for tutorial periods was removed.

Why:

- the Laravel API now returns camelCase directly
- domain types and API payloads align naturally
- fewer translation layers means less drift and less maintenance

## 7. Frontend is organized by feature, not by technical type alone

Status: adopted

Feature folders under `apps/frontend/src/features` own their pages, hooks, schema, and local API usage.

Why:

- scales better as more role-specific modules are added
- keeps related UI, validation, and feature logic together
- reduces cross-folder churn during feature work

## 8. Role-based layouts are selected from authenticated user role

Status: adopted

The frontend uses different layouts for:

- admin/department users
- lecturers
- students

Why:

- keeps navigation and information architecture aligned with user responsibilities
- avoids one oversized generic shell for all roles

## 9. TanStack Query is the primary server-state layer

Status: adopted

TanStack Query owns API fetching and cache behavior.

Redux is kept for authentication state and a small amount of global app state.

Why:

- query caching and invalidation are better handled by a dedicated server-state tool
- reduces custom loading/error synchronization code
- keeps Redux focused on app state rather than API state

## 10. shadcn/ui is the base UI system

Status: adopted

The frontend uses shadcn/ui components and shared wrappers for form and modal UI.

Why:

- provides composable primitives without locking the UI into a heavy theme layer
- fits the current admin-style application better than browser-native form controls alone
- supports consistent patterns such as `Calendar + Popover` date selection

## 11. Date display is handled only at the UI layer

Status: adopted

Backend APIs keep raw date and datetime values.
Frontend utilities format them for display in Vietnam time.

Why:

- keeps API payloads stable and machine-friendly
- avoids mixing display formatting concerns into persistence or transport layers
- lets the UI control presentation consistently
