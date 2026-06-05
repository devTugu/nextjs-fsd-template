'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { usePermissionList, type Permission } from '@/entities/permission';
import { permissionColumns } from '@/entities/permission/ui/permission-columns';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { DataTable, DataTableToolbar, DataTableEmpty } from '@/widgets/data-table';
import { Button } from '@/shared/ui/button';
import {
  PermissionManageSheet,
  type PermissionSheetState,
} from './permission-manage-sheet';
import { PermissionDeleteDialog } from './permission-delete-dialog';

export function PermissionsTable() {
  const { can } = useAuthPermissions();
  const { pagination, setPagination, queryParams } = useTableSearchParams();
  const { data, isLoading } = usePermissionList(queryParams);
  const [sheetState, setSheetState] = useState<PermissionSheetState | null>(
    null
  );
  const [deleteItem, setDeleteItem] = useState<Permission | null>(null);

  const columns = useMemo<ColumnDef<Permission, unknown>[]>(
    () => [
      ...permissionColumns,
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {can(PERMISSION_CODES.PERMISSION_UPDATE) ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() =>
                  setSheetState({ mode: 'edit', permission: row.original })
                }
                aria-label={`Edit ${row.original.code}`}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {can(PERMISSION_CODES.PERMISSION_DELETE) ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteItem(row.original)}
                aria-label={`Delete ${row.original.code}`}
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

  const canCreate = can(PERMISSION_CODES.PERMISSION_CREATE);

  return (
    <div className="space-y-4">
      <DataTableToolbar onSearchChange={() => {}}>
        {canCreate ? (
          <Button
            size="sm"
            onClick={() => setSheetState({ mode: 'create' })}
          >
            Add permission
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
            title="No permissions found"
            action={
              canCreate ? (
                <Button
                  size="sm"
                  onClick={() => setSheetState({ mode: 'create' })}
                >
                  Add permission
                </Button>
              ) : undefined
            }
          />
        }
      />
      <PermissionManageSheet
        state={sheetState}
        onOpenChange={(open) => !open && setSheetState(null)}
      />
      <PermissionDeleteDialog
        permission={deleteItem}
        open={Boolean(deleteItem)}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      />
    </div>
  );
}
