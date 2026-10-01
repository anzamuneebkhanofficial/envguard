'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

interface MobileNavProps {
  projectId?: string;
  projectName?: string;
}

export function MobileNav({ projectId, projectName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: 'Variables', href: projectId ? `/projects/${projectId}` : '/projects', icon: 'folder_open' },
    { label: 'Audit History', href: projectId ? `/projects/${projectId}/history` : '/projects', icon: 'history' },
    { label: 'Alerts & Webhooks', href: projectId ? `/projects/${projectId}/settings` : '/projects', icon: 'warning' },
    { label: 'All Projects', href: '/projects', icon: 'deployed_code' },
    { label: 'Landing Page', href: '/landing', icon: 'home' },
  ];

  return (
    <div className="md:hidden border-b border-[#3c4a42] bg-[#121318] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded bg-[#1e1f25] border border-[#3c4a42] text-[#e3e1e9]"
        >
          <span className="material-symbols-outlined text-[20px]">{isOpen ? 'close' : 'menu'}</span>
        </button>
        <span className="font-semibold text-sm text-[#e3e1e9]">EnvGuard</span>
        {projectName && (
          <span className="text-xs text-[#86948a] font-mono truncate max-w-[120px]">/ {projectName}</span>
        )}
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[10px] font-bold flex items-center justify-center">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#121318] border-b border-[#3c4a42] p-4 space-y-3 shadow-2xl">
          {user && (
            <div className="pb-2 border-b border-[#3c4a42]/60 flex items-center justify-between text-xs font-mono">
              <span className="text-[#bbcabf] truncate max-w-[180px]">{user.name || user.email}</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout('/login');
                }}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
              >
                <span className="material-symbols-outlined text-[14px]">logout</span>
                Log Out
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#1e1f25] text-[#4edea3]'
                      : 'text-[#bbcabf] hover:bg-[#1a1b21] hover:text-[#e3e1e9]'
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

