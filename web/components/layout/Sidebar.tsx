'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../utils/cn';
import type { ProjectItem } from '../../lib/projects';

interface SidebarProps {
  currentProject?: ProjectItem | null;
  projects?: ProjectItem[];
  onSelectProject?: (project: ProjectItem) => void;
  onOpenSyncModal?: () => void;
}

export function Sidebar({ currentProject, projects = [], onSelectProject, onOpenSyncModal }: SidebarProps) {
  const pathname = usePathname();
  const projectId = currentProject?.id || (projects.length > 0 ? projects[0]?.id : '');

  const navItems = [
    {
      label: 'Variables',
      href: projectId ? `/projects/${projectId}` : '/projects',
      icon: 'folder_open',
      active: pathname === `/projects/${projectId}` || (pathname === '/projects' && !projectId),
      badge: 'Active',
      badgeVariant: 'text-[#4edea3] bg-[#10b981]/10',
    },
    {
      label: 'Activity History',
      href: projectId ? `/projects/${projectId}/history` : '/projects',
      icon: 'history',
      active: pathname.includes('/history'),
      badge: 'Live',
      badgeVariant: 'text-[#4cd7f6] bg-[#03b5d3]/10',
    },
    {
      label: 'Alerts & Settings',
      href: projectId ? `/projects/${projectId}/settings` : '/projects',
      icon: 'tune',
      active: pathname.includes('/settings') && !pathname.endsWith('/app-settings'),
      badge: 'Team',
      badgeVariant: 'text-[#ffb95f] bg-[#e29100]/10',
    },
    {
      label: 'All Projects',
      href: '/projects',
      icon: 'deployed_code',
      active: pathname === '/projects',
    },
  ];

  return (
    <aside className="w-60 min-w-60 h-screen bg-[#121318] border-r border-[#3c4a42] flex flex-col justify-between fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#3c4a42]/60">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#292a2f] border border-[#3c4a42] flex items-center justify-center text-[#4edea3] group-hover:border-[#4edea3]/50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-[#e3e1e9] flex items-center gap-1.5">
                EnvGuard
                <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/30">
                  OSS
                </span>
              </div>
              <div className="text-[10px] text-[#bbcabf] font-mono">Workspace</div>
            </div>
          </Link>
        </div>

        {/* Project Selector Dropdown */}
        <div className="p-3">
          <div className="relative w-full bg-[#1e1f25] border border-[#3c4a42] hover:border-[#10b981]/50 rounded-lg p-2 flex items-center justify-between text-xs text-[#e3e1e9] transition-colors">
            <div className="flex items-center gap-2 truncate flex-1 min-w-0 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
              <span className="truncate font-mono font-medium">
                {currentProject?.name || (projects.length > 0 ? 'Select Project' : 'No Projects')}
              </span>
            </div>
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                const targetId = e.target.value;
                if (targetId) {
                  window.location.href = `/projects/${targetId}`;
                } else {
                  window.location.href = '/projects';
                }
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="Switch Workspace Project"
              aria-label="Switch Workspace Project"
            >
              <option value="">-- All Projects --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[#86948a] text-[16px] pointer-events-none">unfold_more</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="px-2 space-y-1 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150',
                item.active
                  ? 'bg-[#1e1f25] text-[#4edea3] border-l-2 border-[#10b981]'
                  : 'text-[#bbcabf] hover:bg-[#1a1b21] hover:text-[#e3e1e9]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn('material-symbols-outlined text-[18px]', item.active ? 'text-[#4edea3]' : 'text-[#86948a]')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn('font-mono text-[10px] px-1.5 py-0.5 rounded', item.badgeVariant)}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Utilities & Actions */}
      <div className="p-3 space-y-3 border-t border-[#3c4a42]/60">
        {/* Quick Sync Button (only shown if user has permission to sync) */}
        {onOpenSyncModal && (
          <div className="bg-[#1a1b21] border border-[#3c4a42] rounded-lg p-2.5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="font-mono text-[11px] text-[#e3e1e9]">Sync Ready</span>
              </div>
              <span className="font-mono text-[10px] text-[#86948a]">Auto-Merge</span>
            </div>

            <button
              onClick={onOpenSyncModal}
              className="w-full h-7 bg-[#1e1f25] hover:bg-[#292a2f] text-[#bbcabf] hover:text-[#e3e1e9] border border-[#3c4a42] rounded text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">sync</span>
              Sync Variables
            </button>
          </div>
        )}

        {/* External Links */}
        <div className="space-y-2 pt-1 border-t border-[#3c4a42]/40">
          <div className="flex items-center justify-between px-1 text-[11px] text-[#86948a]">
            <Link href="/landing" className="hover:text-[#e3e1e9] flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              Docs
            </Link>
            <a
              href="https://github.com/anzamuneebkhanofficial/envguard"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#e3e1e9] flex items-center gap-1 transition-colors font-mono"
            >
              <span className="material-symbols-outlined text-[14px]">code</span>
              GitHub
            </a>
          </div>

          <a
            href="https://muhammadanzamuneebkhan.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-1 text-[10px] text-[#4edea3] hover:text-[#4edea3]/80 transition-colors font-mono truncate"
            title="Portfolio of Muhammad Anza Muneeb Khan"
          >
            <span className="material-symbols-outlined text-[13px]">person</span>
            By Anza Muneeb Khan
          </a>
        </div>
      </div>
    </aside>
  );
}
