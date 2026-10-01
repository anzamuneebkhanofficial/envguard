'use client';

import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: string;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, loading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#06b6d4] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-[#10b981] text-[#003824] font-mono font-medium hover:brightness-110 shadow-sm border border-[#4edea3]/30',
      secondary:
        'bg-[#1e1f25] text-[#bbcabf] hover:bg-[#292a2f] hover:text-[#e3e1e9] border border-[#3c4a42]',
      ghost:
        'bg-transparent text-[#bbcabf] hover:bg-[#1e1f25] hover:text-[#e3e1e9]',
      destructive:
        'bg-transparent text-[#ffb4ab] border border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40',
      outline:
        'bg-transparent text-[#e3e1e9] border border-[#3c4a42] hover:bg-[#1e1f25]',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs rounded-md gap-1.5',
      md: 'h-9 px-3.5 text-sm rounded-lg gap-2',
      lg: 'h-11 px-5 text-base rounded-lg gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-lg justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
        ) : icon ? (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
