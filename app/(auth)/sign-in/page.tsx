import { GalleryVerticalEnd } from 'lucide-react';
import { env } from '@/shared/config/env';
import { LoginForm } from '@/widgets/login-form';

export default function SignInPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {env.APP_NAME}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in
              </h1>
              <p className="text-muted-foreground text-sm">
                Use your admin credentials to access the dashboard.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />
        <div className="relative flex h-full flex-col justify-end p-10 text-white">
          <p className="max-w-md text-lg font-medium">
            Enterprise admin template with NestJS RBAC API
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            Users, roles, and permissions — built with FSD, shadcn/ui, and
            TanStack.
          </p>
        </div>
      </div>
    </div>
  );
}
