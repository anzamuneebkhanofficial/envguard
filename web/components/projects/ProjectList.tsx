'use client';

import React, { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Pagination } from '../ui/Pagination';
import { ProjectForm } from './ProjectForm';
import type { ProjectItem } from '../../lib/projects';
import type { ProjectFormValues } from '../../validators/project';

interface ProjectListProps {
  // Server already paginated — receives only the current page slice
  projects: ProjectItem[];
  onCreateProject: (values: ProjectFormValues) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void>;
  isLoading?: boolean;
  // Pagination state driven from parent (server-side)
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ProjectList({
  projects,
  onCreateProject,
  onDeleteProject,
  isLoading = false,
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProjectListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (values: ProjectFormValues) => {
    await onCreateProject(values);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#e3e1e9] tracking-tight">Projects</h1>
          <p className="text-xs text-[#bbcabf] font-mono mt-0.5">
            Select a project to view its active variables, manage team access, and track changes.
          </p>
        </div>

        <Button variant="primary" icon="add" onClick={() => setIsModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Stable min-height container prevents layout shift between skeleton and real cards */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-xl border border-[#3c4a42] bg-[#1a1b21] animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#1e1f25] border border-[#3c4a42] text-[#10b981] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">folder_open</span>
            </div>
            <h3 className="text-base font-semibold text-[#e3e1e9]">No projects found</h3>
            <p className="text-xs text-[#bbcabf] max-w-sm mx-auto mt-1 mb-5">
              Create your first project to track variables, collaborate with your team, and see who changed what.
            </p>
            <Button variant="primary" icon="add" onClick={() => setIsModalOpen(true)}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onDelete={onDeleteProject} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              pageSizeOptions={[6, 9, 12]}
              itemLabel="projects"
              isLoading={isLoading}
              className="rounded-xl border"
            />
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Create New Project"
        description="Initialize a new environment tracking workspace for your API or service."
      >
        <ProjectForm onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
      </Dialog>
    </div>
  );
}
