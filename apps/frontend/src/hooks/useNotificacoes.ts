import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string;
  createdAt: string;
}

async function fetchNotificacoes(userId: string, lida?: boolean) {
  const params = new URLSearchParams({ userId });
  if (lida !== undefined) params.append('lida', String(lida));
  const { data } = await apiClient.get<Notificacao[]>(`/notificacoes?${params}`);
  return data;
}

async function fetchUnreadCount(userId: string) {
  const { data } = await apiClient.get<number>(`/notificacoes/unread-count?userId=${userId}`);
  return data;
}

async function markAsRead(id: string) {
  const { data } = await apiClient.patch<Notificacao>(`/notificacoes/${id}/lida`);
  return data;
}

async function markAllAsRead(userId: string) {
  const { data } = await apiClient.patch(`/notificacoes/marcar-todas-lidas?userId=${userId}`);
  return data;
}

async function deleteNotificacao(id: string) {
  await apiClient.delete(`/notificacoes/${id}`);
}

export function useNotificacoes(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ['notificacoes', userId],
    queryFn: () => fetchNotificacoes(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notificacoes-unread', userId],
    queryFn: () => fetchUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', userId] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes-unread', userId] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User ID required');
      return markAllAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', userId] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes-unread', userId] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteNotificacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', userId] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes-unread', userId] });
    },
  });

  return {
    notificacoes,
    unreadCount,
    isLoading,
    markAsRead: markRead.mutate,
    markAllAsRead: markAllRead.mutate,
    deleteNotificacao: remove.mutate,
  };
}
