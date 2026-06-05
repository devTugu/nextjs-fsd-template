"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
  type UserOutput,
  useCreateUser,
  useUpdateUser,
  useUser,
} from "@/entities/user";
import { useAssignRole, useRoles, useUnassignRole } from "@/entities/role";
import { useAuthPermissions } from "@/features/auth";
import {
  PERMISSION_CODES,
  SUPER_ADMIN_ROLE,
} from "@/shared/config/permissions";
import { getErrorMessage } from "@/shared/api";
import { AdminFormSheet } from "@/widgets/admin-form-sheet";
import { UserDeleteDialog } from "./user-delete-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export type UserSheetState =
  | { mode: "create" }
  | { mode: "edit"; user: UserOutput; tab?: "profile" | "roles" };

interface UserManageSheetProps {
  state: UserSheetState | null;
  onOpenChange: (open: boolean) => void;
}

interface UnassignTarget {
  roleId: number;
  roleName: string;
}

function RoleBadge({
  name,
  onRemove,
  canRemove,
}: {
  name: string;
  onRemove?: () => void;
  canRemove: boolean;
}) {
  return (
    <Badge
      variant={name === SUPER_ADMIN_ROLE ? "default" : "secondary"}
      className="gap-1 pr-1">
      {name}
      {canRemove && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm p-0.5 hover:bg-background/20"
          aria-label={`Remove ${name}`}>
          <X className="size-3" />
        </button>
      ) : null}
    </Badge>
  );
}

export function UserManageSheet({ state, onOpenChange }: UserManageSheetProps) {
  const { can } = useAuthPermissions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const assignRole = useAssignRole();
  const unassignRole = useUnassignRole();

  const isCreate = state?.mode === "create";
  const isEdit = state?.mode === "edit";
  const editUserId = isEdit ? state.user.id : 0;
  const open = state !== null;

  const { data: freshUser } = useUser(editUserId, open && isEdit);
  const user = freshUser ?? (isEdit ? state.user : null);

  const { data: rolesData } = useRoles({ page: 1, limit: 100 });
  const [tabSelection, setTabSelection] = useState<{
    sheetId: string;
    tab: "profile" | "roles";
  } | null>(null);
  const [roleSelection, setRoleSelection] = useState<{
    sheetId: string;
    roleId: string;
  } | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<UnassignTarget | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sheetId = !open
    ? ""
    : isCreate
      ? "create"
      : `edit-${user?.id}-${isEdit && state.mode === "edit" ? (state.tab ?? "profile") : "profile"}`;

  const defaultTab =
    isEdit && state?.mode === "edit" ? (state.tab ?? "profile") : "profile";

  const activeTab =
    tabSelection?.sheetId === sheetId && sheetId !== ""
      ? tabSelection.tab
      : defaultTab;

  const selectedRoleId =
    roleSelection?.sheetId === sheetId ? roleSelection.roleId : "";

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", password: "", isActive: true },
  });

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { password: "", isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      createForm.reset({ email: "", password: "", isActive: true });
      return;
    }
    if (user) {
      editForm.reset({ password: "", isActive: user.isActive });
    }
  }, [open, isCreate, user, createForm, editForm]);

  const assignableRoles = useMemo(() => {
    if (!user) return [];
    return (
      rolesData?.items.filter((role) => !user.roles.includes(role.name)) ?? []
    );
  }, [rolesData, user]);

  const roleNameToId = useMemo(() => {
    const map = new Map<string, number>();
    rolesData?.items.forEach((role) => map.set(role.name, role.id));
    return map;
  }, [rolesData]);

  if (!open) return null;

  const canCreate = can(PERMISSION_CODES.USER_CREATE);
  const canUpdate = can(PERMISSION_CODES.USER_UPDATE);
  const canAssign = can(PERMISSION_CODES.ROLE_CREATE);
  const canUnassign = can(PERMISSION_CODES.ROLE_DELETE);
  const canDelete = can(PERMISSION_CODES.USER_DELETE);

  const onCreateSubmit = async (values: CreateUserFormValues) => {
    try {
      await createUser.mutateAsync(values);
      toast.success("User created");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: UpdateUserFormValues) => {
    if (!user) return;
    try {
      const payload = {
        isActive: values.isActive,
        ...(values.password ? { password: values.password } : {}),
      };
      await updateUser.mutateAsync({ id: user.id, data: payload });
      toast.success("User updated");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRoleId) return;
    try {
      await assignRole.mutateAsync({
        userId: user.id,
        roleId: Number(selectedRoleId),
      });
      toast.success("Role assigned");
      setRoleSelection({ sheetId, roleId: "" });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUnassignRole = async () => {
    if (!user || !unassignTarget) return;
    try {
      await unassignRole.mutateAsync({
        userId: user.id,
        roleId: unassignTarget.roleId,
      });
      toast.success("Role removed");
      setUnassignTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;
  const formId = isCreate ? "user-create-form" : "user-edit-form";

  const showProfileFooter = isCreate || (isEdit && activeTab === "profile");
  const footer =
    showProfileFooter && ((isCreate && canCreate) || (isEdit && canUpdate)) ? (
      <div className="space-y-4">
        {isEdit && canDelete ? (
          <div className="rounded-md border border-destructive/30 p-3">
            <p className="text-sm font-medium text-destructive">Danger zone</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Permanently delete this user account.
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => setDeleteOpen(true)}>
              Delete user
            </Button>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isCreate ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    ) : isEdit && activeTab === "roles" ? (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </div>
    ) : null;

  return (
    <>
      <AdminFormSheet
        open={open}
        onOpenChange={onOpenChange}
        title={isCreate ? "Create user" : (user?.email ?? "Edit user")}
        description={
          isCreate
            ? "Add a new user account with email and password."
            : activeTab === "roles"
              ? "Manage role assignments for this user."
              : "Change password or account status."
        }
        size="md"
        footer={footer}>
        {isCreate ? (
          <Form {...createForm}>
            <form
              id={formId}
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4">
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active account</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Inactive users cannot sign in.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setTabSelection({
                sheetId,
                tab: value as "profile" | "roles",
              })
            }>
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">
                Profile
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex-1">
                Roles
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4">
              <Form {...editForm}>
                <form
                  id={formId}
                  onSubmit={editForm.handleSubmit(onEditSubmit)}
                  className="space-y-4">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input value={user?.email ?? ""} disabled readOnly />
                  </FormItem>
                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password (optional)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active account</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Inactive users cannot sign in.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="roles" className="mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Current roles</p>
                {user && user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((roleName) => {
                      const roleId = roleNameToId.get(roleName);
                      return (
                        <RoleBadge
                          key={roleName}
                          name={roleName}
                          canRemove={canUnassign && roleId !== undefined}
                          onRemove={
                            roleId !== undefined
                              ? () =>
                                  setUnassignTarget({
                                    roleId,
                                    roleName,
                                  })
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No roles assigned.
                  </p>
                )}
              </div>
              {canAssign ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Add role</p>
                  <div className="flex gap-2">
                    <Select
                      value={selectedRoleId}
                      onValueChange={(roleId) =>
                        setRoleSelection({ sheetId, roleId })
                      }>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAssignRole}
                      disabled={!selectedRoleId || assignRole.isPending}>
                      {assignRole.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Add
                    </Button>
                  </div>
                  {assignableRoles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      All available roles are already assigned.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        )}
      </AdminFormSheet>

      <AlertDialog
        open={unassignTarget !== null}
        onOpenChange={(dialogOpen) => !dialogOpen && setUnassignTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove role?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {unassignTarget?.roleName} from {user?.email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassignRole}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserDeleteDialog
        user={user}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => onOpenChange(false)}
      />
    </>
  );
}
