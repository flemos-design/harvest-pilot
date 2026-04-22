'use client';

import { Sprout } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-900/30 blur-[120px]" />
        <div className="absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full bg-teal-900/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-950/40 blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo & Brand */}
        <div className="mb-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-900/50">
            <Sprout className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            HarvestPilot
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-forwards delay-150">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            {title && (
              <div className="mb-6 text-center">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              </div>
            )}
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-600 animate-in fade-in duration-1000 delay-300">
          © {new Date().getFullYear()} HarvestPilot. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
