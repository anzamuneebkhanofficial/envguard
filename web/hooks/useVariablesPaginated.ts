'use client';

import { useState, useTransition } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiListVariablesPaginated, type PaginatedVariables, type VariableFilters } from '../lib/variables';

export function useVariablesPaginated(projectId?: string, initialFilters: VariableFilters = {}) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<VariableFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const { data, isLoading, isError, refetch } = useQuery<PaginatedVariables>({
    queryKey: ['variables-paginated', projectId, filters],
    queryFn: () =>
      projectId
        ? apiListVariablesPaginated(projectId, filters)
        : Promise.resolve({ variables: [], total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false }),
    enabled: !!projectId,
    staleTime: 2000,
    refetchInterval: 4000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev, // keep previous data during page transitions — no layout shift
  });

  const setPage = (page: number) =>
    startTransition(() => setFilters((prev) => ({ ...prev, page })));

  const setLimit = (limit: number) =>
    startTransition(() => setFilters((prev) => ({ ...prev, limit, page: 1 })));

  const setSearch = (search: string) =>
    startTransition(() => setFilters((prev) => ({ ...prev, search, page: 1 })));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['variables-paginated', projectId] });

  return {
    variables: data?.variables ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? filters.page ?? 1,
    limit: data?.limit ?? filters.limit ?? 10,
    totalPages: data?.totalPages ?? 1,
    hasNextPage: data?.hasNextPage ?? false,
    hasPreviousPage: data?.hasPreviousPage ?? false,
    filters,
    isLoading: isLoading || isPending,
    isError,
    refetch,
    setPage,
    setLimit,
    setSearch,
    invalidate,
  };
}
