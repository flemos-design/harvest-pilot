import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'gray' | 'slate' | 'cyan' | 'orange';
  size?: 'sm' | 'md';
  className?: string;
}

const variantMap: Record<string, string> = {
  green:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  blue:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  amber:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  red:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  purple:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  cyan:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  orange:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  gray:
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  slate:
    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

const sizeMap: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'slate', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantMap[variant],
        sizeMap[size],
        className
      )}
    >
      {children}
    </span>
  );
}
