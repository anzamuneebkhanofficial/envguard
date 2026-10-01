'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  projectName?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onOpenSyncModal?: () => void;
  onOpenExportModal?: () => void;
  onExportExample?: () => void;
}

export function Header({
  projectName = 'my-express-api',
  searchQuery = '',
  onSearchChange,
  onOpenSyncModal,
  onOpenExportModal,
  onExportExample,
}: HeaderProps) {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="h-14 bg-[#121318]/90 backdrop-blur-md border-b border-[#3c4a42] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/projects" className="text-[#86948a] hover:text-[#e3e1e9] transition-colors">
          Projects
        </Link>
        <span className="text-[#86948a]">/</span>
        <span className="font-mono font-medium text-[#e3e1e9] truncate max-w-[180px]">
          {projectName}
        </span>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/30">
          production
        </span>
      </div>

      {/* Search Input */}
      {onSearchChange && (
        <div className="hidden md:flex items-center w-72 relative">
          <span
            className="material-symbols-outlined absolute left-2.5 text-[#86948a] text-[18px] pointer-events-none"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter keys (e.g. STRIPE_, JWT_)…"
            aria-label="Filter environment variable keys"
            className="w-full h-8 bg-[#1e1f25] text-xs font-mono text-[#e3e1e9] placeholder-[#86948a] rounded-lg border border-[#3c4a42] pl-8 pr-3 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-colors"
          />
        </div>
      )}

      {/* Action Cluster */}
      <div className="flex items-center gap-2">
        {onOpenSyncModal && (
          <Button
            variant="secondary"
            size="sm"
            icon="sync"
            onClick={onOpenSyncModal}
            className="hidden sm:inline-flex"
          >
            Sync Variables
          </Button>
        )}

        {onOpenExportModal ? (
          <Button
            variant="secondary"
            size="sm"
            icon="download"
            onClick={onOpenExportModal}
            className="hidden sm:inline-flex"
          >
            Export Variables
          </Button>
        ) : onExportExample ? (
          <Button
            variant="secondary"
            size="sm"
            icon="download"
            onClick={onExportExample}
            className="hidden sm:inline-flex"
          >
            Download Template
          </Button>
        ) : null}

        <div className="h-4 w-px bg-[#3c4a42] mx-1 hidden sm:block" />

        {/* User initials avatar */}
        <div className="flex items-center gap-2">
          {isAuthLoading ? (
            <div className="w-8 h-8 rounded-full bg-[#1e1f25] animate-pulse" />
          ) : (
            <div
              title={user?.email || 'Logged in user'}
              className="w-8 h-8 rounded-full bg-[#acedff] text-[#001f26] font-mono text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm select-none"
            >
              {initials}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout('/login')}
            title="Log Out"
            className="text-[#86948a] hover:text-rose-400"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

