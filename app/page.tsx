'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { tokenStorage } from '@/shared/lib/token-storage';
import { Button } from '@/shared/ui/button';
import { FadeIn } from '@/shared/ui/motion';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (tokenStorage.hasSession()) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <FadeIn className="mx-auto max-w-lg text-center">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          {env.APP_NAME}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Next.js FSD admin template wired to NestJS enterprise RBAC API.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={ROUTES.LOGIN}>
              Sign in
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
