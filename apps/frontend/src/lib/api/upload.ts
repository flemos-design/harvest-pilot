import { apiClient } from './client';
import type {
  UploadedImage,
  UploadImageResponse,
  UploadMultipleImagesResponse,
  SignedUrlResponse,
} from '@/types/upload';

/**
 * Upload de uma imagem
 */
export async function uploadImage(file: File, folder: string = 'images'): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await apiClient.post<UploadImageResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

/**
 * Upload múltiplo de imagens (máximo 10)
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'images',
): Promise<UploadedImage[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const response = await apiClient.post<UploadMultipleImagesResponse>('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

/**
 * Remover uma imagem pelo key
 */
export async function deleteImage(key: string): Promise<void> {
  await apiClient.delete(`/upload/${key}`);
}

/**
 * Obter URL assinado temporário
 */
export async function getSignedUrl(key: string, expiresIn?: number): Promise<string> {
  const response = await apiClient.post<SignedUrlResponse>('/upload/signed-url', {
    key,
    expiresIn,
  });

  return response.data.url;
}
