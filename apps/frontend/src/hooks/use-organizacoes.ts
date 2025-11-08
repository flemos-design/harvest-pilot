import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizacoesApi } from '@/lib/api';
import type { CreateOrganizacaoDto } from '@/types';

export function useOrganizacoes() {
  return useQuery({
    queryKey: ['organizacoes'],
    queryFn: () => organizacoesApi.getAll(),
  });
}

export function useOrganizacao(id: string) {
  return useQuery({
    queryKey: ['organizacoes', id],
    queryFn: () => organizacoesApi.getById(id),
    enabled: !!id,
  });
}

export function useOrganizacaoBySlug(slug: string) {
  return useQuery({
    queryKey: ['organizacoes', 'slug', slug],
    queryFn: () => organizacoesApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useOrganizacoesStats() {
  return useQuery({
    queryKey: ['organizacoes', 'stats'],
    queryFn: () => organizacoesApi.getStats(),
  });
}

export function useCreateOrganizacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizacaoDto) => organizacoesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizacoes'] });
    },
  });
}

export function useUpdateOrganizacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOrganizacaoDto> }) =>
      organizacoesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizacoes'] });
    },
  });
}

export function useDeleteOrganizacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizacoesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizacoes'] });
    },
  });
}
