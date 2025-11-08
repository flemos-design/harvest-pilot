import { apiClient } from './client';
import type { ChatMessage, ChatResponse, Insight, CriticalParcela } from '@/types';

export const iaApi = {
  chat: async (message: ChatMessage): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/ia/chat', message);
    return data;
  },

  getInsights: async (organizacaoId: string): Promise<Insight[]> => {
    const { data } = await apiClient.get<Insight[]>('/ia/insights', {
      params: { organizacaoId },
    });
    return data;
  },

  getCriticalParcelas: async (organizacaoId: string): Promise<CriticalParcela[]> => {
    const { data } = await apiClient.get<CriticalParcela[]>('/ia/critical-parcelas', {
      params: { organizacaoId },
    });
    return data;
  },
};
