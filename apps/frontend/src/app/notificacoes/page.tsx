'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, Check, Trash2, AlertTriangle, CloudRain, Sprout,
  ClipboardList, Info, Filter, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

const tipoConfig: Record<string, { icon: React.ReactNode; label: string; variant: 'green' | 'blue' | 'orange' | 'amber' | 'slate' }> = {
  NDVI: { icon: <Sprout className="w-5 h-5" />, label: 'NDVI', variant: 'green' },
  METEO: { icon: <CloudRain className="w-5 h-5" />, label: 'Meteorologia', variant: 'blue' },
  TAREFA: { icon: <ClipboardList className="w-5 h-5" />, label: 'Tarefa', variant: 'orange' },
  STOCK: { icon: <AlertTriangle className="w-5 h-5" />, label: 'Stock', variant: 'amber' },
  SISTEMA: { icon: <Info className="w-5 h-5" />, label: 'Sistema', variant: 'slate' },
};

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

type FilterType = 'all' | 'unread' | 'NDVI' | 'METEO' | 'TAREFA' | 'STOCK' | 'SISTEMA';

export default function NotificacoesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { notificacoes, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotificacao } =
    useNotificacoes(user?.id);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = notificacoes.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.lida;
    return n.tipo === filter;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Todas (${notificacoes.length})` },
    { key: 'unread', label: `Não lidas (${unreadCount})` },
    { key: 'NDVI', label: 'NDVI' },
    { key: 'METEO', label: 'Meteo' },
    { key: 'TAREFA', label: 'Tarefas' },
    { key: 'STOCK', label: 'Stock' },
    { key: 'SISTEMA', label: 'Sistema' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Notificações" />
        <div className="container mx-auto px-4 py-8">
          <LoadingState fullPage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Notificações"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'} de ${notificacoes.length} total`
            : `${notificacoes.length} notificações no total`
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="primary"
              size="md"
              icon={<Check className="w-4 h-4" />}
              onClick={() => markAllAsRead()}
            >
              Marcar todas como lidas
            </Button>
          ) : undefined
        }
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === f.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-16 h-16" />}
            title="Sem notificações"
            description={
              filter === 'unread'
                ? 'Não tens notificações não lidas.'
                : filter !== 'all'
                  ? `Não tens notificações do tipo ${filter}.`
                  : 'As notificações aparecem aqui automaticamente.'
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const config = tipoConfig[notif.tipo] || tipoConfig.SISTEMA;
              return (
                <Card
                  key={notif.id}
                  className={`transition hover:shadow-sm ${
                    !notif.lida
                      ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl shrink-0 bg-${config.variant}-50 dark:bg-${config.variant}-900/20 text-${config.variant}-600 dark:text-${config.variant}-400`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant={config.variant} size="sm">{config.label}</Badge>
                          <h3 className={`text-sm font-semibold mt-1 ${
                            !notif.lida ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'
                          }`}>
                            {notif.titulo}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notif.mensagem}</p>
                      {notif.link && (
                        <button
                          onClick={() => router.push(notif.link!)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-2"
                        >
                          Ver detalhes →
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!notif.lida && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotificacao(notif.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
