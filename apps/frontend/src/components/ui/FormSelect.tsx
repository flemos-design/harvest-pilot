import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, icon, error, helperText, className, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white dark:bg-slate-800/50 py-2.5 text-sm text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500/30 appearance-none',
              icon ? 'pl-10 pr-10' : 'px-4 pr-10',
              error
                ? 'border-red-500/50 focus:border-red-500/50'
                : 'border-slate-300 dark:border-slate-700/50 focus:border-emerald-500/50',
              className
            )}
            {...props}
          >
            {children}
          </select>
          {/* Dropdown arrow */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
