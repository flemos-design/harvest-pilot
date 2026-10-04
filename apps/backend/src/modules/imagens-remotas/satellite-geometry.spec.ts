import { BadRequestException } from '@nestjs/common';
import { parseSatelliteGeometry, satelliteGrid } from './satellite-geometry';

describe('satellite geometry', () => {
  const polygon = JSON.stringify({
    type: 'Polygon',
    coordinates: [[[-6.75, 41.79], [-6.749, 41.79], [-6.749, 41.791], [-6.75, 41.79]]],
  });

  it('accepts a closed WGS84 polygon and calculates a bounded grid', () => {
    const geometry = parseSatelliteGeometry(polygon);
    const grid = satelliteGrid(geometry);

    expect(geometry.type).toBe('Polygon');
    expect(grid.bbox).toEqual([-6.75, 41.79, -6.749, 41.791]);
    expect(grid.width).toBeGreaterThan(0);
    expect(grid.height).toBeGreaterThan(0);
  });

  it('accepts a GeoJSON Feature wrapper', () => {
    const feature = JSON.stringify({ type: 'Feature', geometry: JSON.parse(polygon), properties: {} });
    expect(parseSatelliteGeometry(feature).type).toBe('Polygon');
  });

  it('rejects open, invalid or oversized geometries', () => {
    expect(() => parseSatelliteGeometry('{"type":"Point","coordinates":[-6.75,41.79]}')).toThrow(BadRequestException);
    expect(() => parseSatelliteGeometry(JSON.stringify({
      type: 'Polygon',
      coordinates: [[[-6.75, 41.79], [-6.749, 41.79], [-6.749, 41.791], [-6.75, 41.791]]],
    }))).toThrow(BadRequestException);
    expect(() => satelliteGrid({
      type: 'Polygon',
      coordinates: [[[-6.75, 41.79], [0, 41.79], [0, 41.791], [-6.75, 41.79]]],
    })).toThrow('Extent unsupported');
  });
});
