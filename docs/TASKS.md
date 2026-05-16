# Current Tasks

This file tracks realistic next-step work based on the current implementation.

Completed work that is already reflected in code has been removed from this list.

## High Priority

### 1. Define the production credential flow for imported users

Current state:

- imported users can be created from legacy data
- development currently uses simple predictable source passwords

Next step:

- replace the development-only password bootstrap with a production-safe onboarding flow
- `TODO: verify` whether this should be temporary passwords, reset links, or an admin-assisted activation flow

### 2. Expand backend coverage for existing frontend modules

Current state:

- authentication and tutorial periods are implemented end to end
- several role-based frontend pages are still placeholders

Next step:

- add matching backend APIs for the next approved feature modules
- likely candidates:
  - users
  - reports
  - settings
  - tutorial scheduling
  - lecturer assignments
  - tutorial registration
  - teaching schedule
  - study schedule

### 3. Add more automated tests around auth and domain behavior

Current state:

- the Laravel backend has feature coverage for the current auth/tutorial-period surface
- frontend behavior is not yet covered by automated tests

Next step:

- add frontend tests for auth bootstrap, route guards, and tutorial period form behavior
- add backend tests for more policy paths, status transitions, and session edge cases

## Medium Priority

### 4. Harden production session and cookie deployment guidance

Current state:

- local Sanctum configuration is documented
- production cookie/domain strategy is still environment-dependent

Next step:

- document production values for:
  - `FRONTEND_URL`
  - `SANCTUM_STATEFUL_DOMAINS`
  - `SESSION_DOMAIN`
  - `SESSION_SAME_SITE`
  - `SESSION_SECURE_COOKIE`

### 5. Add operational documentation for the three-app deployment model

Current state:

- each app can be started independently
- deployment and runtime wiring are not documented in one place

Next step:

- document build and runtime expectations for:
  - frontend hosting
  - Laravel app serving
  - legacy backend serving
  - inter-service environment variables

### 6. Review placeholder frontend features before implementation

Current state:

- route shells and layouts exist for multiple roles
- some pages are intentionally present as placeholders

Next step:

- confirm which role-specific modules should be implemented next
- remove or hide any routes that are not scheduled for near-term delivery

## Low Priority

### 7. Continue UI consistency cleanup

Current state:

- tutorial period forms already use shared date and modal primitives

Next step:

- apply the same simplified design system to upcoming feature screens
- keep date display and form patterns consistent across all modules
