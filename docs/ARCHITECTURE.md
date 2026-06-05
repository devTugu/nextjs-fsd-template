# Architecture

## Overview

This template is a **Feature-Sliced Design (FSD)** admin console. It consumes a versioned NestJS RBAC API and keeps UI concerns separated by slice and layer.

## Layer responsibilities

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| `app/` | Routing, layouts, page composition | `app/dashboard/users/page.tsx` |
| `widgets/` | Reusable composite blocks | `data-table`, `admin-form-sheet`, `app-sidebar` |
| `features/` | User scenarios and flows | `auth`, `users`, `roles`, `permissions` |
| `entities/` | Business nouns + API | `user`, `role`, `permission` hooks and types |
| `shared/` | Framework-agnostic utilities | API client, UI kit, config, hooks |
| `processes/` | App-wide cross-cutting | route constants, middleware helpers |

## Data flow

```
Page (app)
  → Feature UI (table, sheet)
    → Entity hook (TanStack Query)
      → shared/api (Axios + interceptors)
        → NestJS /api/v1/*
```

## Key widgets

### `AdminFormSheet`

Right-side sheet shell with sticky header, scrollable body, and footer (Cancel / Save). Used by all create/edit flows.

### `PermissionPicker`

Grouped permission selector (Users / Roles / Permissions) with search, select-all per group, and selection summary.

### `DataTable`

Server-driven pagination via URL search params (`?page&limit&search`). Toolbar debounces search without navigation loops.

## Auth flow

1. User signs in → tokens stored in `localStorage` + `accessToken` httpOnly-style cookie for middleware.
2. Axios attaches `Authorization: Bearer <accessToken>`.
3. On `401`, refresh token is exchanged once; on failure, user is redirected to `/sign-in`.
4. `TokenRefreshScheduler` proactively refreshes before expiry.
5. `AuthGuard` wraps dashboard layout; loads `/auth/me` for `permissionCodes`.

## RBAC gating

`useAuthPermissions().can(code)` checks:

1. User has `SUPER_ADMIN` role → allow all
2. Else `permissionCodes` from `/auth/me` must include the code

## File naming

- Components: `PascalCase.tsx` (`user-manage-sheet.tsx` exports `UserManageSheet`)
- Hooks/utils: `kebab-case.ts`
- One primary export per file where possible

## Related ADRs

- [001 — Feature-Sliced Design](adr/001-feature-sliced-design.md)
- [002 — API client and auth](adr/002-api-client-and-auth.md)
- [003 — Admin sheet UX](adr/003-admin-sheet-ux.md)
