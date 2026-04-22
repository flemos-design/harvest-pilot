import { ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
      <div className="text-slate-300 dark:text-slate-600 mx-auto mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all"
          >
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}
