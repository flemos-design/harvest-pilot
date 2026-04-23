'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Maximize2, Minimize2 } from 'lucide-react';

interface MapSingleProps {
  geometry: GeoJSON.Geometry | null;
  parcelName?: string;
  height?: string;
  showControls?: boolean;
}

export function MapSingle({ geometry, parcelName, height = '400px', showControls = true }: MapSingleProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
      // Resize map after transition
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);
      return next;
    });
  };

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setTimeout(() => map.current?.resize(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (!mapContainer.current || map.current || !geometry) return;

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
      center: [-6.75, 41.79], // Default center
      zoom: 15,
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

  // Add parcel layer when map is loaded
  useEffect(() => {
    if (!map.current || !isLoaded || !geometry) return;

    const mapInstance = map.current;

    // Create GeoJSON for single parcel
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: geometry as GeoJSON.Geometry,
          properties: {
            name: parcelName || 'Talhão',
          },
        },
      ],
    };

    // Add source
    if (!mapInstance.getSource('parcela')) {
      mapInstance.addSource('parcela', {
        type: 'geojson',
        data: geojson,
      });

      // Add fill layer
      mapInstance.addLayer({
        id: 'parcela-fill',
        type: 'fill',
        source: 'parcela',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.5,
        },
      });

      // Add outline layer
      mapInstance.addLayer({
        id: 'parcela-outline',
        type: 'line',
        source: 'parcela',
        paint: {
          'line-color': '#16a34a',
          'line-width': 3,
        },
      });

    } else {
      // Update existing source
      const source = mapInstance.getSource('parcela') as maplibregl.GeoJSONSource;
      source.setData(geojson);
    }

    // Fit bounds to the parcel
    const bounds = new maplibregl.LngLatBounds();

    if (geometry.type === 'Polygon') {
      geometry.coordinates[0].forEach((coord) => {
        bounds.extend(coord as [number, number]);
      });
    } else if (geometry.type === 'Point') {
      bounds.extend(geometry.coordinates as [number, number]);
    }

    mapInstance.fitBounds(bounds, {
      padding: 50,
      maxZoom: 17,
    });
  }, [isLoaded, geometry, parcelName]);

  if (!geometry) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Sem geometria definida</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Adiciona coordenadas GPS ao editar o terreno para ver o mapa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : 'relative w-full rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700'
      }`}
    >
      <div ref={mapContainer} style={{ height: isFullscreen ? '100vh' : height }} className="w-full" />

      {/* Parcel name badge */}
      {parcelName && !isFullscreen && (
        <div className="absolute top-3 left-3 z-20 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{parcelName}</p>
        </div>
      )}

      {/* Fullscreen toggle button - bottom right */}
      <button
        onClick={toggleFullscreen}
        className={`absolute z-20 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition ${
          'bottom-4 right-4'
        }`}
        title={isFullscreen ? 'Sair de ecrã inteiro' : 'Ecrã inteiro'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
