export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    BY_ID: (id: number) => `/users/${id}`,
  },
  ROLES: {
    LIST: '/roles',
    BY_ID: (id: number) => `/roles/${id}`,
    ASSIGN: '/roles/assign',
    UNASSIGN: (userId: number, roleId: number) =>
      `/roles/assign/${userId}/${roleId}`,
  },
  PERMISSIONS: {
    LIST: '/permissions',
    BY_ID: (id: number) => `/permissions/${id}`,
  },
} as const;
