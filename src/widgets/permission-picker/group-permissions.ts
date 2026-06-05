import type { Permission } from '@/entities/permission';

export interface GroupedPermissions {
  users: Permission[];
  roles: Permission[];
  permissions: Permission[];
}

export function groupPermissions(items: Permission[]): GroupedPermissions {
  const groups: GroupedPermissions = {
    users: [],
    roles: [],
    permissions: [],
  };

  for (const item of items) {
    if (item.code.startsWith('USER_')) {
      groups.users.push(item);
    } else if (item.code.startsWith('ROLE_')) {
      groups.roles.push(item);
    } else if (item.code.startsWith('PERMISSION_')) {
      groups.permissions.push(item);
    }
  }

  return groups;
}

export function filterPermissions(
  items: Permission[],
  query: string
): Permission[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter(
    (item) =>
      item.code.toLowerCase().includes(normalized) ||
      (item.description?.toLowerCase().includes(normalized) ?? false)
  );
}
