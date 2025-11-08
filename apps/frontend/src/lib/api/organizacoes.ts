import { apiClient } from './client';
import type { Organizacao, CreateOrganizacaoDto, OrganizacaoStats } from '@/types';

export const organizacoesApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Organizacao[]>('/organizacoes');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Organizacao>(`/organizacoes/${id}`);
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await apiClient.get<Organizacao>(`/organizacoes/slug/${slug}`);
    return data;
  },

  getStats: async () => {
    const { data} = await apiClient.get<OrganizacaoStats>('/organizacoes/stats');
    return data;
  },

  create: async (organizacao: CreateOrganizacaoDto) => {
    const { data } = await apiClient.post<Organizacao>('/organizacoes', organizacao);
    return data;
  },

  update: async (id: string, organizacao: Partial<CreateOrganizacaoDto>) => {
    const { data } = await apiClient.patch<Organizacao>(`/organizacoes/${id}`, organizacao);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/organizacoes/${id}`);
  },
};
