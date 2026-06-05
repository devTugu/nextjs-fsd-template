import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { ROUTES } from '@/shared/config/routes';
import { tokenStorage } from '@/shared/lib/token-storage';
import axios from 'axios';
import { env } from '@/shared/config/env';
import type { ApiEnvelope, ApiErrorEnvelope, TokenPair } from './types';
import { getErrorMessage } from './errorHandler';

const refreshClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

const redirectToLogin = (): void => {
  tokenStorage.clear();
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (!path.startsWith(ROUTES.LOGIN)) {
      window.location.href = ROUTES.LOGIN;
    }
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    redirectToLogin();
    return null;
  }

  try {
    const response = await refreshClient.post<ApiEnvelope<TokenPair>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    const tokens = response.data.data;
    tokenStorage.setTokens(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresIn
    );
    return tokens.accessToken;
  } catch {
    redirectToLogin();
    return null;
  }
};

export const setupRequestInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers && !config.headers['x-request-id']) {
      config.headers['x-request-id'] = crypto.randomUUID();
    }
    return config;
  });
};

export const setupResponseInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorEnvelope>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 403 && typeof window !== 'undefined') {
        const { toast } = await import('sonner');
        toast.error(getErrorMessage(error));
      }

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (!newToken) {
        return Promise.reject(error);
      }

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return instance(originalRequest);
    }
  );
};
