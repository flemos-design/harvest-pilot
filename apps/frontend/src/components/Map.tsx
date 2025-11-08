'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useParcelas } from '@/hooks/use-parcelas';
import { useRouter } from 'next/navigation';

interface MapProps {
  height?: string;
  showControls?: boolean;
  centerOnParcelas?: boolean;
}

export function Map({ height = '600px', showControls = true, centerOnParcelas = true }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredParcelaId, setHoveredParcelaId] = useState<string | null>(null);
  const { data: parcelas, isLoading } = useParcelas();
  const router = useRouter();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
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
      center: [-6.75, 41.79], // Espinhosela, Bragança
      zoom: 13,
      attributionControl: true,
    });

    // Add navigation controls
    if (showControls) {
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
    }

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showControls]);

  // Add parcelas layer when data is loaded
  useEffect(() => {
    if (!map.current || !isLoaded || !parcelas || parcelas.length === 0) return;

    const mapInstance = map.current;

    // Create GeoJSON from parcelas
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: parcelas
        .filter(p => p.geometria)
        .map(parcela => ({
          type: 'Feature',
          geometry: parcela.geometria as GeoJSON.Geometry,
          properties: {
            id: parcela.id,
            nome: parcela.nome,
            area: parcela.area,
            cultura: parcela.cultura || 'N/A',
            tipoSolo: parcela.tipoSolo || 'N/A',
          },
        })),
    };

    // Add source if it doesn't exist
    if (!mapInstance.getSource('parcelas')) {
      mapInstance.addSource('parcelas', {
        type: 'geojson',
        data: geojson,
      });

      // Add fill layer
      mapInstance.addLayer({
        id: 'parcelas-fill',
        type: 'fill',
        source: 'parcelas',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.4,
        },
      });

      // Add outline layer
      mapInstance.addLayer({
        id: 'parcelas-outline',
        type: 'line',
        source: 'parcelas',
        paint: {
          'line-color': '#16a34a',
          'line-width': 2,
        },
      });

      // Add highlight layer (shows on hover)
      mapInstance.addLayer({
        id: 'parcelas-highlight',
        type: 'fill',
        source: 'parcelas',
        paint: {
          'fill-color': '#fbbf24',
          'fill-opacity': 0.6,
        },
        filter: ['==', 'id', ''], // Initially empty
      });

      // Add labels layer with parcel names
      mapInstance.addLayer({
        id: 'parcelas-labels',
        type: 'symbol',
        source: 'parcelas',
        layout: {
          'text-field': ['get', 'nome'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-offset': [0, 0],
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#16a34a',
          'text-halo-width': 2,
        },
      });

      // Add hover effect
      mapInstance.on('mouseenter', 'parcelas-fill', (e) => {
        mapInstance.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features.length > 0) {
          const parcelaId = e.features[0].properties?.id;
          if (parcelaId) {
            setHoveredParcelaId(parcelaId);
            mapInstance.setFilter('parcelas-highlight', ['==', 'id', parcelaId]);
          }
        }
      });

      mapInstance.on('mouseleave', 'parcelas-fill', () => {
        mapInstance.getCanvas().style.cursor = '';
        setHoveredParcelaId(null);
        mapInstance.setFilter('parcelas-highlight', ['==', 'id', '']);
      });

      // Add click handler
      mapInstance.on('click', 'parcelas-fill', (e) => {
        if (e.features && e.features.length > 0 && e.lngLat) {
          const feature = e.features[0];
          const properties = feature.properties;

          if (properties) {
            // Create popup with error handling
            try {
              new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #16a34a;">
                      ${properties.nome}
                    </h3>
                    <div style="font-size: 14px; color: #4b5563;">
                      <p style="margin: 4px 0;"><strong>Área:</strong> ${properties.area} ha</p>
                      <p style="margin: 4px 0;"><strong>Cultura:</strong> ${properties.cultura}</p>
                      <p style="margin: 4px 0;"><strong>Solo:</strong> ${properties.tipoSolo}</p>
                    </div>
                    <button
                      onclick="window.location.href='/parcelas/${properties.id}'"
                      style="
                        margin-top: 12px;
                        padding: 6px 12px;
                        background-color: #22c55e;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        width: 100%;
                      "
                    >
                      Ver Detalhes
                    </button>
                  </div>
                `)
                .addTo(mapInstance);
            } catch (error) {
              console.error('Error creating popup:', error);
            }
          }
        }
      });
    } else {
      // Update existing source
      const source = mapInstance.getSource('parcelas') as maplibregl.GeoJSONSource;
      source.setData(geojson);
    }

    // Fit bounds to parcelas if enabled
    if (centerOnParcelas && geojson.features.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      let hasCoordinates = false;

      geojson.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach(coord => {
            bounds.extend(coord as [number, number]);
            hasCoordinates = true;
          });
        } else if (feature.geometry.type === 'Point') {
          bounds.extend(feature.geometry.coordinates as [number, number]);
          hasCoordinates = true;
        }
      });

      // Only fit bounds if we have valid coordinates
      if (hasCoordinates) {
        mapInstance.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
        });
      }
    }
  }, [isLoaded, parcelas, centerOnParcelas, router]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} style={{ height }} className="w-full" />

      {parcelas && parcelas.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <p className="text-gray-700">Sem parcelas para visualizar.</p>
            <p className="text-sm text-gray-500 mt-2">Adiciono terrenos para as ver no mapa.</p>
          </div>
        </div>
      )}
    </div>
  );
}
