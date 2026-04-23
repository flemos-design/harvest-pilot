'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useParcelas } from '@/hooks/use-parcelas';
import { parseGeometrySafe } from '@/lib/geo-utils';

interface MapProps {
  height?: string;
  showControls?: boolean;
  centerOnParcelas?: boolean;
}

export function Map({ height = '600px', showControls = true, centerOnParcelas = true }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: parcelas, isLoading } = useParcelas();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-6.75, 41.79],
      zoom: 13,
    });

    if (showControls) {
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
    }

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showControls]);

  useEffect(() => {
    if (!map.current || !isLoaded || !parcelas || parcelas.length === 0) return;

    const mapInstance = map.current;

    const features: GeoJSON.Feature[] = [];
    console.log('[Map] Processing', parcelas.length, 'parcelas');
    for (const parcela of parcelas) {
      console.log('[Map] Parcela', parcela.id, 'geometria type:', typeof parcela.geometria, 'value:', parcela.geometria ? (typeof parcela.geometria === 'string' ? parcela.geometria.substring(0, 100) : JSON.stringify(parcela.geometria).substring(0, 100)) : 'null');
      const geometry = parseGeometrySafe(parcela.geometria);
      console.log('[Map] Parsed geometry:', geometry ? geometry.type : 'null');
      if (!geometry) continue;
      features.push({
        type: 'Feature',
        geometry,
        properties: {
          id: parcela.id,
          nome: parcela.nome,
          area: parcela.area,
          cultura: parcela.culturas?.length ? parcela.culturas.map(c => c.especie).join(', ') : 'N/A',
          tipoSolo: parcela.tipoSolo || 'N/A',
        },
      });
    }

    if (features.length === 0) return;

    const geojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };

    const existingSource = mapInstance.getSource('parcelas');
    if (existingSource) {
      (existingSource as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      mapInstance.addSource('parcelas', {
        type: 'geojson',
        data: geojson,
      });

      mapInstance.addLayer({
        id: 'parcelas-fill',
        type: 'fill',
        source: 'parcelas',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.5,
        },
      });

      mapInstance.addLayer({
        id: 'parcelas-outline',
        type: 'line',
        source: 'parcelas',
        paint: {
          'line-color': '#16a34a',
          'line-width': 2,
        },
      });

      mapInstance.addLayer({
        id: 'parcelas-highlight',
        type: 'fill',
        source: 'parcelas',
        paint: {
          'fill-color': '#fbbf24',
          'fill-opacity': 0.6,
        },
        filter: ['==', 'id', ''],
      });

      mapInstance.addLayer({
        id: 'parcelas-labels',
        type: 'symbol',
        source: 'parcelas',
        layout: {
          'text-field': ['get', 'nome'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#16a34a',
          'text-halo-width': 2,
        },
      });
    }

    if (centerOnParcelas) {
      const bounds = new maplibregl.LngLatBounds();
      let hasCoords = false;
      for (const f of features) {
        if (f.geometry.type === 'Polygon') {
          for (const ring of f.geometry.coordinates) {
            for (const coord of ring) {
              bounds.extend(coord as [number, number]);
              hasCoords = true;
            }
          }
        } else if (f.geometry.type === 'Point') {
          bounds.extend(f.geometry.coordinates as [number, number]);
          hasCoords = true;
        }
      }
      if (hasCoords) {
        mapInstance.fitBounds(bounds, { padding: 50, maxZoom: 16 });
      }
    }
  }, [isLoaded, parcelas, centerOnParcelas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-xl" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">A carregar mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} style={{ height }} className="w-full" />
      {parcelas && parcelas.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg max-w-sm text-center">
            <p className="text-slate-700 dark:text-slate-300">Sem parcelas para visualizar.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Adiciona terrenos para as ver no mapa.</p>
          </div>
        </div>
      )}
    </div>
  );
}
