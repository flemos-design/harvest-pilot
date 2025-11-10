'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
// @ts-ignore - Turf types have package.json exports issue
import * as turf from '@turf/turf';
import { Edit3, Trash2, Square, Save, X } from 'lucide-react';

interface MapEditorProps {
  initialGeometry?: any; // GeoJSON geometry
  onGeometryChange: (geometry: any, area: number) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export function MapEditor({
  initialGeometry,
  onGeometryChange,
  height = '500px',
  center = [-6.75, 41.79], // Espinhosela, Bragança
  zoom = 15,
}: MapEditorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentArea, setCurrentArea] = useState<number>(0);
  const [drawMode, setDrawMode] = useState<'simple_select' | 'draw_polygon'>('simple_select');

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
            attribution: '&copy; OpenStreetMap contributors',
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
      center,
      zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Initialize MapboxDraw
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      styles: [
        // Polygon fill
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#22c55e',
            'fill-opacity': 0.4,
          },
        },
        // Polygon outline (active)
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'line-color': '#16a34a',
            'line-width': 3,
          },
        },
        // Polygon vertices (editable)
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#fff',
            'circle-stroke-color': '#16a34a',
            'circle-stroke-width': 2,
          },
        },
        // Midpoints (for adding vertices)
        {
          id: 'gl-draw-polygon-midpoint',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
          paint: {
            'circle-radius': 4,
            'circle-color': '#fbbf24',
          },
        },
      ],
    });

    map.current.addControl(draw.current as any, 'top-left');

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    // Handle draw events
    map.current.on('draw.create', updateGeometry);
    map.current.on('draw.update', updateGeometry);
    map.current.on('draw.delete', updateGeometry);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  // Load initial geometry
  useEffect(() => {
    if (!isLoaded || !draw.current || !initialGeometry) return;

    try {
      // Clear existing features
      draw.current.deleteAll();

      // Add initial geometry
      const feature = {
        type: 'Feature',
        geometry: initialGeometry,
        properties: {},
      };

      draw.current.add(feature as any);

      // Calculate and set initial area
      const area = turf.area(initialGeometry);
      const areaHa = area / 10000;
      setCurrentArea(areaHa);

      // Fit map to geometry bounds
      if (map.current) {
        const bbox = turf.bbox(initialGeometry);
        map.current.fitBounds(bbox as [number, number, number, number], {
          padding: 50,
        });
      }
    } catch (error) {
      console.error('Error loading initial geometry:', error);
    }
  }, [isLoaded, initialGeometry]);

  // Update geometry and calculate area
  const updateGeometry = () => {
    if (!draw.current) return;

    const data = draw.current.getAll();

    if (data.features.length === 0) {
      setCurrentArea(0);
      onGeometryChange(null, 0);
      return;
    }

    const feature = data.features[0];
    const geometry = feature.geometry;

    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      const area = turf.area(geometry);
      const areaHa = area / 10000;
      setCurrentArea(areaHa);
      onGeometryChange(geometry, areaHa);
    }
  };

  // Start drawing mode
  const startDrawing = () => {
    if (!draw.current) return;
    draw.current.changeMode('draw_polygon');
    setDrawMode('draw_polygon');
  };

  // Stop drawing mode
  const stopDrawing = () => {
    if (!draw.current) return;
    draw.current.changeMode('simple_select');
    setDrawMode('simple_select');
  };

  // Delete selected features
  const deleteSelected = () => {
    if (!draw.current) return;
    const selectedIds = draw.current.getSelectedIds();
    if (selectedIds.length > 0) {
      draw.current.delete(selectedIds);
      updateGeometry();
    }
  };

  // Delete all features
  const deleteAll = () => {
    if (!draw.current) return;
    draw.current.deleteAll();
    setCurrentArea(0);
    onGeometryChange(null, 0);
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div ref={mapContainer} style={{ height, width: '100%' }} className="rounded-lg border" />

      {/* Toolbar */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 z-10">
        <button
          onClick={drawMode === 'draw_polygon' ? stopDrawing : startDrawing}
          className={`p-2 rounded hover:bg-gray-100 transition ${
            drawMode === 'draw_polygon' ? 'bg-green-100 text-green-600' : 'text-gray-700'
          }`}
          title={drawMode === 'draw_polygon' ? 'Parar desenho' : 'Desenhar polígono'}
        >
          {drawMode === 'draw_polygon' ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
        </button>

        <button
          onClick={deleteSelected}
          className="p-2 rounded hover:bg-gray-100 transition text-gray-700"
          title="Eliminar selecionado"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <div className="border-t my-1" />

        <button
          onClick={deleteAll}
          className="p-2 rounded hover:bg-red-50 transition text-red-600"
          title="Limpar tudo"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>

      {/* Area Display */}
      {currentArea > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Square className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Área calculada</p>
              <p className="text-lg font-bold text-gray-900">
                {currentArea.toFixed(4)} ha
              </p>
              <p className="text-xs text-gray-500">
                {(currentArea * 10000).toFixed(0)} m²
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-3 z-10 max-w-xs">
        <p className="text-xs text-gray-600 font-medium mb-2">Instruções:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Clique em <Edit3 className="w-3 h-3 inline" /> para desenhar</li>
          <li>• Clique no mapa para adicionar pontos</li>
          <li>• Duplo clique para terminar</li>
          <li>• Arraste vértices para editar</li>
          <li>• Clique em pontos amarelos para adicionar vértices</li>
        </ul>
      </div>
    </div>
  );
}
