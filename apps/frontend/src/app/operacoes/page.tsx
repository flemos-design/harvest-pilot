'use client';

import { useOperacoes } from '@/hooks/use-operacoes';
import { ClipboardList, Calendar, DollarSign, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';

const TIPO_ICONS: Record<string, string> = {
  PLANTACAO: '🌱', REGA: '💧', ADUBACAO: '🌿', TRATAMENTO: '🧪',
  COLHEITA: '🌾', INSPECAO: '🔍', PODA: '✂️', DESBASTE: '🪓',
};

const TIPO_BADGES: Record<string, string> = {
  PLANTACAO: 'green', REGA: 'blue', ADUBACAO: 'green',
  TRATAMENTO: 'purple', COLHEITA: 'amber', INSPECAO: 'slate',
  PODA: 'orange', DESBASTE: 'red',
};

export default function OperacoesPage() {
  const { data: operacoes, isLoading, error } = useOperacoes();

  const totalOperacoes = operacoes?.length || 0;
  const custoTotal = operacoes?.reduce((sum, op) => sum + (op.custoTotal || 0), 0) || 0;
  const ultimaSemana = operacoes?.filter(op => {
    const diff = Date.now() - new Date(op.data).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Operações de Campo" subtitle="Registo offline de operações com GPS e fotos" />
        <div className="container mx-auto px-4 py-8">
          <LoadingState fullPage />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Operações de Campo" subtitle="Registo offline de operações com GPS e fotos" />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar operações</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Operações de Campo"
        subtitle="Registo offline de operações com GPS e fotos"
        actions={
          <Link href="/operacoes/nova">
            <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
              Nova Operação
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card variant="colored" color="green">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Operações</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalOperacoes}</p>
              </div>
            </div>
          </Card>
          <Card variant="colored" color="blue">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Última Semana</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{ultimaSemana}</p>
              </div>
            </div>
          </Card>
          <Card variant="colored" color="amber">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Custo Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{custoTotal.toFixed(2)}€</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Operações List */}
        {!operacoes || operacoes.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-16 h-16" />}
            title="Nenhuma operação registada"
            description="Começa a registar as tuas operações de campo."
            action={{ label: 'Nova Operação', href: '/operacoes/nova' }}
          />
        ) : (
          <div className="space-y-4">
            {operacoes.map((operacao) => (
              <Link
                key={operacao.id}
                href={`/operacoes/${operacao.id}`}
                className="block group"
              >
                <Card className="hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="text-3xl shrink-0">{TIPO_ICONS[operacao.tipo] || '📋'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {operacao.tipo.replace('_', ' ')}
                          </h3>
                          <Badge variant={TIPO_BADGES[operacao.tipo] as any || 'slate'} size="sm">
                            {operacao.tipo}
                          </Badge>
                        </div>

                        {operacao.descricao && (
                          <p className="text-slate-700 dark:text-slate-300 mb-2">{operacao.descricao}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(operacao.data), "d 'de' MMMM, yyyy", { locale: pt })}</span>
                          </div>
                          {operacao.parcela && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Talhão:</span>
                              <span>{operacao.parcela.nome}</span>
                            </div>
                          )}
                          {operacao.operador && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Por:</span>
                              <span>{operacao.operador.nome}</span>
                            </div>
                          )}
                        </div>

                        {operacao.notas && (
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                            {operacao.notas}
                          </p>
                        )}

                        {operacao.latitude && operacao.longitude && (
                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            📍 GPS: {operacao.latitude.toFixed(5)}, {operacao.longitude.toFixed(5)}
                          </div>
                        )}
                      </div>
                    </div>

                    {operacao.custoTotal && operacao.custoTotal > 0 && (
                      <div className="text-right shrink-0">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Custo</div>
                        <div className="text-xl font-bold text-emerald-600">
                          {operacao.custoTotal.toFixed(2)}€
                        </div>
                      </div>
                    )}
                  </div>

                  {operacao.fotos && operacao.fotos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex gap-2">
                        {operacao.fotos.map((_foto, idx) => (
                          <div key={idx} className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400">
                            📷
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
