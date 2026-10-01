import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'critical' | 'added' | 'modified' | 'deleted' | 'standard' | 'secondary';
  icon?: string;
}

export function Badge({ className, variant = 'standard', icon, children, ...props }: BadgeProps) {
  const variants = {
    critical: 'bg-[#e29100]/10 text-[#ffb95f] border border-[#ffb95f]/30',
    added: 'bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/30',
    modified: 'bg-[#03b5d3]/20 text-[#4cd7f6] border border-[#03b5d3]/30',
    deleted: 'bg-[#93000a]/20 text-[#ffb4ab] border border-rose-500/30',
    standard: 'bg-[#1e1f25] text-[#86948a] border border-[#3c4a42]/50',
    secondary: 'bg-[#03b5d3]/20 text-[#4cd7f6] border border-[#03b5d3]/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[13px]">{icon}</span>}
      {children}
    </span>
  );
}
