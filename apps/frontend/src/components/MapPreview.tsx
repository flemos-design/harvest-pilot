'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

interface MapPreviewProps {
  latitude?: number;
  longitude?: number;
  height?: string;
}

export function MapPreview({ latitude, longitude, height = '300px' }: MapPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
            attribution: '&copy; OpenStreetMap',
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
      center: [-6.75, 41.79], // Default: Espinhosela
      zoom: 14,
    });

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    // Cleanup
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker when coordinates change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    if (latitude && longitude) {
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }

      // Create new marker
      marker.current = new maplibregl.Marker({ color: '#22c55e' })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Fly to location
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        duration: 1000,
      });

      // Add a circle around the marker to show the parcel area
      if (map.current.getSource('parcel-preview')) {
        map.current.removeLayer('parcel-preview-fill');
        map.current.removeLayer('parcel-preview-outline');
        map.current.removeSource('parcel-preview');
      }

      const offset = 0.001; // ~100m
      const geometry = {
        type: 'Polygon',
        coordinates: [[
          [longitude - offset, latitude + offset],
          [longitude + offset, latitude + offset],
          [longitude + offset, latitude - offset],
          [longitude - offset, latitude - offset],
          [longitude - offset, latitude + offset],
        ]],
      };

      map.current.addSource('parcel-preview', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: geometry as any,
          properties: {},
        },
      });

      map.current.addLayer({
        id: 'parcel-preview-fill',
        type: 'fill',
        source: 'parcel-preview',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.3,
        },
      });

      map.current.addLayer({
        id: 'parcel-preview-outline',
        type: 'line',
        source: 'parcel-preview',
        paint: {
          'line-color': '#16a34a',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });
    } else {
      // No coordinates: remove marker and reset view
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }

      if (map.current.getSource('parcel-preview')) {
        map.current.removeLayer('parcel-preview-fill');
        map.current.removeLayer('parcel-preview-outline');
        map.current.removeSource('parcel-preview');
      }

      map.current.flyTo({
        center: [-6.75, 41.79],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [latitude, longitude, isLoaded]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
      <div ref={mapContainer} style={{ height }} className="w-full" />

      {!latitude || !longitude ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black bg-opacity-10">
          <div className="bg-white px-4 py-2 rounded-lg shadow-md">
            <p className="text-sm text-gray-600 font-medium">
              Captura o GPS para ver o preview
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute top-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md text-xs">
          <p className="font-semibold text-green-600">Preview da Localização</p>
          <p className="text-gray-600 mt-1">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
