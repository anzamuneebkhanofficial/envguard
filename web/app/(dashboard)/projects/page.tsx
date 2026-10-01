'use client';

import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { ProjectList } from '../../../components/projects/ProjectList';
import { useProjectsPaginated } from '../../../hooks/useProjectsPaginated';
import { useProjects } from '../../../hooks/useProjects';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    projects,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    invalidate,
  } = useProjectsPaginated();

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setSearch(val);
  };

  // We still need mutation functions from useProjects
  const { createProject, deleteProject } = useProjects();

  const handleCreate = async (values: Parameters<typeof createProject>[0]) => {
    await createProject(values);
    invalidate(); // refresh paginated list
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    invalidate();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        projectName="Workspace Projects"
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <ProjectList
          projects={projects}
          onCreateProject={handleCreate}
          onDeleteProject={handleDelete}
          isLoading={isLoading}
          currentPage={page}
          totalPages={totalPages}
          totalRecords={total}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      </div>
    </div>
  );
}
