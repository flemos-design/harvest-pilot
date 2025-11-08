import { apiClient } from './client';
import type { ImagemRemota, CreateImagemRemotaDto } from '@/types';

export const imagensRemotasApi = {
  getAll: async (parcelaId?: string) => {
    const params = parcelaId ? { parcelaId } : {};
    const { data } = await apiClient.get<ImagemRemota[]>('/imagens-remotas', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ImagemRemota>(`/imagens-remotas/${id}`);
    return data;
  },

  getLatestByParcela: async (parcelaId: string) => {
    const { data } = await apiClient.get<ImagemRemota>(`/imagens-remotas/latest/${parcelaId}`);
    return data;
  },

  getTimeSeries: async (parcelaId: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const { data } = await apiClient.get<ImagemRemota[]>(
      `/imagens-remotas/timeseries/${parcelaId}`,
      { params }
    );
    return data;
  },

  create: async (imagemRemota: CreateImagemRemotaDto) => {
    const { data } = await apiClient.post<ImagemRemota>('/imagens-remotas', imagemRemota);
    return data;
  },

  update: async (id: string, imagemRemota: Partial<CreateImagemRemotaDto>) => {
    const { data } = await apiClient.patch<ImagemRemota>(`/imagens-remotas/${id}`, imagemRemota);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/imagens-remotas/${id}`);
  },
};
