'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tokenStorage } from '@/shared/lib/token-storage';
import type { TokenPair } from '@/shared/api';
import { useAuthStore } from '../model/store';
import { userKeys } from '@/entities/user/api/queries';
import type { UserOutput } from '@/entities/user';
import type { SignInRequest } from '../types/auth';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (data: SignInRequest) =>
      api.post<TokenPair>(API_ENDPOINTS.AUTH.LOGIN, data),
    onSuccess: async (tokens) => {
      tokenStorage.setTokens(
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresIn
      );
      const user = await api.get<UserOutput>(API_ENDPOINTS.AUTH.ME);
      setSession(user);
      queryClient.setQueryData(userKeys.me, user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await api.post<void>(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    },
    onSettled: () => {
      tokenStorage.clear();
      clearSession();
      queryClient.clear();
    },
  });
};
