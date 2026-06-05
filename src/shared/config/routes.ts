export const ROUTES = {
  HOME: '/',
  LOGIN: '/sign-in',
  DASHBOARD: '/dashboard',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  PERMISSIONS: '/dashboard/permissions',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
