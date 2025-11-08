import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parcelasApi } from '@/lib/api';
import type { CreateParcelaDto } from '@/types';

export function useParcelas(propriedadeId?: string) {
  return useQuery({
    queryKey: ['parcelas', propriedadeId],
    queryFn: () => parcelasApi.getAll(propriedadeId),
  });
}

export function useParcela(id: string) {
  return useQuery({
    queryKey: ['parcelas', id],
    queryFn: () => parcelasApi.getById(id),
    enabled: !!id,
  });
}

export function useParcelaStats(id: string) {
  return useQuery({
    queryKey: ['parcelas', id, 'stats'],
    queryFn: () => parcelasApi.getStats(id),
    enabled: !!id,
  });
}

export function useCreateParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateParcelaDto) => parcelasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
    },
  });
}

export function useUpdateParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateParcelaDto> }) =>
      parcelasApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      queryClient.invalidateQueries({ queryKey: ['parcelas', variables.id] });
    },
  });
}

export function useDeleteParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => parcelasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
    },
  });
}
