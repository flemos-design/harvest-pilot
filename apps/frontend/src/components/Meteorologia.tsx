'use client';

import { useForecast, useHistoricoMeteo, useMeteoStats } from '@/hooks/use-meteorologia';
import { Cloud, CloudRain, Wind, Droplets, Thermometer, Loader2, TrendingUp } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';

interface MeteorologiaProps {
  parcelaId: string;
}

export function Meteorologia({ parcelaId }: MeteorologiaProps) {
  const { data: forecast, isLoading: isLoadingForecast } = useForecast(parcelaId, 7);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const { data: historico, isLoading: isLoadingHistorico } = useHistoricoMeteo(
    parcelaId,
    seteDiasAtras.toISOString().split('T')[0],
    hoje.toISOString().split('T')[0]
  );

  const { data: stats, isLoading: isLoadingStats } = useMeteoStats(
    parcelaId,
    seteDiasAtras.toISOString().split('T')[0],
    hoje.toISOString().split('T')[0]
  );

  if (isLoadingForecast && isLoadingHistorico && isLoadingStats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600" />
          Meteorologia
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const formatDayLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEE, d 'de' MMM", { locale: pt });
  };

  const getTempColor = (temp: number | null | undefined) => {
    if (temp === null || temp === undefined) return 'text-gray-400';
    if (temp < 10) return 'text-blue-600';
    if (temp < 20) return 'text-green-600';
    if (temp < 30) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getRainColor = (prob: number | null | undefined) => {
    if (prob === null || prob === undefined) return 'text-gray-400';
    if (prob < 30) return 'text-gray-600';
    if (prob < 60) return 'text-blue-500';
    return 'text-blue-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Cloud className="w-5 h-5 text-blue-600" />
        Meteorologia
      </h2>

      {/* Estatísticas (Últimos 7 dias) */}
      {stats && stats.totalRegistos > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Últimos 7 Dias</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-600">Temp. Média</p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {stats.temperaturaMedia !== null
                  ? `${stats.temperaturaMedia.toFixed(1)}°C`
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CloudRain className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-600">Precipitação</p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {stats.precipitacaoTotal.toFixed(1)} mm
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-gray-600">Vento Médio</p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {stats.ventoMedio !== null
                  ? `${stats.ventoMedio.toFixed(1)} km/h`
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-cyan-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-cyan-600" />
                <p className="text-xs text-gray-600">Humidade Média</p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {stats.humidadeMedia !== null
                  ? `${stats.humidadeMedia.toFixed(0)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Previsão */}
      {forecast && forecast.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Previsão (Próximos 7 dias)</h3>
          <div className="space-y-2">
            {forecast.map((day) => (
              <div
                key={day.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 w-28">
                    {formatDayLabel(day.data)}
                  </span>

                  <div className="flex items-center gap-4">
                    {day.temperatura !== null && day.temperatura !== undefined && (
                      <div className="flex items-center gap-1">
                        <Thermometer className={`w-4 h-4 ${getTempColor(day.temperatura)}`} />
                        <span className={`text-sm font-semibold ${getTempColor(day.temperatura)}`}>
                          {day.temperatura.toFixed(1)}°C
                        </span>
                      </div>
                    )}

                    {day.tempMin !== null && day.tempMin !== undefined && day.tempMax !== null && day.tempMax !== undefined && (
                      <span className="text-xs text-gray-500">
                        {day.tempMin.toFixed(0)}° - {day.tempMax.toFixed(0)}°
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {day.probChuva !== null && day.probChuva !== undefined && (
                    <div className="flex items-center gap-1">
                      <CloudRain className={`w-4 h-4 ${getRainColor(day.probChuva)}`} />
                      <span className={`text-sm ${getRainColor(day.probChuva)}`}>
                        {day.probChuva.toFixed(0)}%
                      </span>
                    </div>
                  )}

                  {day.vento !== null && day.vento !== undefined && (
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {day.vento.toFixed(0)} km/h
                      </span>
                    </div>
                  )}

                  <span className="text-xs text-gray-400 ml-2">
                    {day.fonte}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      {historico && historico.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico Recente</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {historico.slice(0, 7).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between px-3 py-2 text-xs bg-gray-50 rounded"
              >
                <span className="text-gray-600">
                  {format(new Date(record.data), "dd/MM/yyyy", { locale: pt })}
                </span>
                <div className="flex items-center gap-3">
                  {record.temperatura !== null && record.temperatura !== undefined && (
                    <span className={getTempColor(record.temperatura)}>
                      {record.temperatura.toFixed(1)}°C
                    </span>
                  )}
                  {record.precipitacao !== null && record.precipitacao !== undefined && record.precipitacao > 0 && (
                    <span className="text-blue-600">
                      <CloudRain className="w-3 h-3 inline mr-1" />
                      {record.precipitacao.toFixed(1)}mm
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!forecast?.length && !historico?.length && (
        <div className="text-center py-8 text-gray-400">
          <Cloud className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum dado meteorológico disponível</p>
        </div>
      )}
    </div>
  );
}
