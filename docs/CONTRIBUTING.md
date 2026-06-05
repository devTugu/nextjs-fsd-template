# Contributing

## Architecture

Follow Feature-Sliced Design import rules:

```
app → widgets, features, entities, shared, processes
widgets → features, entities, shared
features → entities, shared
entities → shared only
```

See [ADR 001](adr/001-feature-sliced-design.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

## Adding a CRUD feature

1. **Entity** — types, Zod schemas, API queries/mutations in `src/entities/<name>/`
2. **Feature UI** — table + manage sheet in `src/features/<name>/ui/`
3. **Widget reuse** — prefer `AdminFormSheet`, `DataTable`, `PermissionPicker` where applicable
4. **Route** — thin page in `app/dashboard/<name>/page.tsx` wrapped in `Suspense` if using `useSearchParams`
5. **Permissions** — gate actions with `useAuthPermissions()` and `PERMISSION_CODES`
6. **E2E** — extend `e2e/` for critical paths when behavior is non-trivial

## Code style

- TypeScript strict; avoid `any`
- English for UI copy, docs, and commit messages
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- Prefer composition over large monolithic components (max ~300 lines per file)

## Running locally

```bash
# Terminal 1 — API (nestjs-fsd-template)
APP_PORT=3001 npm run start:dev

# Terminal 2 — Frontend
cp .env.example .env.local
npm install
npm run dev
```

Default admin after API seed: `admin@example.com` / `Admin123!`

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e   # both API and Next must be running
```

## Updating gallery screenshots

Replace images under `docs/gallery/` after meaningful UI changes:

- `sign-in.png` — `/sign-in`
- `dashboard-overview.png` — `/dashboard`
- `users-create-sheet.png` — `/dashboard/users` with Create user sheet open
- `roles-create-sheet.png` — `/dashboard/roles` with Create role sheet open
- `permissions-create-sheet.png` — `/dashboard/permissions` with Create permission sheet open

Keep filenames stable so README links do not break.

## Pull requests

- Keep PRs focused (one feature or fix per PR when possible)
- Ensure CI passes (lint, typecheck, build)
- Update docs when adding routes, env vars, or architectural decisions
