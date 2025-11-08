import { apiClient } from './client';
import type { Ciclo, CreateCicloDto, CicloStats } from '@/types';

export const ciclosApi = {
  getAll: async (culturaId?: string) => {
    const params = culturaId ? { culturaId } : {};
    const { data } = await apiClient.get<Ciclo[]>('/ciclos', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Ciclo>(`/ciclos/${id}`);
    return data;
  },

  getStats: async (culturaId?: string) => {
    const params = culturaId ? { culturaId } : {};
    const { data } = await apiClient.get<CicloStats>('/ciclos/stats', { params });
    return data;
  },

  create: async (ciclo: CreateCicloDto) => {
    const { data } = await apiClient.post<Ciclo>('/ciclos', ciclo);
    return data;
  },

  update: async (id: string, ciclo: Partial<CreateCicloDto>) => {
    const { data } = await apiClient.patch<Ciclo>(`/ciclos/${id}`, ciclo);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/ciclos/${id}`);
  },
};
