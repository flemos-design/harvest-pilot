import { apiClient } from './client';
import type { Propriedade, CreatePropriedadeDto } from '@/types';

export const propriedadesApi = {
  getAll: async (organizacaoId?: string) => {
    const params = organizacaoId ? { organizacaoId } : {};
    const { data } = await apiClient.get<Propriedade[]>('/propriedades', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Propriedade>(`/propriedades/${id}`);
    return data;
  },

  create: async (propriedade: CreatePropriedadeDto) => {
    const { data } = await apiClient.post<Propriedade>('/propriedades', propriedade);
    return data;
  },

  update: async (id: string, propriedade: Partial<CreatePropriedadeDto>) => {
    const { data } = await apiClient.patch<Propriedade>(`/propriedades/${id}`, propriedade);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/propriedades/${id}`);
  },
};
