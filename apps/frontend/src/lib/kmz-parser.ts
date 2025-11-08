import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';
// @ts-ignore - Turf types have package.json exports issue
import * as turf from '@turf/turf';

export interface ParsedParcela {
  nome: string;
  area: number; // hectares
  geometria: any; // GeoJSON
  altitude?: number;
  tipoSolo?: string;
  propriedadeId: string;
}

/**
 * Parse KMZ file (ZIP containing KML) to array of parcelas
 * @param file KMZ file from input
 * @param propriedadeId ID da propriedade para associar as parcelas
 * @returns Array of parcelas ready for API
 */
export async function parseKmz(
  file: File,
  propriedadeId: string
): Promise<ParsedParcela[]> {
  try {
    // 1. Load KMZ as ZIP
    const zip = await JSZip.loadAsync(file);

    // 2. Find KML file inside ZIP (usually doc.kml or *.kml)
    let kmlContent: string | null = null;
    let kmlFilename: string | null = null;

    for (const filename in zip.files) {
      if (filename.toLowerCase().endsWith('.kml')) {
        kmlFilename = filename;
        kmlContent = await zip.files[filename].async('string');
        break;
      }
    }

    if (!kmlContent) {
      throw new Error('Nenhum ficheiro KML encontrado no KMZ');
    }

    // 3. Parse KML to XML DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Erro ao fazer parse do KML: ' + parserError.textContent);
    }

    // 4. Convert KML to GeoJSON using togeojson
    const geojson = kml(xmlDoc);

    if (!geojson || !geojson.features || geojson.features.length === 0) {
      throw new Error('Nenhuma geometria encontrada no ficheiro KML');
    }

    // 5. Extract parcelas from GeoJSON features
    const parcelas: ParsedParcela[] = [];

    for (let i = 0; i < geojson.features.length; i++) {
      const feature = geojson.features[i];

      // Extract name from properties (KML name tag)
      const nome = feature.properties?.name || `Terreno ${i + 1}`;

      // Get geometry (Polygon or MultiPolygon)
      const geometria = feature.geometry;

      if (!geometria || (geometria.type !== 'Polygon' && geometria.type !== 'MultiPolygon')) {
        console.warn(`Feature ${i} não é um Polygon/MultiPolygon, a ignorar`);
        continue;
      }

      // Calculate area in hectares using Turf.js
      const areaM2 = turf.area(geometria);
      const areaHa = areaM2 / 10000; // Convert m² to hectares

      // Build parcela object
      const parcela: ParsedParcela = {
        nome,
        area: parseFloat(areaHa.toFixed(4)), // 4 decimais
        geometria,
        propriedadeId,
      };

      // Optional: Extract altitude from properties if exists
      if (feature.properties?.altitude) {
        parcela.altitude = parseFloat(feature.properties.altitude);
      }

      // Optional: Extract description as tipoSolo if exists
      if (feature.properties?.description) {
        parcela.tipoSolo = feature.properties.description;
      }

      parcelas.push(parcela);
    }

    if (parcelas.length === 0) {
      throw new Error('Nenhum terreno válido encontrado no ficheiro');
    }

    return parcelas;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao processar KMZ: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao processar KMZ');
  }
}

/**
 * Validate KMZ file before uploading
 */
export function validateKmzFile(file: File): string | null {
  // Check file extension
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext !== 'kmz' && ext !== 'kml') {
    return 'Apenas ficheiros .kmz ou .kml são suportados';
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return 'Ficheiro demasiado grande (máximo 10MB)';
  }

  return null; // Valid
}
