import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, showPasswordToggle, ...props }, ref) => {
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = React.useState(false);

    const canToggle = isPassword || showPasswordToggle;
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          {icon && (
            <span className="material-symbols-outlined absolute left-2.5 text-[#86948a] text-[18px] pointer-events-none select-none">
              {icon}
            </span>
          )}
          <input
            type={inputType}
            ref={ref}
            className={cn(
              'w-full h-9 bg-[#1a1b21] text-[#e3e1e9] placeholder-[#86948a] text-sm rounded-lg border border-[#3c4a42] px-3 transition-colors duration-150',
              'focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-9',
              canToggle && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          />
          {canToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 flex items-center justify-center text-[#86948a] hover:text-[#e3e1e9] focus:outline-none transition-colors"
              title={showPassword ? 'Hide secret value' : 'Show secret value'}
              aria-label={showPassword ? 'Hide secret value' : 'Show secret value'}
            >
              <span className="material-symbols-outlined text-[18px] select-none">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
