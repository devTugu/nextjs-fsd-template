import { Suspense } from 'react';
import { UsersTable } from '@/features/users';
import { Skeleton } from '@/shared/ui/skeleton';

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <UsersTable />
    </Suspense>
  );
}
