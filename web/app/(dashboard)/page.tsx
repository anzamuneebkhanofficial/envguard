'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '../../hooks/useProjects';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { projects, isLoading } = useProjects();

  useEffect(() => {
    if (!isLoading) {
      if (projects.length > 0 && projects[0]) {
        router.replace(`/projects/${projects[0].id}`);
      } else {
        router.replace('/projects');
      }
    }
  }, [projects, isLoading, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-3 text-xs text-[#86948a] font-mono">
        <span className="material-symbols-outlined text-[32px] animate-spin text-[#10b981]">
          progress_activity
        </span>
        <span>Loading workspace...</span>
      </div>
    </div>
  );
}
