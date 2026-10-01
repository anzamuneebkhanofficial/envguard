'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ChangeTimeline } from '@/components/changes/ChangeTimeline';
import { ChangeFilters } from '@/components/changes/ChangeFilters';
import { ChangeChart } from '@/components/changes/ChangeChart';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useProject } from '@/hooks/useProjects';
import { useChanges } from '@/hooks/useChanges';

export default function HistoryPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const { project } = useProject(projectId);
  const {
    changes,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    setKeyFilter,
    setActionFilter,
    filters,
    isLoading: isChangesLoading,
  } = useChanges(projectId);

  const [search, setSearch] = useState('');

  const handleKeySearch = (key: string) => {
    setSearch(key);
    setKeyFilter(key);
  };

  const handleReset = () => {
    setSearch('');
    setKeyFilter(undefined);
    setActionFilter(undefined);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header projectName={project?.name || 'Project History'} />

      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-[#e3e1e9] tracking-tight">Activity History</h1>
          <p className="text-xs text-[#bbcabf] font-mono mt-0.5">
            A clear, complete log of who created, updated, or removed variables, and all team workspace actions.
          </p>
        </div>

        {/* Change Frequency Analytics Chart */}
        <ChangeChart changes={changes} />

        {/* Interactive Filters */}
        <ChangeFilters
          keyFilter={search}
          onKeyFilterChange={handleKeySearch}
          actionFilter={filters.action}
          onActionFilterChange={setActionFilter}
          onReset={handleReset}
        />

        {/* Timeline Log */}
        <div className="pt-2">
          <ChangeTimeline changes={changes} isLoading={isChangesLoading} />
        </div>

        {/* Reusable Pagination controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalRecords={total}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSizeOptions={[8, 16, 24]}
          isLoading={isChangesLoading}
          itemLabel="activities"
          className="rounded-xl border"
        />
      </div>
    </div>
  );
}
