'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Permission } from '../types/permission';

export const permissionColumns: ColumnDef<Permission, unknown>[] = [
  { accessorKey: 'code', header: 'Code' },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description ?? '—',
  },
];
