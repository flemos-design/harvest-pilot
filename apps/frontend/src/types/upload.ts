export interface UploadedImage {
  key: string;
  url: string;
  thumbnail: string;
}

export interface UploadImageResponse {
  message: string;
  data: UploadedImage;
}

export interface UploadMultipleImagesResponse {
  message: string;
  data: UploadedImage[];
}

export interface SignedUrlResponse {
  url: string;
  expiresIn: number;
}
