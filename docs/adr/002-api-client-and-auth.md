# ADR 002: API Client and Authentication

## Status

Accepted

## Context

The NestJS API returns a wrapped envelope (`{ success, data, message }`), uses JWT access/refresh tokens, and enforces RBAC on the server. The frontend needs a consistent HTTP layer and session handling.

## Decision

### Axios client (`shared/api`)

- Single Axios instance with request/response interceptors.
- Unwrap Nest envelope in the client helper.
- Attach `Authorization: Bearer` from token storage on each request.
- On `401`: attempt refresh once, retry original request; on failure clear session and redirect to login.
- On `403`: show permission-denied toast.

### Token storage

- `accessToken` and `refreshToken` in `localStorage`.
- `accessToken` also written to a cookie for Next.js middleware (dashboard route guard).

### TanStack Query

- Entity-level hooks (`useUsers`, `useRoles`, …) own query keys and invalidation.
- Mutations invalidate list/detail keys after successful writes.

### Auth feature

- `login` / `logout` mutations
- `AuthGuard` for dashboard layout
- `useAuthPermissions` derived from `/auth/me`
- `TokenRefreshScheduler` for proactive refresh

## Consequences

### Positive

- One place to handle API errors and token lifecycle
- Entity hooks stay thin and testable
- Works with companion NestJS template without API changes

### Negative

- Dual storage (localStorage + cookie) must stay in sync on login/logout
- `NEXT_PUBLIC_API_BASE_URL` is public by design

## Configuration

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

API must set `CORS_ORIGIN=http://localhost:3000` in development.
