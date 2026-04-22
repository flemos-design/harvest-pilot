/**
 * Safely parse a geometry that may be a GeoJSON string or object.
 * Returns null if parsing fails or geometry is missing.
 */
export function parseGeometrySafe(
  geometria: string | GeoJSON.Polygon | undefined | null
): GeoJSON.Geometry | null {
  if (!geometria) return null;

  if (typeof geometria === 'string') {
    try {
      return JSON.parse(geometria) as GeoJSON.Geometry;
    } catch {
      return null;
    }
  }

  return geometria;
}
