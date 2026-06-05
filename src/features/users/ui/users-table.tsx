"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useUsers, type UserOutput } from "@/entities/user";
import { userColumns } from "@/entities/user/ui/user-columns";
import { useAuthPermissions } from "@/features/auth";
import {
  PERMISSION_CODES,
  SUPER_ADMIN_ROLE,
} from "@/shared/config/permissions";
import { useTableSearchParams } from "@/shared/hooks/use-table-search-params";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmpty,
} from "@/widgets/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { UserManageSheet, type UserSheetState } from "./user-manage-sheet";
import { UserDeleteDialog } from "@/features/users/ui/user-delete-dialog";

function ClickableRoleBadges({
  user,
  onClick,
}: {
  user: UserOutput;
  onClick: () => void;
}) {
  if (user.roles.length === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-sm text-muted-foreground hover:text-foreground">
        No roles
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-wrap gap-1 text-left">
      {user.roles.map((role) => (
        <Badge
          key={role}
          variant={role === SUPER_ADMIN_ROLE ? "default" : "secondary"}
          className="cursor-pointer">
          {role}
        </Badge>
      ))}
    </button>
  );
}

export function UsersTable() {
  const { can } = useAuthPermissions();
  const { pagination, setPagination, onSearchChange, queryParams, search } =
    useTableSearchParams();
  const { data, isLoading } = useUsers(queryParams);
  const [sheetState, setSheetState] = useState<UserSheetState | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserOutput | null>(null);

  const columns = useMemo<ColumnDef<UserOutput, unknown>[]>(
    () => [
      ...userColumns.map((column) => {
        if ("accessorKey" in column && column.accessorKey === "roles") {
          return {
            ...column,
            cell: ({ row }: { row: { original: UserOutput } }) => (
              <ClickableRoleBadges
                user={row.original}
                onClick={() =>
                  setSheetState({
                    mode: "edit",
                    user: row.original,
                    tab: "roles",
                  })
                }
              />
            ),
          };
        }
        return column;
      }),
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {can(PERMISSION_CODES.USER_UPDATE) ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() =>
                  setSheetState({
                    mode: "edit",
                    user: row.original,
                    tab: "profile",
                  })
                }
                aria-label={`Edit ${row.original.email}`}>
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {can(PERMISSION_CODES.USER_DELETE) ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteUser(row.original)}
                aria-label={`Delete ${row.original.email}`}>
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [can],
  );

  const canCreate = can(PERMISSION_CODES.USER_CREATE);

  return (
    <div className="space-y-4">
      <DataTableToolbar initialSearch={search} onSearchChange={onSearchChange}>
        {canCreate ? (
          <Button size="sm" onClick={() => setSheetState({ mode: "create" })}>
            Add user
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
            title="No users found"
            description="Create a user or adjust your search."
            action={
              canCreate ? (
                <Button
                  size="sm"
                  onClick={() => setSheetState({ mode: "create" })}>
                  Add user
                </Button>
              ) : undefined
            }
          />
        }
      />
      <UserManageSheet
        state={sheetState}
        onOpenChange={(open) => !open && setSheetState(null)}
      />
      <UserDeleteDialog
        user={deleteUser}
        open={Boolean(deleteUser)}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      />
    </div>
  );
}
