export interface ApiEnvelope<T> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
  requestId: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string | Record<string, unknown>;
  };
  timestamp: string;
  path: string;
  requestId: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
