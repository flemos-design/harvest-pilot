import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getCurrentPosition,
  watchPosition,
  clearWatch,
  checkLocationPermissions,
  requestLocationPermissions,
  LocationCoordinates,
} from '@/lib/capacitor/geolocation';

export interface UseGeolocationReturn {
  position: LocationCoordinates | null;
  isLoading: boolean;
  error: Error | null;
  isTracking: boolean;
  getCurrentPosition: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  checkPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  clearPosition: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<string | null>(null);

  const handleGetCurrentPosition = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const coords = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      setPosition(coords);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Erro ao obter localização:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const watchId = await watchPosition(
        (coords) => {
          setPosition(coords);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      watchIdRef.current = watchId;
      setIsTracking(true);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      console.error('Erro ao iniciar tracking:', error);
    }
  }, []);

  const handleStopTracking = useCallback(() => {
    if (watchIdRef.current) {
      clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
    }
  }, []);

  const handleCheckPermissions = useCallback(async (): Promise<boolean> => {
    try {
      return await checkLocationPermissions();
    } catch (err) {
      console.error('Erro ao verificar permissões:', err);
      return false;
    }
  }, []);

  const handleRequestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      return await requestLocationPermissions();
    } catch (err) {
      console.error('Erro ao pedir permissões:', err);
      return false;
    }
  }, []);

  const clearPosition = useCallback(() => {
    setPosition(null);
    setError(null);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    isLoading,
    error,
    isTracking,
    getCurrentPosition: handleGetCurrentPosition,
    startTracking: handleStartTracking,
    stopTracking: handleStopTracking,
    checkPermissions: handleCheckPermissions,
    requestPermissions: handleRequestPermissions,
    clearPosition,
  };
}
