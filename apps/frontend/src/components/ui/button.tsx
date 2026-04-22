import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      loading = false,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed';

    const variantClasses = {
      primary:
        'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 hover:shadow-emerald-900/40',
      secondary:
        'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
      danger:
        'bg-red-600 text-white shadow-lg shadow-red-900/30 hover:bg-red-500 hover:shadow-red-900/40',
      destructive:
        'bg-red-600 text-white shadow-lg shadow-red-900/30 hover:bg-red-500 hover:shadow-red-900/40',
      ghost:
        'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
      outline:
        'border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50 hover:text-white',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-4 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-sm rounded-xl',
      icon: 'h-9 w-9 p-0 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
