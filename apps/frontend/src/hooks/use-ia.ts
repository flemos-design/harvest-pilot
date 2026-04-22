import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { iaApi } from '@/lib/api';
import type { ChatMessage, Insight, CriticalParcela } from '@/types';

export function useChat() {
  return useMutation({
    mutationFn: (message: ChatMessage) => iaApi.chat(message),
  });
}

export function useInsights(organizacaoId: string) {
  return useQuery({
    queryKey: ['insights', organizacaoId],
    queryFn: () => iaApi.getInsights(organizacaoId),
    enabled: !!organizacaoId,
  });
}

export function useCriticalParcelas(organizacaoId: string) {
  return useQuery({
    queryKey: ['critical-parcelas', organizacaoId],
    queryFn: () => iaApi.getCriticalParcelas(organizacaoId),
    enabled: !!organizacaoId,
  });
}

// Conversas IA
export function useConversas(organizacaoId: string) {
  return useQuery({
    queryKey: ['conversas-ia', organizacaoId],
    queryFn: () => iaApi.getConversas(organizacaoId),
    enabled: !!organizacaoId,
  });
}

export function useConversa(id: string) {
  return useQuery({
    queryKey: ['conversa-ia', id],
    queryFn: () => iaApi.getConversa(id),
    enabled: !!id,
  });
}

export function useCreateConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizacaoId, titulo }: { organizacaoId: string; titulo: string }) =>
      iaApi.createConversa(organizacaoId, titulo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversas-ia', variables.organizacaoId] });
    },
  });
}

export function useUpdateConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, titulo, organizacaoId }: { id: string; titulo: string; organizacaoId: string }) =>
      iaApi.updateConversa(id, titulo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversas-ia', variables.organizacaoId] });
      queryClient.invalidateQueries({ queryKey: ['conversa-ia', variables.id] });
    },
  });
}

export function useDeleteConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, organizacaoId }: { id: string; organizacaoId: string }) =>
      iaApi.deleteConversa(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversas-ia', variables.organizacaoId] });
    },
  });
}
