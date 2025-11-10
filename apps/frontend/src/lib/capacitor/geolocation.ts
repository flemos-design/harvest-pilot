import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

/**
 * Obter localização atual
 */
export async function getCurrentPosition(options?: PositionOptions): Promise<LocationCoordinates> {
  try {
    const position: Position = await Geolocation.getCurrentPosition(options);

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude || undefined,
      accuracy: position.coords.accuracy,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
    };
  } catch (error) {
    console.error('Erro ao obter localização:', error);
    throw error;
  }
}

/**
 * Observar mudanças na localização (tracking)
 */
export async function watchPosition(
  callback: (position: LocationCoordinates) => void,
  options?: PositionOptions
): Promise<string> {
  try {
    const watchId = await Geolocation.watchPosition(options || {}, (position, err) => {
      if (err) {
        console.error('Erro no watch position:', err);
        return;
      }

      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        });
      }
    });

    return watchId;
  } catch (error) {
    console.error('Erro ao observar localização:', error);
    throw error;
  }
}

/**
 * Parar de observar localização
 */
export async function clearWatch(watchId: string): Promise<void> {
  try {
    await Geolocation.clearWatch({ id: watchId });
  } catch (error) {
    console.error('Erro ao parar watch:', error);
    throw error;
  }
}

/**
 * Verificar permissões de localização
 */
export async function checkLocationPermissions(): Promise<boolean> {
  try {
    const permissions = await Geolocation.checkPermissions();
    return permissions.location === 'granted' || permissions.coarseLocation === 'granted';
  } catch (error) {
    console.error('Erro ao verificar permissões de localização:', error);
    return false;
  }
}

/**
 * Pedir permissões de localização
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const permissions = await Geolocation.requestPermissions();
    return permissions.location === 'granted' || permissions.coarseLocation === 'granted';
  } catch (error) {
    console.error('Erro ao pedir permissões de localização:', error);
    return false;
  }
}

/**
 * Formatar coordenadas para exibição
 */
export function formatCoordinates(coords: LocationCoordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}

/**
 * Verificar se está no browser ou app nativa
 */
export function isNativePlatform(): boolean {
  return typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform();
}
