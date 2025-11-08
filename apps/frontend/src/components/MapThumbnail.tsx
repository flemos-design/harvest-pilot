'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';

interface MapThumbnailProps {
  geometry: any;
  height?: string;
}

export function MapThumbnail({ geometry, height = '150px' }: MapThumbnailProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
            attribution: '© OpenStreetMap',
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
      zoom: 15,
      interactive: false, // Disable interactions for thumbnail
      attributionControl: false,
    });

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
  }, [geometry]);

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
          properties: {},
        },
      ],
    };

    // Add source
    if (!mapInstance.getSource('parcela-thumb')) {
      mapInstance.addSource('parcela-thumb', {
        type: 'geojson',
        data: geojson,
      });

      // Add fill layer
      mapInstance.addLayer({
        id: 'parcela-thumb-fill',
        type: 'fill',
        source: 'parcela-thumb',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.6,
        },
      });

      // Add outline layer
      mapInstance.addLayer({
        id: 'parcela-thumb-outline',
        type: 'line',
        source: 'parcela-thumb',
        paint: {
          'line-color': '#16a34a',
          'line-width': 2,
        },
      });
    }

    // Fit bounds to the parcel
    const bounds = new maplibregl.LngLatBounds();

    if (geometry.type === 'Polygon') {
      geometry.coordinates[0].forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });
    } else if (geometry.type === 'Point') {
      bounds.extend(geometry.coordinates as [number, number]);
    }

    mapInstance.fitBounds(bounds, {
      padding: 20,
      maxZoom: 16,
    });
  }, [isLoaded, geometry]);

  if (!geometry) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-t-lg"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Sem geometria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-t-lg overflow-hidden">
      <div ref={mapContainer} style={{ height }} className="w-full" />
    </div>
  );
}
