'use client';

import React, { useState } from 'react';
import { useCamera } from '@/hooks/use-camera';
import { uploadImage, uploadMultipleImages } from '@/lib/api/upload';
import type { UploadedImage } from '@/types/upload';
import { Camera, ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoUploadProps {
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (images: UploadedImage | UploadedImage[]) => void;
  onError?: (error: Error) => void;
}

export function PhotoUpload({
  folder = 'images',
  multiple = false,
  maxFiles = 10,
  onUploadComplete,
  onError,
}: PhotoUploadProps) {
  const camera = useCamera();
  const [photos, setPhotos] = useState<Array<{ id: string; base64: string; file: File }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Converter base64 para File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Tirar foto com câmara
  const handleTakePhoto = async () => {
    try {
      await camera.takePicture();
      if (camera.base64 && camera.photo) {
        const file = base64ToFile(camera.base64, `photo-${Date.now()}.jpg`);
        const newPhoto = {
          id: `photo-${Date.now()}`,
          base64: camera.base64,
          file,
        };

        if (multiple) {
          setPhotos((prev) => [...prev, newPhoto]);
        } else {
          setPhotos([newPhoto]);
        }
        camera.clearPhoto();
      }
    } catch (err) {
      const error = err as Error;
      setUploadError(error.message);
      onError?.(error);
    }
  };

  // Escolher da galeria
  const handlePickFromGallery = async () => {
    try {
      await camera.pickFromGallery();
      if (camera.base64 && camera.photo) {
        const file = base64ToFile(camera.base64, `photo-${Date.now()}.jpg`);
        const newPhoto = {
          id: `photo-${Date.now()}`,
          base64: camera.base64,
          file,
        };

        if (multiple) {
          setPhotos((prev) => [...prev, newPhoto]);
        } else {
          setPhotos([newPhoto]);
        }
        camera.clearPhoto();
      }
    } catch (err) {
      const error = err as Error;
      setUploadError(error.message);
      onError?.(error);
    }
  };

  // Remover foto
  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Fazer upload
  const handleUpload = async () => {
    if (photos.length === 0) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      if (multiple && photos.length > 1) {
        // Upload múltiplo
        const files = photos.map((p) => p.file);
        const result = await uploadMultipleImages(files, folder);
        onUploadComplete?.(result);
      } else {
        // Upload único
        const result = await uploadImage(photos[0].file, folder);
        onUploadComplete?.(result);
      }

      // Limpar fotos após upload bem sucedido
      setPhotos([]);
    } catch (err) {
      const error = err as Error;
      setUploadError(error.message);
      onError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const canAddMore = !multiple || photos.length < maxFiles;

  return (
    <div className="space-y-4">
      {/* Botões de captura */}
      {canAddMore && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTakePhoto}
            disabled={camera.isLoading || isUploading}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Tirar Foto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePickFromGallery}
            disabled={camera.isLoading || isUploading}
            className="flex-1"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Galeria
          </Button>
        </div>
      )}

      {/* Preview das fotos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square">
                <img
                  src={photo.base64}
                  alt="Preview"
                  className="h-full w-full rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => handleRemovePhoto(photo.id)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Botão de upload */}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>Enviando...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar {photos.length > 1 ? `${photos.length} fotos` : 'foto'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Erros */}
      {(uploadError || camera.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {uploadError || camera.error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Info */}
      {multiple && photos.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {photos.length} de {maxFiles} fotos
        </p>
      )}
    </div>
  );
}
