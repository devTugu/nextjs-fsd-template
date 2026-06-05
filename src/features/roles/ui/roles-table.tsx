'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useRoles, type Role } from '@/entities/role';
import { roleColumns } from '@/entities/role/ui/role-columns';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { DataTable, DataTableToolbar, DataTableEmpty } from '@/widgets/data-table';
import { Button } from '@/shared/ui/button';
import { RoleManageSheet, type RoleSheetState } from './role-manage-sheet';
import { RoleDeleteDialog } from './role-delete-dialog';

export function RolesTable() {
  const { can } = useAuthPermissions();
  const { pagination, setPagination, queryParams } = useTableSearchParams();
  const { data, isLoading } = useRoles(queryParams);
  const [sheetState, setSheetState] = useState<RoleSheetState | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const columns = useMemo<ColumnDef<Role, unknown>[]>(
    () => [
      ...roleColumns,
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {can(PERMISSION_CODES.ROLE_UPDATE) ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() =>
                  setSheetState({ mode: 'edit', role: row.original })
                }
                aria-label={`Edit ${row.original.name}`}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {can(PERMISSION_CODES.ROLE_DELETE) ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteRole(row.original)}
                aria-label={`Delete ${row.original.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [can]
  );

  const canCreate = can(PERMISSION_CODES.ROLE_CREATE);

  return (
    <div className="space-y-4">
      <DataTableToolbar onSearchChange={() => {}}>
        {canCreate ? (
          <Button size="sm" onClick={() => setSheetState({ mode: 'create' })}>
            Add role
          </Button>
        ) : null}
      </DataTableToolbar>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        pageCount={data?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        emptyContent={
          <DataTableEmpty
            title="No roles found"
            action={
              canCreate ? (
                <Button
                  size="sm"
                  onClick={() => setSheetState({ mode: 'create' })}
                >
                  Add role
                </Button>
              ) : undefined
            }
          />
        }
      />
      <RoleManageSheet
        state={sheetState}
        onOpenChange={(open) => !open && setSheetState(null)}
      />
      <RoleDeleteDialog
        role={deleteRole}
        open={Boolean(deleteRole)}
        onOpenChange={(open) => !open && setDeleteRole(null)}
      />
    </div>
  );
}
