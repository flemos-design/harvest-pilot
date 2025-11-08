import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meteorologiaApi } from '@/lib/api';
import type { CreateMeteoParcelaDto } from '@/types';

export function useMeteorologias(parcelaId?: string, fonte?: string) {
  return useQuery({
    queryKey: ['meteorologia', parcelaId, fonte],
    queryFn: () => meteorologiaApi.getAll(parcelaId, fonte),
  });
}

export function useMeteorologia(id: string) {
  return useQuery({
    queryKey: ['meteorologia', id],
    queryFn: () => meteorologiaApi.getById(id),
    enabled: !!id,
  });
}

export function useLatestMeteoParcela(parcelaId: string) {
  return useQuery({
    queryKey: ['meteorologia', 'latest', parcelaId],
    queryFn: () => meteorologiaApi.getLatestByParcela(parcelaId),
    enabled: !!parcelaId,
  });
}

export function useForecast(parcelaId: string, days: number = 7) {
  return useQuery({
    queryKey: ['meteorologia', 'forecast', parcelaId, days],
    queryFn: () => meteorologiaApi.getForecast(parcelaId, days),
    enabled: !!parcelaId,
  });
}

export function useHistoricoMeteo(
  parcelaId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['meteorologia', 'historico', parcelaId, startDate, endDate],
    queryFn: () => meteorologiaApi.getHistorico(parcelaId, startDate, endDate),
    enabled: !!parcelaId,
  });
}

export function useMeteoStats(
  parcelaId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['meteorologia', 'stats', parcelaId, startDate, endDate],
    queryFn: () => meteorologiaApi.getStats(parcelaId, startDate, endDate),
    enabled: !!parcelaId,
  });
}

export function useCreateMeteoParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeteoParcelaDto) => meteorologiaApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meteorologia'] });
      queryClient.invalidateQueries({ queryKey: ['parcelas', variables.parcelaId] });
    },
  });
}

export function useUpdateMeteoParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMeteoParcelaDto> }) =>
      meteorologiaApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meteorologia'] });
      queryClient.invalidateQueries({ queryKey: ['meteorologia', variables.id] });
      if (variables.data.parcelaId) {
        queryClient.invalidateQueries({ queryKey: ['parcelas', variables.data.parcelaId] });
      }
    },
  });
}

export function useDeleteMeteoParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meteorologiaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meteorologia'] });
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
    },
  });
}
