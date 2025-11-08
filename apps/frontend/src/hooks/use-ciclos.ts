import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ciclosApi } from '@/lib/api';
import type { CreateCicloDto } from '@/types';

export function useCiclos(culturaId?: string) {
  return useQuery({
    queryKey: ['ciclos', culturaId],
    queryFn: () => ciclosApi.getAll(culturaId),
  });
}

export function useCiclo(id: string) {
  return useQuery({
    queryKey: ['ciclos', id],
    queryFn: () => ciclosApi.getById(id),
    enabled: !!id,
  });
}

export function useCicloStats(culturaId?: string) {
  return useQuery({
    queryKey: ['ciclos', 'stats', culturaId],
    queryFn: () => ciclosApi.getStats(culturaId),
  });
}

export function useCreateCiclo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCicloDto) => ciclosApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
      queryClient.invalidateQueries({ queryKey: ['culturas', variables.culturaId] });
    },
  });
}

export function useUpdateCiclo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCicloDto> }) =>
      ciclosApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
      queryClient.invalidateQueries({ queryKey: ['ciclos', variables.id] });
      if (variables.data.culturaId) {
        queryClient.invalidateQueries({ queryKey: ['culturas', variables.data.culturaId] });
      }
    },
  });
}

export function useDeleteCiclo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ciclosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
      queryClient.invalidateQueries({ queryKey: ['culturas'] });
    },
  });
}
