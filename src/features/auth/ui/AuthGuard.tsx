'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/entities/user';
import { useAuthStore } from '../model/store';
import { ROUTES } from '@/shared/config/routes';
import { tokenStorage } from '@/shared/lib/token-storage';
import { Skeleton } from '@/shared/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const hasToken = tokenStorage.hasSession();

  const { data, isLoading, isError } = useMe(hasToken);

  useEffect(() => {
    if (!hasToken) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (data) setSession(data);
    if (isError) router.replace(ROUTES.LOGIN);
  }, [hasToken, data, isError, router, setSession]);

  if (!hasToken || isLoading || (!user && !data)) {
    return (
      <div className="flex min-h-svh flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <>{children}</>;
};
