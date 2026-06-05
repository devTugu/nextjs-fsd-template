'use client';

import { useMemo, useState } from 'react';
import type { Permission } from '@/entities/permission';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Separator } from '@/shared/ui/separator';
import { filterPermissions, groupPermissions } from './group-permissions';

interface PermissionPickerProps {
  permissions: Permission[];
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

interface PermissionGroupProps {
  title: string;
  items: Permission[];
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

function PermissionGroup({
  title,
  items,
  value,
  onChange,
  disabled,
}: PermissionGroupProps) {
  if (items.length === 0) return null;

  const allSelected = items.every((item) => value.includes(item.id));
  const someSelected = items.some((item) => value.includes(item.id));

  const toggleAll = (checked: boolean) => {
    const groupIds = items.map((item) => item.id);
    if (checked) {
      onChange([...new Set([...value, ...groupIds])]);
      return;
    }
    onChange(value.filter((id) => !groupIds.includes(id)));
  };

  const toggleOne = (id: number, checked: boolean) => {
    if (checked) {
      onChange([...value, id]);
      return;
    }
    onChange(value.filter((current) => current !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={(checked) => toggleAll(checked === true)}
            disabled={disabled}
          />
          Select all
        </label>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm"
          >
            <Checkbox
              checked={value.includes(item.id)}
              onCheckedChange={(checked) =>
                toggleOne(item.id, checked === true)
              }
              disabled={disabled}
              className="mt-0.5"
            />
            <span className="min-w-0 flex-1">
              <span className="font-medium">{item.code}</span>
              {item.description ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function PermissionPicker({
  permissions,
  value,
  onChange,
  disabled,
}: PermissionPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterPermissions(permissions, search),
    [permissions, search]
  );
  const groups = useMemo(() => groupPermissions(filtered), [filtered]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="permission-search">Search permissions</Label>
        <Input
          id="permission-search"
          placeholder="Filter by code or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={disabled}
        />
      </div>
      <ScrollArea className="h-64 rounded-md border p-3">
        <div className="space-y-4 pr-3">
          <PermissionGroup
            title="Users"
            items={groups.users}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
          {groups.users.length > 0 && groups.roles.length > 0 ? (
            <Separator />
          ) : null}
          <PermissionGroup
            title="Roles"
            items={groups.roles}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
          {groups.roles.length > 0 && groups.permissions.length > 0 ? (
            <Separator />
          ) : null}
          <PermissionGroup
            title="Permissions"
            items={groups.permissions}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permissions found.</p>
          ) : null}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        {value.length} of {permissions.length} selected
      </p>
    </div>
  );
}
