'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import type { TokenPair } from '@/shared/api';
import { tokenStorage } from '@/shared/lib/token-storage';

const REFRESH_BUFFER_MS = 60_000;

export function useTokenRefreshScheduler() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const expiresAt = tokenStorage.getExpiresAt();
      const refreshToken = tokenStorage.getRefreshToken();
      if (!expiresAt || !refreshToken) return;

      const delay = Math.max(expiresAt - Date.now() - REFRESH_BUFFER_MS, 0);

      timerRef.current = setTimeout(async () => {
        try {
          const tokens = await api.post<TokenPair>(API_ENDPOINTS.AUTH.REFRESH, {
            refreshToken,
          });
          tokenStorage.setTokens(
            tokens.accessToken,
            tokens.refreshToken,
            tokens.expiresIn
          );
        } catch {
          tokenStorage.clear();
        }
        schedule();
      }, delay);
    };

    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
