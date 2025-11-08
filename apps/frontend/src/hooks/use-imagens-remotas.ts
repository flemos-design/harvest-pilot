import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagensRemotasApi } from '@/lib/api';
import type { CreateImagemRemotaDto } from '@/types';

export function useImagensRemotas(parcelaId?: string) {
  return useQuery({
    queryKey: ['imagens-remotas', parcelaId],
    queryFn: () => imagensRemotasApi.getAll(parcelaId),
  });
}

export function useImagemRemota(id: string) {
  return useQuery({
    queryKey: ['imagens-remotas', id],
    queryFn: () => imagensRemotasApi.getById(id),
    enabled: !!id,
  });
}

export function useLatestImagemRemota(parcelaId: string) {
  return useQuery({
    queryKey: ['imagens-remotas', 'latest', parcelaId],
    queryFn: () => imagensRemotasApi.getLatestByParcela(parcelaId),
    enabled: !!parcelaId,
  });
}

export function useImagensRemotasTimeSeries(
  parcelaId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['imagens-remotas', 'timeseries', parcelaId, startDate, endDate],
    queryFn: () => imagensRemotasApi.getTimeSeries(parcelaId, startDate, endDate),
    enabled: !!parcelaId,
  });
}

export function useCreateImagemRemota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateImagemRemotaDto) => imagensRemotasApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['imagens-remotas'] });
      queryClient.invalidateQueries({ queryKey: ['parcelas', variables.parcelaId] });
    },
  });
}

export function useUpdateImagemRemota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateImagemRemotaDto> }) =>
      imagensRemotasApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['imagens-remotas'] });
      queryClient.invalidateQueries({ queryKey: ['imagens-remotas', variables.id] });
      if (variables.data.parcelaId) {
        queryClient.invalidateQueries({ queryKey: ['parcelas', variables.data.parcelaId] });
      }
    },
  });
}

export function useDeleteImagemRemota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => imagensRemotasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagens-remotas'] });
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
    },
  });
}
