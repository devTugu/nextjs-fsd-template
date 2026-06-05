import { Suspense } from 'react';
import { PermissionsTable } from '@/features/permissions';
import { Skeleton } from '@/shared/ui/skeleton';

export default function PermissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <PermissionsTable />
    </Suspense>
  );
}
