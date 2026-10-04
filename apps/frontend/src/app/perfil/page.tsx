'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Shield, Building2, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function PerfilPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Meu Perfil" subtitle="Dados da conta autenticada" actions={<Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-emerald-600"><ArrowLeft className="w-4 h-4" />Voltar</Link>} />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <div className="space-y-5">
            <div className="flex items-center gap-3"><User className="w-5 h-5 text-emerald-600" /><div><p className="text-xs text-slate-500">Nome</p><p className="font-medium">{user.nome}</p></div></div>
            <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-emerald-600" /><div><p className="text-xs text-slate-500">Email</p><p className="font-medium">{user.email}</p></div></div>
            <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-emerald-600" /><div><p className="text-xs text-slate-500">Papel</p><p className="font-medium">{user.papel}</p></div></div>
            <div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-emerald-600" /><div><p className="text-xs text-slate-500">Organização</p><p className="font-medium">{user.organizacao.nome}</p></div></div>
          </div>
        </Card>
        <div id="definicoes" className="mt-6">
          <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Definições</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Preferências da interface nesta sessão.</p>
            </div>
            <button type="button" onClick={toggleTheme} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </button>
          </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
