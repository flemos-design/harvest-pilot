import { useState, useCallback } from 'react';
import { Photo } from '@capacitor/camera';
import {
  takePicture,
  pickFromGallery,
  checkCameraPermissions,
  requestCameraPermissions,
  photoToBase64,
  CameraOptions,
} from '@/lib/capacitor/camera';

export interface UseCameraReturn {
  photo: Photo | null;
  base64: string | null;
  isLoading: boolean;
  error: Error | null;
  takePicture: (options?: CameraOptions) => Promise<void>;
  pickFromGallery: (options?: CameraOptions) => Promise<void>;
  checkPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  clearPhoto: () => void;
}

export function useCamera(): UseCameraReturn {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleTakePicture = useCallback(async (options?: CameraOptions) => {
    try {
      setIsLoading(true);
      setError(null);

      const newPhoto = await takePicture(options);
      setPhoto(newPhoto);

      // Converter para base64 se necessário
      const photoBase64 = await photoToBase64(newPhoto);
      setBase64(photoBase64);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Erro ao tirar foto:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePickFromGallery = useCallback(async (options?: CameraOptions) => {
    try {
      setIsLoading(true);
      setError(null);

      const newPhoto = await pickFromGallery(options);
      setPhoto(newPhoto);

      // Converter para base64
      const photoBase64 = await photoToBase64(newPhoto);
      setBase64(photoBase64);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Erro ao escolher foto:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCheckPermissions = useCallback(async (): Promise<boolean> => {
    try {
      return await checkCameraPermissions();
    } catch (err) {
      console.error('Erro ao verificar permissões:', err);
      return false;
    }
  }, []);

  const handleRequestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      return await requestCameraPermissions();
    } catch (err) {
      console.error('Erro ao pedir permissões:', err);
      return false;
    }
  }, []);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setBase64(null);
    setError(null);
  }, []);

  return {
    photo,
    base64,
    isLoading,
    error,
    takePicture: handleTakePicture,
    pickFromGallery: handlePickFromGallery,
    checkPermissions: handleCheckPermissions,
    requestPermissions: handleRequestPermissions,
    clearPhoto,
  };
}
