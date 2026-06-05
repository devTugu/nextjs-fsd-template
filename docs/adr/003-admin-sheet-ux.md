# ADR 003: Admin Sheet UX

## Status

Accepted

## Context

Early CRUD flows used nested dropdown menus and centered dialogs. Assign/unassign required multiple clicks and caused dropdown + modal interaction bugs. Role permission selection used long unscannable checkbox grids.

## Decision

Replace create/edit flows with **right-side sheets** and consolidate related actions.

### `AdminFormSheet` widget

- Sticky header (title + description)
- Scrollable body
- Footer with Cancel / Save (`form` + `type="submit"` pattern)

### User management

Single `UserManageSheet` with:

- **Create mode** — email, password, active switch
- **Edit mode — Profile tab** — optional password, active switch
- **Edit mode — Roles tab** — badge list with remove confirm, select + Add for assign

Table actions: pencil (edit) and trash (delete) icons; role badges open Roles tab.

### Role management

`RoleManageSheet` + `PermissionPicker` widget:

- Search filter
- Groups: Users / Roles / Permissions
- Select-all per group
- Selection summary

### Delete flows

Destructive actions remain **AlertDialog** with explicit confirmation.

## Consequences

### Positive

- Fewer clicks for common admin tasks
- No dropdown-inside-dialog hacks
- Permission selection scales as seed list grows

### Negative

- Sheets use more horizontal space on small viewports (acceptable for admin console target)

## Gallery

See the README gallery (`users-create-sheet.png`, `roles-create-sheet.png`, `permissions-create-sheet.png`).
