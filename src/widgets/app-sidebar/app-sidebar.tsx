'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Users,
  KeyRound,
} from 'lucide-react';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import {
  PERMISSION_CODES,
  type PermissionCode,
} from '@/shared/config/permissions';
import { useAuthPermissions } from '@/features/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar';
import { NavUser } from './nav-user';

const navItems: {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionCode;
}[] = [
  { title: 'Overview', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  {
    title: 'Users',
    href: ROUTES.USERS,
    icon: Users,
    permission: PERMISSION_CODES.USER_READ,
  },
  {
    title: 'Roles',
    href: ROUTES.ROLES,
    icon: Shield,
    permission: PERMISSION_CODES.ROLE_READ,
  },
  {
    title: 'Permissions',
    href: ROUTES.PERMISSIONS,
    icon: KeyRound,
    permission: PERMISSION_CODES.PERMISSION_READ,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { can } = useAuthPermissions();

  const visibleItems = navItems.filter(
    (item) => !item.permission || can(item.permission)
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.DASHBOARD}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{env.APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin Console
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      (item.href !== ROUTES.DASHBOARD &&
                        pathname.startsWith(item.href))
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
