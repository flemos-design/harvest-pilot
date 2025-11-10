import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  saveToGallery?: boolean;
}

/**
 * Tirar foto usando a câmara nativa
 */
export async function takePicture(options?: CameraOptions): Promise<Photo> {
  try {
    const photo = await Camera.getPhoto({
      quality: options?.quality || 90,
      allowEditing: options?.allowEditing || false,
      resultType: options?.resultType || CameraResultType.Uri,
      source: options?.source || CameraSource.Camera,
      saveToGallery: options?.saveToGallery || false,
    });

    return photo;
  } catch (error) {
    console.error('Erro ao tirar foto:', error);
    throw error;
  }
}

/**
 * Escolher foto da galeria
 */
export async function pickFromGallery(options?: CameraOptions): Promise<Photo> {
  try {
    const photo = await Camera.getPhoto({
      quality: options?.quality || 90,
      allowEditing: options?.allowEditing || false,
      resultType: options?.resultType || CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    return photo;
  } catch (error) {
    console.error('Erro ao escolher foto:', error);
    throw error;
  }
}

/**
 * Verificar permissões da câmara
 */
export async function checkCameraPermissions(): Promise<boolean> {
  try {
    const permissions = await Camera.checkPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
}

/**
 * Pedir permissões da câmara
 */
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    const permissions = await Camera.requestPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Erro ao pedir permissões:', error);
    return false;
  }
}

/**
 * Converter Photo para Base64
 */
export async function photoToBase64(photo: Photo): Promise<string> {
  if (photo.base64String) {
    return photo.base64String;
  }

  // Se for URI, converter para blob e depois base64
  if (photo.webPath) {
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remover prefixo data:image/...;base64,
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  throw new Error('Não foi possível converter foto para base64');
}
