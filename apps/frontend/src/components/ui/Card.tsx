import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'colored';
  color?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan' | 'slate';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap: Record<string, string> = {
  green: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
  blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  amber: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800',
  slate: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700',
};

const paddingMap: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  variant = 'default',
  color = 'slate',
  padding = 'md',
  className,
}: CardProps) {
  const baseClasses = 'rounded-2xl border shadow-sm transition';

  const variantClasses = {
    default:
      'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    glass:
      'bg-slate-900/80 backdrop-blur-xl border-slate-800/60',
    colored: colorMap[color] || colorMap.slate,
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
