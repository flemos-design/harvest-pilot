import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';
// @ts-ignore - Turf types have package.json exports issue
import * as turf from '@turf/turf';

export interface ParsedTerreno {
  nome: string;
  area: number; // hectares
  geometria: any; // GeoJSON
  altitude?: number;
  tipoSolo?: string;
}

export interface ParsedPropriedade {
  nome: string;
  descricao?: string;
  terrenos: ParsedTerreno[];
}

export interface KmzImportResult {
  propriedades: ParsedPropriedade[];
  organizacaoId: string;
}

/**
 * Parse KMZ file (ZIP containing KML) extracting hierarchical structure
 * KML Folders → Propriedades
 * KML Placemarks → Terrenos
 *
 * @param file KMZ file from input
 * @param organizacaoId ID da organização para associar as propriedades
 * @returns Propriedades com terrenos nested
 */
export async function parseKmzHierarchical(
  file: File,
  organizacaoId: string
): Promise<KmzImportResult> {
  try {
    // 1. Load KMZ as ZIP
    const zip = await JSZip.loadAsync(file);

    // 2. Find KML file inside ZIP
    let kmlContent: string | null = null;

    for (const filename in zip.files) {
      if (filename.toLowerCase().endsWith('.kml')) {
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

    // 4. Extract hierarchical structure
    const propriedades: ParsedPropriedade[] = [];

    // Find all Folders (propriedades)
    const folders = xmlDoc.querySelectorAll('Document > Folder');

    if (folders.length === 0) {
      // No folders, treat all placemarks as single property
      const defaultPropriedade = await extractPropriedadeFromDocument(xmlDoc, 'Propriedade Principal');
      if (defaultPropriedade && defaultPropriedade.terrenos.length > 0) {
        propriedades.push(defaultPropriedade);
      }
    } else {
      // Process each folder as a propriedade
      for (const folder of Array.from(folders)) {
        const propriedade = await extractPropriedadeFromFolder(folder);
        if (propriedade && propriedade.terrenos.length > 0) {
          propriedades.push(propriedade);
        }
      }
    }

    if (propriedades.length === 0) {
      throw new Error('Nenhuma propriedade ou terreno válido encontrado no ficheiro');
    }

    return {
      propriedades,
      organizacaoId,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao processar KMZ: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao processar KMZ');
  }
}

/**
 * Extract propriedade from a KML Folder
 */
async function extractPropriedadeFromFolder(folder: Element): Promise<ParsedPropriedade | null> {
  const nameElement = folder.querySelector(':scope > name');
  const descElement = folder.querySelector(':scope > description');

  const propriedadeNome = nameElement?.textContent?.trim() || 'Propriedade Sem Nome';
  const propriedadeDesc = descElement?.textContent?.trim();

  // Find all Placemarks within this folder
  const placemarks = folder.querySelectorAll(':scope > Placemark');
  const terrenos: ParsedTerreno[] = [];

  for (const placemark of Array.from(placemarks)) {
    const terreno = await extractTerrenoFromPlacemark(placemark);
    if (terreno) {
      terrenos.push(terreno);
    }
  }

  if (terrenos.length === 0) {
    return null;
  }

  return {
    nome: propriedadeNome,
    descricao: propriedadeDesc,
    terrenos,
  };
}

/**
 * Extract default propriedade from Document (when no folders exist)
 */
async function extractPropriedadeFromDocument(doc: Document, defaultName: string): Promise<ParsedPropriedade | null> {
  const placemarks = doc.querySelectorAll('Document > Placemark');
  const terrenos: ParsedTerreno[] = [];

  for (const placemark of Array.from(placemarks)) {
    const terreno = await extractTerrenoFromPlacemark(placemark);
    if (terreno) {
      terrenos.push(terreno);
    }
  }

  if (terrenos.length === 0) {
    return null;
  }

  return {
    nome: defaultName,
    terrenos,
  };
}

/**
 * Extract terreno from a KML Placemark
 */
async function extractTerrenoFromPlacemark(placemark: Element): Promise<ParsedTerreno | null> {
  const nameElement = placemark.querySelector('name');
  const descElement = placemark.querySelector('description');
  const polygonElement = placemark.querySelector('Polygon, MultiGeometry');

  if (!polygonElement) {
    return null; // Skip placemarks without polygons
  }

  const terrenoNome = nameElement?.textContent?.trim() || 'Terreno Sem Nome';
  const terrenoDesc = descElement?.textContent?.trim();

  // Convert single placemark to GeoJSON
  const tempDoc = document.implementation.createDocument(null, 'kml', null);
  const kmlRoot = tempDoc.documentElement;
  kmlRoot.setAttribute('xmlns', 'http://www.opengis.net/kml/2.2');

  const clonedPlacemark = placemark.cloneNode(true) as Element;
  kmlRoot.appendChild(clonedPlacemark);

  const geojson = kml(tempDoc);

  if (!geojson || !geojson.features || geojson.features.length === 0) {
    return null;
  }

  const feature = geojson.features[0];
  const geometria = feature.geometry;

  if (!geometria || (geometria.type !== 'Polygon' && geometria.type !== 'MultiPolygon')) {
    return null;
  }

  // Calculate area in hectares
  const areaM2 = turf.area(geometria);
  const areaHa = areaM2 / 10000;

  const terreno: ParsedTerreno = {
    nome: terrenoNome,
    area: parseFloat(areaHa.toFixed(4)),
    geometria,
    tipoSolo: terrenoDesc,
  };

  // Extract altitude if exists
  if (feature.properties?.altitude) {
    terreno.altitude = parseFloat(feature.properties.altitude);
  }

  return terreno;
}

/**
 * Parse GeoJSON file directly
 */
export async function parseGeoJsonHierarchical(
  file: File,
  organizacaoId: string
): Promise<KmzImportResult> {
  try {
    const text = await file.text();
    const geojson = JSON.parse(text);

    // Validate GeoJSON structure
    if (!geojson || typeof geojson !== 'object') {
      throw new Error('Ficheiro GeoJSON inválido');
    }

    if (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature') {
      throw new Error('GeoJSON deve ser FeatureCollection ou Feature');
    }

    const features = geojson.type === 'FeatureCollection'
      ? geojson.features
      : [geojson];

    if (!features || features.length === 0) {
      throw new Error('Nenhuma feature encontrada no GeoJSON');
    }

    // Group features into terrenos
    const terrenos: ParsedTerreno[] = [];

    for (const feature of features) {
      const geometry = feature.geometry;

      if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
        continue; // Skip non-polygon features
      }

      // Get name from properties (common field names)
      const name = feature.properties?.name
        || feature.properties?.nome
        || feature.properties?.title
        || `Terreno ${terrenos.length + 1}`;

      // Calculate area
      const areaM2 = turf.area(geometry);
      const areaHa = areaM2 / 10000;

      const terreno: ParsedTerreno = {
        nome: name,
        area: parseFloat(areaHa.toFixed(4)),
        geometria: geometry,
      };

      // Extract additional properties
      if (feature.properties?.altitude || feature.properties?.elevation) {
        terreno.altitude = parseFloat(feature.properties.altitude || feature.properties.elevation);
      }

      if (feature.properties?.tipoSolo || feature.properties?.soil_type || feature.properties?.description) {
        terreno.tipoSolo = feature.properties.tipoSolo
          || feature.properties.soil_type
          || feature.properties.description;
      }

      terrenos.push(terreno);
    }

    if (terrenos.length === 0) {
      throw new Error('Nenhum polígono válido encontrado no GeoJSON');
    }

    // Create single property with all terrenos
    const propriedades: ParsedPropriedade[] = [{
      nome: geojson.name || 'Propriedade Importada',
      descricao: geojson.description,
      terrenos,
    }];

    return {
      propriedades,
      organizacaoId,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao processar GeoJSON: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao processar GeoJSON');
  }
}

/**
 * Validate file before uploading (KMZ, KML, or GeoJSON)
 */
export function validateKmzFile(file: File): string | null {
  // Check file extension
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext !== 'kmz' && ext !== 'kml' && ext !== 'json' && ext !== 'geojson') {
    return 'Apenas ficheiros .kmz, .kml, .json ou .geojson são suportados';
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return 'Ficheiro demasiado grande (máximo 10MB)';
  }

  return null; // Valid
}

/**
 * Validate geometry (check if it's a valid polygon/multipolygon)
 */
export function validateGeometry(geometry: any): { valid: boolean; error?: string } {
  if (!geometry || typeof geometry !== 'object') {
    return { valid: false, error: 'Geometria inválida ou inexistente' };
  }

  const validTypes = ['Polygon', 'MultiPolygon'];
  if (!validTypes.includes(geometry.type)) {
    return { valid: false, error: `Tipo de geometria não suportado: ${geometry.type}. Use Polygon ou MultiPolygon.` };
  }

  // Check if coordinates exist
  if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
    return { valid: false, error: 'Coordenadas ausentes ou inválidas' };
  }

  // Basic validation for Polygon
  if (geometry.type === 'Polygon') {
    if (geometry.coordinates.length === 0) {
      return { valid: false, error: 'Polígono vazio' };
    }

    const ring = geometry.coordinates[0];
    if (!Array.isArray(ring) || ring.length < 4) {
      return { valid: false, error: 'Polígono deve ter pelo menos 4 pontos' };
    }

    // Check if first and last coordinates are the same (closed ring)
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return { valid: false, error: 'Polígono não está fechado (primeiro e último ponto devem ser iguais)' };
    }
  }

  // Basic validation for MultiPolygon
  if (geometry.type === 'MultiPolygon') {
    if (geometry.coordinates.length === 0) {
      return { valid: false, error: 'MultiPolígono vazio' };
    }

    for (let i = 0; i < geometry.coordinates.length; i++) {
      const polygon = geometry.coordinates[i];
      if (!Array.isArray(polygon) || polygon.length === 0) {
        return { valid: false, error: `Polígono ${i + 1} inválido no MultiPolígono` };
      }

      const ring = polygon[0];
      if (!Array.isArray(ring) || ring.length < 4) {
        return { valid: false, error: `Polígono ${i + 1} deve ter pelo menos 4 pontos` };
      }
    }
  }

  // Calculate area to ensure it's not too small (at least 1m²)
  try {
    const area = turf.area(geometry);
    if (area < 1) {
      return { valid: false, error: 'Área muito pequena (mínimo 1m²)' };
    }

    // Check if area is reasonable (max 1000 km² = 100,000 hectares)
    const maxAreaM2 = 1000 * 1000 * 1000; // 1000 km²
    if (area > maxAreaM2) {
      return { valid: false, error: 'Área muito grande (máximo 1000 km²)' };
    }
  } catch (error) {
    return { valid: false, error: 'Erro ao calcular área da geometria' };
  }

  return { valid: true };
}

/**
 * Parse file based on extension (auto-detect)
 */
export async function parseGeoFile(
  file: File,
  organizacaoId: string
): Promise<KmzImportResult> {
  const ext = file.name.toLowerCase().split('.').pop();

  if (ext === 'json' || ext === 'geojson') {
    return parseGeoJsonHierarchical(file, organizacaoId);
  } else if (ext === 'kmz' || ext === 'kml') {
    return parseKmzHierarchical(file, organizacaoId);
  } else {
    throw new Error('Formato de ficheiro não suportado');
  }
}
