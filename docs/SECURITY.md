# Security

## Authentication

- **Access token**: JWT stored in `localStorage`; sent as `Authorization: Bearer <token>`.
- **Refresh token**: Stored in `localStorage`; used by Axios interceptor on `401` to obtain a new access token.
- **Cookie**: `accessToken` set on login for Next.js middleware route protection (`middleware.ts`).
- **Logout**: Clears storage and cookie; calls API `POST /auth/logout` when available.

## Token refresh

- Automatic refresh on `401` (single retry per request).
- Proactive refresh via `TokenRefreshScheduler` before access token expiry.
- Failed refresh → redirect to `/sign-in`.

## Authorization (RBAC)

- `GET /auth/me` returns `roles[]` and `permissionCodes[]`.
- UI gates buttons and sheets with `useAuthPermissions().can(PERMISSION_CODES.*)`.
- `SUPER_ADMIN` role bypasses permission checks in the UI (API still enforces server-side).

Never rely on UI gating alone — the API must always validate permissions.

## Route protection

[`middleware.ts`](../middleware.ts) checks for `accessToken` cookie on `/dashboard/*` routes and redirects unauthenticated users to `/sign-in`.

Client-side `AuthGuard` provides a second layer after hydration.

## HTTP client

- Base URL from `NEXT_PUBLIC_API_BASE_URL` only.
- NestJS envelope unwrapped in `shared/api/client.ts`.
- `403` responses show a permission-denied toast (no silent failures).

## Secrets

- **Never** commit `.env.local` or real credentials.
- Only `NEXT_PUBLIC_*` vars belong in the frontend; no API secrets in Next.js env.
- JWT secrets live on the API only.

## Headers

Security headers in [`next.config.ts`](../next.config.ts):

- `X-Frame-Options: DENY` — clickjacking mitigation
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Production checklist

- [ ] HTTPS everywhere (frontend + API)
- [ ] `CORS_ORIGIN` locked to production frontend URL
- [ ] API `SWAGGER_ENABLED=false`
- [ ] Strong JWT secrets on API (32+ chars), rotated per environment
- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] Regular `npm audit` on both frontend and backend repos
- [ ] Review RBAC seeds before production (`SUPER_ADMIN` assignment)

## Reporting issues

If you discover a security vulnerability, please report it privately to the repository owner rather than opening a public issue.
