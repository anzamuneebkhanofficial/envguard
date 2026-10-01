'use client';

import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-w-lg rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 text-[#e3e1e9] shadow-2xl shadow-black/80 z-10 animate-in fade-in zoom-in-95 duration-150',
          className
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#e3e1e9]">{title}</h2>
            {description && <p className="text-xs text-[#bbcabf] mt-1">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-[#86948a] hover:text-[#e3e1e9]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
