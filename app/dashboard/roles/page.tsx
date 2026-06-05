import { Suspense } from 'react';
import { RolesTable } from '@/features/roles';
import { Skeleton } from '@/shared/ui/skeleton';

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <RolesTable />
    </Suspense>
  );
}
