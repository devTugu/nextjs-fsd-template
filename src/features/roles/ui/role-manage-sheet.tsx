'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRoleFormValues,
  type UpdateRoleFormValues,
  type Role,
  useCreateRole,
  useUpdateRole,
} from '@/entities/role';
import { usePermissionList } from '@/entities/permission';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { AdminFormSheet } from '@/widgets/admin-form-sheet';
import { PermissionPicker } from '@/widgets/permission-picker';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

export type RoleSheetState =
  | { mode: 'create' }
  | { mode: 'edit'; role: Role };

interface RoleManageSheetProps {
  state: RoleSheetState | null;
  onOpenChange: (open: boolean) => void;
}

export function RoleManageSheet({ state, onOpenChange }: RoleManageSheetProps) {
  const { can } = useAuthPermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data: perms } = usePermissionList({ page: 1, limit: 100 });

  const isCreate = state?.mode === 'create';
  const isEdit = state?.mode === 'edit';
  const role = isEdit ? state.role : null;
  const open = state !== null;

  const createForm = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '', permissionIds: [] },
  });

  const editForm = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: { description: '', permissionIds: [] },
  });

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      createForm.reset({ name: '', description: '', permissionIds: [] });
      return;
    }
    if (role) {
      editForm.reset({
        description: role.description ?? '',
        permissionIds: role.permissions.map((p) => p.id),
      });
    }
  }, [open, isCreate, role, createForm, editForm]);

  if (!open) return null;

  const canSubmit =
    (isCreate && can(PERMISSION_CODES.ROLE_CREATE)) ||
    (isEdit && can(PERMISSION_CODES.ROLE_UPDATE));

  const onCreateSubmit = async (values: CreateRoleFormValues) => {
    try {
      await createRole.mutateAsync(values);
      toast.success('Role created');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: UpdateRoleFormValues) => {
    if (!role) return;
    try {
      await updateRole.mutateAsync({ id: role.id, data: values });
      toast.success('Role updated');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isPending = createRole.isPending || updateRole.isPending;
  const formId = isCreate ? 'role-create-form' : 'role-edit-form';

  const footer = canSubmit ? (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button type="submit" form={formId} disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isCreate ? 'Create' : 'Save'}
      </Button>
    </div>
  ) : null;

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? 'Create role' : `Edit ${role?.name}`}
      description={
        isCreate
          ? 'Define a role name and assign permissions.'
          : 'Update description and permissions for this role.'
      }
      size="lg"
      footer={footer}
    >
      {isCreate ? (
        <Form {...createForm}>
          <form
            id={formId}
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="MANAGER" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="permissionIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <PermissionPicker
                    permissions={perms?.items ?? []}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <Form {...editForm}>
          <form
            id={formId}
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-4"
          >
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input value={role?.name ?? ''} disabled readOnly />
            </FormItem>
            <FormField
              control={editForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="permissionIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <PermissionPicker
                    permissions={perms?.items ?? []}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </AdminFormSheet>
  );
}
