'use client';

import { useUsers } from '@/entities/user';
import { useRoles } from '@/entities/role';
import { usePermissionList } from '@/entities/permission';
import { FadeIn } from '@/shared/ui/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

function StatCard({
  title,
  value,
  loading,
}: {
  title: string;
  value: number;
  loading: boolean;
}) {
  return (
    <FadeIn>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}

export default function DashboardPage() {
  const users = useUsers({ page: 1, limit: 1 });
  const roles = useRoles({ page: 1, limit: 1 });
  const permissions = usePermissionList({ page: 1, limit: 1 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground text-sm">
          Enterprise RBAC admin console
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Users"
          value={users.data?.total ?? 0}
          loading={users.isLoading}
        />
        <StatCard
          title="Roles"
          value={roles.data?.total ?? 0}
          loading={roles.isLoading}
        />
        <StatCard
          title="Permissions"
          value={permissions.data?.total ?? 0}
          loading={permissions.isLoading}
        />
      </div>
    </div>
  );
}
