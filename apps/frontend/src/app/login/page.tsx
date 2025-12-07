'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.password, data.rememberMe);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifica as tuas credenciais.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-lime-50 to-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 h-64 w-64 -translate-x-1/2 rounded-full bg-lime-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <div className="relative flex items-center justify-center gap-4">
            <div className="rounded-2xl bg-white/80 p-4 shadow-xl backdrop-blur">
              <img src="/logo.png" alt="HarvestPilot Logo" className="h-20 w-20 drop-shadow-xl" />
            </div>
            <div className="text-left">
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-700">HarvestPilot</p>
              <p className="text-lg font-semibold text-slate-800">Gestão agrícola com satélite & meteo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm text-slate-700">Ambiente de desenvolvimento</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/80 p-8 shadow-xl backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent" />
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Operações, parcelas e agenda num só lugar
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Inicia sessão e continua a operação</h1>
              <p className="text-base text-slate-700">
                Monitoriza parcelas, regista operações, acompanha o calendário agrícola e consulta meteo e satélite em tempo real.
              </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-sm text-slate-800">
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">Talhões ativos</p>
                    <p className="text-xl font-semibold text-emerald-700">+20</p>
                  </div>
                <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Últimas operações</p>
                  <p className="text-xl font-semibold text-emerald-700">GPS + custos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Iniciar Sessão</h2>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 shadow-inner focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="nome@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 shadow-inner focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
                  />
                  Manter sessão iniciada
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Esqueceste-te da password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 px-4 py-3 text-white shadow-lg transition hover:shadow-emerald-200 disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    A entrar...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-700">
              Ainda não tens conta?{' '}
              <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
