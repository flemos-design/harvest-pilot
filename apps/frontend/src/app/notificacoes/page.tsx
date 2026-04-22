'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  CloudRain,
  Sprout,
  ClipboardList,
  Info,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/hooks/useNotificacoes';

const tipoConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  NDVI: {
    icon: <Sprout className="w-5 h-5" />,
    label: 'NDVI',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  METEO: {
    icon: <CloudRain className="w-5 h-5" />,
    label: 'Meteorologia',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  TAREFA: {
    icon: <ClipboardList className="w-5 h-5" />,
    label: 'Tarefa',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  STOCK: {
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Stock',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  SISTEMA: {
    icon: <Info className="w-5 h-5" />,
    label: 'Sistema',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notificações</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'} de ${notificacoes.length} total`
                : `${notificacoes.length} notificações no total`}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === f.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sem notificações</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filter === 'unread'
              ? 'Não tens notificações não lidas.'
              : filter !== 'all'
                ? `Não tens notificações do tipo ${filter}.`
                : 'As notificações aparecem aqui automaticamente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const config = tipoConfig[notif.tipo] || tipoConfig.SISTEMA;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition hover:shadow-sm ${
                  !notif.lida
                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${config.bg} ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <h3
                        className={`text-sm font-semibold mt-1 ${
                          !notif.lida
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {notif.titulo}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.mensagem}</p>
                  {notif.link && (
                    <button
                      onClick={() => router.push(notif.link!)}
                      className="text-xs text-green-600 hover:text-green-700 font-medium mt-2"
                    >
                      Ver detalhes →
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {!notif.lida && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      title="Marcar como lida"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotificacao(notif.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
