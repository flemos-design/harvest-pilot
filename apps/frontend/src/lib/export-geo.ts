import JSZip from 'jszip';
import type { Parcela } from '@/types';

type SupportedGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'talhao';
}

function parseGeometry(geometria: Parcela['geometria']): SupportedGeometry {
  const geometry = typeof geometria === 'string' ? JSON.parse(geometria) : geometria;
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
    throw new Error('Geometria inválida ou não suportada (esperado Polygon ou MultiPolygon)');
  }
  return geometry as SupportedGeometry;
}

function ringToCoordinates(ring: number[][]) {
  return ring.map(coord => `${coord[0]},${coord[1]},0`).join(' ');
}

function polygonToKml(polygon: GeoJSON.Polygon) {
  const [outerRing, ...innerRings] = polygon.coordinates;
  const outer = ringToCoordinates(outerRing);
  const inner = innerRings
    .map(
      ring => `
        <innerBoundaryIs>
          <LinearRing>
            <coordinates>${ringToCoordinates(ring)}</coordinates>
          </LinearRing>
        </innerBoundaryIs>`
    )
    .join('');

  return `
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>${outer}</coordinates>
        </LinearRing>
      </outerBoundaryIs>
      ${inner}
    </Polygon>`;
}

function buildKmlBody(geometry: SupportedGeometry, nome: string, descricao?: string) {
  const polygons =
    geometry.type === 'Polygon'
      ? polygonToKml(geometry)
      : geometry.coordinates
          .map(coords => polygonToKml({ type: 'Polygon', coordinates: coords }))
          .join('');

  const placemark =
    geometry.type === 'Polygon'
      ? polygons
      : `<MultiGeometry>${polygons}</MultiGeometry>`;

  return `
  <Placemark>
    <name>${nome}</name>
    ${descricao ? `<description>${descricao}</description>` : ''}
    ${placemark}
  </Placemark>`;
}

export function parcelaToKmlString(parcela: Parcela) {
  const geometry = parseGeometry(parcela.geometria);
  const body = buildKmlBody(geometry, parcela.nome, parcela.tipoSolo);

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    ${body}
  </Document>
</kml>`;
}

export function parcelaToKmlBlob(parcela: Parcela) {
  const kml = parcelaToKmlString(parcela);
  return new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
}

export async function parcelaToKmzBlob(parcela: Parcela) {
  const zip = new JSZip();
  const kmlContent = parcelaToKmlString(parcela);
  const filename = `${sanitizeFileName(parcela.nome || 'talhao')}.kml`;
  zip.file(filename, kmlContent);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
