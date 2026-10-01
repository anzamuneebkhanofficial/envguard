'use client';

import { useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiListChanges, type ChangeFilters, type PaginatedChanges } from '../lib/changes';

export function useChanges(projectId?: string, initialFilters: ChangeFilters = {}) {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<ChangeFilters>({
    page: 1,
    limit: 8,
    ...initialFilters,
  });

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<PaginatedChanges>({
    queryKey: ['changes', projectId, filters],
    queryFn: () =>
      projectId
        ? apiListChanges(projectId, filters)
        : Promise.resolve({ changes: [], total: 0, page: 1, limit: 8, totalPages: 1 }),
    enabled: !!projectId,
    staleTime: 2000,
    refetchInterval: 3000,
    placeholderData: (prev) => prev, // keep previous page visible during transitions
  });

  const setPage = (page: number) => startTransition(() => setFilters((prev) => ({ ...prev, page })));
  const setLimit = (limit: number) => startTransition(() => setFilters((prev) => ({ ...prev, limit, page: 1 })));
  const setKeyFilter = (key?: string) => startTransition(() => setFilters((prev) => ({ ...prev, key, page: 1 })));
  const setActionFilter = (action?: 'created' | 'updated' | 'deleted') =>
    startTransition(() => setFilters((prev) => ({ ...prev, action, page: 1 })));
  const setDateRange = (from?: string, to?: string) =>
    startTransition(() => setFilters((prev) => ({ ...prev, from, to, page: 1 })));

  return {
    changes: data?.changes ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? filters.limit ?? 8,
    totalPages: data?.totalPages ?? 1,
    hasNextPage: data?.hasNextPage ?? (data?.page ? data.page < (data.totalPages || 1) : false),
    hasPreviousPage: data?.hasPreviousPage ?? (data?.page ? data.page > 1 : false),
    filters,
    isLoading: isLoading || isPending,
    isError,
    refetch,
    setPage,
    setLimit,
    setKeyFilter,
    setActionFilter,
    setDateRange,
  };
}
