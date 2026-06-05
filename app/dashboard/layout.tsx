'use client';

import { AuthGuard, TokenRefreshScheduler } from '@/features/auth';
import { AppSidebar, SiteHeader } from '@/widgets/app-sidebar';
import { PageTransition } from '@/widgets/motion/page-transition';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <TokenRefreshScheduler />
      <SidebarProvider
        style={
          {
            '--sidebar-width': '16rem',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <PageTransition className="flex flex-1 flex-col p-4 md:p-6">
            {children}
          </PageTransition>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
