import { apiClient } from './client';
import type { Cultura, CreateCulturaDto, CulturaStats } from '@/types';

export const culturasApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Cultura[]>('/culturas');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Cultura>(`/culturas/${id}`);
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get<CulturaStats>('/culturas/stats');
    return data;
  },

  create: async (cultura: CreateCulturaDto) => {
    const { data } = await apiClient.post<Cultura>('/culturas', cultura);
    return data;
  },

  update: async (id: string, cultura: Partial<CreateCulturaDto>) => {
    const { data } = await apiClient.patch<Cultura>(`/culturas/${id}`, cultura);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/culturas/${id}`);
  },
};
