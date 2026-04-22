import { apiClient } from './client';
import type { ChatMessage, ChatResponse, Insight, CriticalParcela } from '@/types';

export interface ConversaIA {
  id: string;
  organizacaoId: string;
  titulo: string;
  createdAt: string;
  updatedAt: string;
}

export interface MensagemIA {
  id: string;
  conversaId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

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

  // Conversas
  getConversas: async (organizacaoId: string): Promise<ConversaIA[]> => {
    const { data } = await apiClient.get<ConversaIA[]>('/ia/conversas', {
      params: { organizacaoId },
    });
    return data;
  },

  getConversa: async (id: string): Promise<ConversaIA & { mensagens: MensagemIA[] }> => {
    const { data } = await apiClient.get(`/ia/conversas/${id}`);
    return data;
  },

  createConversa: async (organizacaoId: string, titulo: string): Promise<ConversaIA> => {
    const { data } = await apiClient.post<ConversaIA>('/ia/conversas', { organizacaoId, titulo });
    return data;
  },

  updateConversa: async (id: string, titulo: string): Promise<ConversaIA> => {
    const { data } = await apiClient.patch<ConversaIA>(`/ia/conversas/${id}`, { titulo });
    return data;
  },

  deleteConversa: async (id: string): Promise<void> => {
    await apiClient.delete(`/ia/conversas/${id}`);
  },
};
