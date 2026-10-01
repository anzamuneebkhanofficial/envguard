'use client';

import { useState, useTransition } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiListProjectsPaginated, type PaginatedProjects, type ProjectFilters } from '../lib/projects';

export function useProjectsPaginated(initialFilters: ProjectFilters = {}) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 6,
    ...initialFilters,
  });

  const { data, isLoading, isError, refetch } = useQuery<PaginatedProjects>({
    queryKey: ['projects-paginated', filters],
    queryFn: () => apiListProjectsPaginated(filters),
    staleTime: 2000,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev, // keep previous data visible during page change — no layout shift
  });

  const setPage = (page: number) =>
    startTransition(() => setFilters((prev) => ({ ...prev, page })));

  const setLimit = (limit: number) =>
    startTransition(() => setFilters((prev) => ({ ...prev, limit, page: 1 })));

  const setSearch = (search: string) =>
    startTransition(() => setFilters((prev) => ({ ...prev, search, page: 1 })));

  return {
    projects: data?.projects ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? filters.page ?? 1,
    limit: data?.limit ?? filters.limit ?? 6,
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
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['projects-paginated'] }),
  };
}
