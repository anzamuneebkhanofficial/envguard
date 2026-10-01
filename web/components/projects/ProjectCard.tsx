'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatRelativeTime } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import type { ProjectItem } from '../../lib/projects';

interface ProjectCardProps {
  project: ProjectItem;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { user } = useAuth();
  const isOwner = user && String(project.ownerId) === String(user.id);
  const userMember = project.members?.find((m) => String(m.userId) === String(user?.id));
  const userRole = isOwner ? 'owner' : (userMember?.role || 'viewer');

  return (
    <Card className="hover:border-[#10b981]/50 group relative transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1e1f25] border border-[#3c4a42] flex items-center justify-center text-[#4edea3] group-hover:border-[#10b981]/50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">folder</span>
            </div>
            <div>
              <Link
                href={`/projects/${project.id}`}
                className="font-mono font-semibold text-sm text-[#e3e1e9] hover:text-[#4edea3] transition-colors"
              >
                {project.name}
              </Link>
              <p className="text-xs text-[#bbcabf] line-clamp-1 mt-0.5">
                {project.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* User's role on this specific project */}
          <Badge variant={userRole === 'owner' ? 'added' : userRole === 'editor' ? 'modified' : 'standard'}>
            {userRole === 'owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Viewer'}
          </Badge>
        </div>

        {/* Creator and Member Info */}
        <div className="flex items-center justify-between text-xs text-[#bbcabf] mb-3 pb-2 border-b border-[#3c4a42]/30">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#4edea3]">person</span>
            <span>Created by: <strong className="text-[#e3e1e9]">{project.ownerName || project.ownerEmail || 'Owner'}</strong></span>
          </div>
          <span className="text-[#86948a] font-mono text-[11px]">
            {project.members?.length || 1} {project.members?.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Metric indicators */}
        <div className="grid grid-cols-2 gap-3 py-2 border-b border-[#3c4a42]/40 text-xs">
          <div>
            <div className="text-[#86948a] font-mono text-[11px]">ACTIVE VARIABLES</div>
            <div className="font-mono text-sm font-semibold text-[#e3e1e9] mt-0.5">
              {project.variableCount ?? 0}
            </div>
          </div>
          <div>
            <div className="text-[#86948a] font-mono text-[11px]">LAST ACTIVITY</div>
            <div className="font-mono text-xs text-[#bbcabf] mt-0.5">
              {project.lastChangedAt ? formatRelativeTime(project.lastChangedAt) : formatRelativeTime(project.createdAt)}
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between mt-4">
          <Link href={`/projects/${project.id}`}>
            <Button variant="secondary" size="sm" icon="arrow_forward">
              Open Project
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            <Link href={`/projects/${project.id}/history`}>
              <Button variant="ghost" size="icon" title="Activity History">
                <span className="material-symbols-outlined text-[18px]">history</span>
              </Button>
            </Link>
            <Link href={`/projects/${project.id}/settings`}>
              <Button variant="ghost" size="icon" title="Project Settings & Members">
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </Button>
            </Link>
            {isOwner && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(project.id)}
                title="Delete Project"
                className="text-[#86948a] hover:text-rose-400"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
