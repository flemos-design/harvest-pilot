import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propriedadesApi } from '@/lib/api';
import type { CreatePropriedadeDto } from '@/types';

export function usePropriedades(organizacaoId?: string) {
  return useQuery({
    queryKey: ['propriedades', organizacaoId],
    queryFn: () => propriedadesApi.getAll(organizacaoId),
  });
}

export function usePropriedade(id: string) {
  return useQuery({
    queryKey: ['propriedades', id],
    queryFn: () => propriedadesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePropriedade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropriedadeDto) => propriedadesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propriedades'] });
    },
  });
}

export function useUpdatePropriedade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePropriedadeDto> }) =>
      propriedadesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['propriedades'] });
      queryClient.invalidateQueries({ queryKey: ['propriedades', variables.id] });
    },
  });
}

export function useDeletePropriedade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propriedadesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propriedades'] });
    },
  });
}
