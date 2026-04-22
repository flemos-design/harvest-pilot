'use client';

import { useParcelas } from '@/hooks/use-parcelas';
import { MapPin, TrendingUp, Upload, Plus } from 'lucide-react';
import Link from 'next/link';
import { MapThumbnail } from '@/components/MapThumbnail';
import { parseGeometrySafe } from '@/lib/geo-utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';

export default function ParcelasPage() {
  const { data: parcelas, isLoading, error } = useParcelas();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Terrenos" subtitle="Gestão de terrenos agrícolas" />
        <div className="container mx-auto px-4 py-8">
          <LoadingState fullPage />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Terrenos" subtitle="Gestão de terrenos agrícolas" />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar terrenos</h2>
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
        title="Terrenos"
        subtitle="Gestão de terrenos agrícolas"
        actions={
          <>
            <Link href="/parcelas/nova">
              <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                Novo Terreno
              </Button>
            </Link>
            <Link href="/parcelas/importar">
              <Button variant="secondary" size="md" icon={<Upload className="w-4 h-4" />}>
                Importar KMZ
              </Button>
            </Link>
          </>
        }
      />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card variant="colored" color="green">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Terrenos</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{parcelas?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card variant="colored" color="blue">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Área Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {parcelas?.reduce((sum, p) => sum + p.area, 0).toFixed(2)} ha
                </p>
              </div>
            </div>
          </Card>
          <Card variant="colored" color="amber">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Com Culturas</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {parcelas?.filter((p) => p.culturas && p.culturas.length > 0).length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Parcelas List */}
        {!parcelas || parcelas.length === 0 ? (
          <EmptyState
            icon={<MapPin className="w-16 h-16" />}
            title="Nenhum terreno encontrado"
            description="Cria o teu primeiro terreno para começar a gerir a tua exploração agrícola."
            action={{ label: 'Novo Terreno', href: '/parcelas/nova' }}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcelas.map((parcela) => (
              <Link
                key={parcela.id}
                href={`/parcelas/${parcela.id}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition h-full">
                  <MapThumbnail geometry={parseGeometrySafe(parcela.geometria)} height="180px" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition">
                          {parcela.nome}
                        </h3>
                        {parcela.propriedade && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">{parcela.propriedade.nome}</p>
                        )}
                      </div>
                      <Badge variant="green" size="md">{parcela.area} ha</Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      {parcela.altitude && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>{parcela.altitude}m altitude</span>
                        </div>
                      )}
                      {parcela.tipoSolo && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span>{parcela.tipoSolo}</span>
                        </div>
                      )}
                    </div>

                    {parcela.culturas && parcela.culturas.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Culturas:</p>
                        <div className="flex flex-wrap gap-2">
                          {parcela.culturas.map((cultura) => (
                            <Badge key={cultura.id} variant="amber" size="sm">
                              {cultura.especie}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {parcela._count && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{parcela._count.operacoes} operações</span>
                        <span>{parcela._count.imagensRemotas} imagens</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
