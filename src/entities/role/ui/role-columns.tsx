'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Role } from '../types/role';

export const roleColumns: ColumnDef<Role, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description ?? '—',
  },
  {
    id: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.permissions.length} assigned
      </span>
    ),
  },
];
