'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { parseGeometrySafe } from '@/lib/geo-utils';
import type { Parcela } from '@/types';

interface MapProps {
  height?: string;
  showControls?: boolean;
  centerOnParcelas?: boolean;
  parcelas?: Parcela[];
}

export function Map({ height = '600px', showControls = true, centerOnParcelas = true, parcelas }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const parcelasRef = useRef<Parcela[] | undefined>(parcelas);
  const handlersAdded = useRef(false);

  // Keep ref in sync with prop
  parcelasRef.current = parcelas;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
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
      mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
      mapInstance.addControl(new maplibregl.ScaleControl(), 'bottom-left');
    }

    mapInstance.on('load', () => {
      console.log('[Map] Map loaded');
      // If parcelas already available when map loads, render them immediately
      if (parcelasRef.current && parcelasRef.current.length > 0) {
        renderParcelas(mapInstance, parcelasRef.current, centerOnParcelas);
      }
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
      map.current = null;
      handlersAdded.current = false;
    };
  }, [showControls, centerOnParcelas]);

  // When parcelas prop changes, render them if map is already loaded
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !mapInstance.loaded()) return;
    if (!parcelas || parcelas.length === 0) return;

    console.log('[Map] Parcelas changed, rendering', parcelas.length);
    renderParcelas(mapInstance, parcelas, centerOnParcelas);
  }, [parcelas, centerOnParcelas]);

  function renderParcelas(mapInstance: maplibregl.Map, data: Parcela[], shouldFitBounds: boolean) {
    const features: GeoJSON.Feature[] = [];
    for (const parcela of data) {
      const geometry = parseGeometrySafe(parcela.geometria);
      if (!geometry) {
        console.warn('[Map] Invalid geometry for parcela:', parcela.id, parcela.nome);
        continue;
      }
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

    console.log('[Map] Features built:', features.length);
    if (features.length === 0) return;

    const geojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };

    const existingSource = mapInstance.getSource('parcelas');
    if (existingSource) {
      (existingSource as maplibregl.GeoJSONSource).setData(geojson);
      console.log('[Map] Updated existing source');
    } else {
      mapInstance.addSource('parcelas', {
        type: 'geojson',
        data: geojson,
      });
      console.log('[Map] Added source');

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

      if (!handlersAdded.current) {
        const onMouseEnter = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
          mapInstance.getCanvas().style.cursor = 'pointer';
          if (e.features?.[0]?.properties?.id) {
            mapInstance.setFilter('parcelas-highlight', ['==', 'id', e.features[0].properties.id]);
          }
        };

        const onMouseLeave = () => {
          mapInstance.getCanvas().style.cursor = '';
          mapInstance.setFilter('parcelas-highlight', ['==', 'id', '']);
        };

        const onClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
          if (!e.features?.[0]?.properties || !e.lngLat) return;
          const props = e.features[0].properties;
          try {
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding:8px;min-width:200px;">
                  <h3 style="font-weight:bold;font-size:16px;margin-bottom:8px;color:#16a34a;">${props.nome}</h3>
                  <div style="font-size:14px;color:#4b5563;">
                    <p style="margin:4px 0;"><strong>Área:</strong> ${props.area} ha</p>
                    <p style="margin:4px 0;"><strong>Cultura:</strong> ${props.cultura}</p>
                    <p style="margin:4px 0;"><strong>Solo:</strong> ${props.tipoSolo}</p>
                  </div>
                  <a href="/parcelas/${props.id}" style="display:block;text-align:center;margin-top:12px;padding:6px 12px;background:#22c55e;color:white;border-radius:6px;text-decoration:none;font-size:14px;">Ver Detalhes</a>
                </div>
              `)
              .addTo(mapInstance);
          } catch {
            // ignore
          }
        };

        mapInstance.on('mouseenter', 'parcelas-fill', onMouseEnter);
        mapInstance.on('mouseleave', 'parcelas-fill', onMouseLeave);
        mapInstance.on('click', 'parcelas-fill', onClick);
        handlersAdded.current = true;
      }
    }

    if (shouldFitBounds) {
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
  }

  const hasParcelas = parcelas && parcelas.length > 0;

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} style={{ height }} className="w-full" />
      {!hasParcelas && (
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
