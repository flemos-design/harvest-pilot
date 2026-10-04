import { BadRequestException } from '@nestjs/common';

export interface SatelliteGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export function parseSatelliteGeometry(value: string): SatelliteGeometry {
  try {
    const parsed = JSON.parse(value);
    const geometry = parsed.type === 'Feature' ? parsed.geometry : parsed;
    if (!['Polygon', 'MultiPolygon'].includes(geometry?.type)) throw new Error();
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    if (!Array.isArray(polygons) || !polygons.length) throw new Error();
    let vertices = 0;
    for (const polygon of polygons) {
      if (!Array.isArray(polygon) || !polygon.length) throw new Error();
      for (const ring of polygon) {
        if (!Array.isArray(ring) || ring.length < 4) throw new Error();
        for (const point of ring) {
          if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) ||
            Math.abs(point[0]) > 180 || Math.abs(point[1]) >= 85) throw new Error();
          if (++vertices > 10000) throw new Error();
        }
        if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) throw new Error();
        const area = ring.slice(1).reduce((sum: number, p: number[], i: number) =>
          sum + ring[i][0] * p[1] - p[0] * ring[i][1], 0);
        if (Math.abs(area) < 1e-12) throw new Error();
      }
    }
    satelliteGrid(geometry);
    return geometry;
  } catch {
    throw new BadRequestException('Geometria inválida ou demasiado extensa para imagens satélite');
  }
}

export function satelliteGrid(geometry: SatelliteGeometry) {
  const points = (geometry.type === 'Polygon' ? geometry.coordinates.flat(1) : geometry.coordinates.flat(2)) as number[][];
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const latitude = (bbox[1] + bbox[3]) / 2;
  const width = Math.ceil((bbox[2] - bbox[0]) * 111320 * Math.cos(latitude * Math.PI / 180) / 10);
  const height = Math.ceil((bbox[3] - bbox[1]) * 111320 / 10);
  if (width < 1 || height < 1 || width > 1024 || height > 1024) throw new Error('Extent unsupported');
  return { bbox, width, height };
}
