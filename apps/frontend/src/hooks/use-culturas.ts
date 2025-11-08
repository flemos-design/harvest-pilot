import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { culturasApi } from '@/lib/api';
import type { CreateCulturaDto } from '@/types';

export function useCulturas() {
  return useQuery({
    queryKey: ['culturas'],
    queryFn: () => culturasApi.getAll(),
  });
}

export function useCultura(id: string) {
  return useQuery({
    queryKey: ['culturas', id],
    queryFn: () => culturasApi.getById(id),
    enabled: !!id,
  });
}

export function useCulturaStats() {
  return useQuery({
    queryKey: ['culturas', 'stats'],
    queryFn: () => culturasApi.getStats(),
  });
}

export function useCreateCultura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCulturaDto) => culturasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culturas'] });
    },
  });
}

export function useUpdateCultura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCulturaDto> }) =>
      culturasApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['culturas'] });
      queryClient.invalidateQueries({ queryKey: ['culturas', variables.id] });
    },
  });
}

export function useDeleteCultura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => culturasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['culturas'] });
    },
  });
}
