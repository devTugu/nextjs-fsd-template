'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';

const DEFAULT_PAGE_SIZE = 20;

interface UseTableSearchParamsOptions {
  defaultPageSize?: number;
  searchParam?: string;
}

export function useTableSearchParams(
  options: UseTableSearchParamsOptions = {}
) {
  const {
    defaultPageSize = DEFAULT_PAGE_SIZE,
    searchParam = 'search',
  } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(
    1,
    Number(searchParams.get('limit') ?? String(defaultPageSize))
  );
  const search = searchParams.get(searchParam) ?? '';

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: limit,
    }),
    [page, limit]
  );

  const replaceParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const nextQs = params.toString();
      const currentQs = searchParams.toString();
      if (nextQs === currentQs) return;

      router.replace(nextQs ? `${pathname}?${nextQs}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const setPagination = useCallback(
    (next: PaginationState) => {
      replaceParams({
        page: String(next.pageIndex + 1),
        limit: String(next.pageSize),
      });
    },
    [replaceParams]
  );

  const onSearchChange = useCallback(
    (value: string) => {
      const currentSearch = searchParams.get(searchParam) ?? '';
      const updates: Record<string, string | null> = {
        [searchParam]: value || null,
      };
      if (value !== currentSearch) {
        updates.page = '1';
      }
      replaceParams(updates);
    },
    [replaceParams, searchParam, searchParams]
  );

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
    }),
    [page, limit, search]
  );

  return {
    pagination,
    setPagination,
    search,
    onSearchChange,
    queryParams,
  };
}
