'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { SyncModal } from '@/components/variables/SyncModal';
import { useProjects } from '@/hooks/useProjects';
import { useVariables } from '@/hooks/useVariables';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { projects } = useProjects();
  const params = useParams();
  const projectId = (params?.id as string) || (projects.length > 0 ? projects[0]?.id : '');
  const currentProject = projects.find((p) => p.id === projectId) || (projects.length > 0 ? projects[0] : null);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const targetProjectId = currentProject?.id || projectId;
  const { syncVariables } = useVariables(targetProjectId);

  // Authentication Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Per-project permission resolution
  const isOwner = currentProject && user && String(currentProject.ownerId) === String(user.id);
  const userMember = currentProject?.members?.find((m) => String(m.userId) === String(user?.id));
  const userRole = isOwner ? 'owner' : (userMember?.role || 'viewer');
  const canEdit = userRole === 'owner' || userRole === 'editor';

  // Subtle lightweight skeleton while verifying session
  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121318] flex flex-col md:flex-row">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-60 shrink-0 border-r border-[#3c4a42] bg-[#121318] p-4 space-y-4">
          <div className="h-8 w-28 rounded-lg bg-[#1e1f25] animate-pulse" />
          <div className="h-9 w-full rounded-lg bg-[#1e1f25] animate-pulse" />
          <div className="space-y-2 pt-2">
            <div className="h-8 w-full rounded-lg bg-[#1e1f25] animate-pulse" />
            <div className="h-8 w-full rounded-lg bg-[#1e1f25] animate-pulse" />
            <div className="h-8 w-full rounded-lg bg-[#1e1f25] animate-pulse" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-[#3c4a42] bg-[#121318] px-6 flex items-center justify-between">
            <div className="h-5 w-48 rounded bg-[#1e1f25] animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-[#1e1f25] animate-pulse" />
          </div>
          <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
            <div className="h-28 rounded-xl border border-[#3c4a42]/40 bg-[#1a1b21] animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-xl border border-[#3c4a42]/40 bg-[#1a1b21] animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121318] flex flex-col md:flex-row">
      {/* Desktop Sidebar (Fixed left, width 240px) */}
      <div className="hidden md:block w-60 shrink-0">
        <Sidebar
          currentProject={currentProject}
          projects={projects}
          onOpenSyncModal={
            canEdit
              ? () => {
                  if (currentProject) {
                    setIsSyncModalOpen(true);
                  } else if (projects.length > 0 && projects[0]) {
                    window.location.href = `/projects/${projects[0].id}`;
                  } else {
                    window.location.href = '/projects';
                  }
                }
              : undefined
          }
        />
      </div>

      {/* Mobile Top Navigation */}
      <MobileNav
        projectId={currentProject?.id}
        projectName={currentProject?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:pl-0 flex flex-col">
        {children}
      </main>

      {/* Quick Sync Modal */}
      {currentProject && (
        <SyncModal
          open={isSyncModalOpen}
          onOpenChange={setIsSyncModalOpen}
          projectId={currentProject.id}
          projectName={currentProject.name}
          onSyncPaste={(vars) => syncVariables(vars)}
        />
      )}
    </div>
  );
}
