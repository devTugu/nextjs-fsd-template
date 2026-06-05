'use client';

import { usePathname } from 'next/navigation';
import { Separator } from '@/shared/ui/separator';
import { SidebarTrigger } from '@/shared/ui/sidebar';

const titles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/users': 'Users',
  '/dashboard/roles': 'Roles',
  '/dashboard/permissions': 'Permissions',
};

export function SiteHeader() {
  const pathname = usePathname();
  const title = titles[pathname] ?? 'Dashboard';

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  );
}
