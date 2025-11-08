import { useMutation, useQuery } from '@tanstack/react-query';
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
