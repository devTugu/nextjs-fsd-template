# ADR 001: Feature-Sliced Design

## Status

Accepted

## Context

The admin console must scale as new RBAC resources and UI flows are added. A flat `components/` folder leads to unclear dependencies and duplicated API logic.

## Decision

Adopt **Feature-Sliced Design** with layers: `app`, `widgets`, `features`, `entities`, `shared`, `processes`.

### Import rules

```
app → widgets, features, entities, shared, processes
widgets → features, entities, shared
features → entities, shared
entities → shared only
```

### Slice examples

| Slice | Location | Responsibility |
|-------|----------|----------------|
| `user` entity | `entities/user` | Types, Zod schemas, TanStack Query hooks, table columns |
| `users` feature | `features/users` | `UsersTable`, `UserManageSheet` |
| `data-table` widget | `widgets/data-table` | Generic table + pagination + toolbar |

Pages in `app/` remain thin and only compose feature exports.

## Consequences

### Positive

- Predictable placement for new code
- Entities reusable across multiple features
- Easier onboarding for teams familiar with FSD

### Negative

- More folders than a small demo app needs
- Requires discipline to avoid cross-feature imports

## References

- [Feature-Sliced Design](https://feature-sliced.design/)
- [docs/ARCHITECTURE.md](../ARCHITECTURE.md)
