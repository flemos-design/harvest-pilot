import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET || 'harvestpilot';

    // Configurar S3 client (MinIO compatible)
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true, // Necessário para MinIO
    });
  }

  /**
   * Upload de imagem com compressão automática
   */
  async uploadImage(file: Express.Multer.File, folder: string = 'images'): Promise<{
    key: string;
    url: string;
    thumbnail: string;
  }> {
    if (!file) {
      throw new BadRequestException('Nenhum ficheiro fornecido');
    }

    // Validar tipo de ficheiro
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de ficheiro não permitido. Use JPEG, PNG ou WebP.');
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Ficheiro muito grande. Máximo: 10MB');
    }

    try {
      // Gerar nome único
      const fileExtension = file.mimetype.split('/')[1];
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;
      const thumbnailKey = `${folder}/thumbnails/${fileName}`;

      // Comprimir imagem original (máximo 1920px de largura, qualidade 85%)
      const compressedImage = await sharp(file.buffer)
        .resize(1920, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      // Criar thumbnail (300px de largura)
      const thumbnailImage = await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload da imagem original comprimida
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: compressedImage,
          ContentType: 'image/jpeg',
          ACL: 'public-read',
        }),
      );

      // Upload do thumbnail
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: thumbnailKey,
          Body: thumbnailImage,
          ContentType: 'image/jpeg',
          ACL: 'public-read',
        }),
      );

      // Gerar URLs (MinIO local usa endpoint público)
      const baseUrl = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || 'http://localhost:9000';
      const url = `${baseUrl}/${this.bucketName}/${key}`;
      const thumbnail = `${baseUrl}/${this.bucketName}/${thumbnailKey}`;

      return { key, url, thumbnail };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new BadRequestException('Erro ao processar a imagem');
    }
  }

  /**
   * Upload múltiplo de imagens
   */
  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'images') {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Remover imagem do S3
   */
  async deleteImage(key: string): Promise<void> {
    try {
      // Remover imagem original
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      // Tentar remover thumbnail (se existir)
      const thumbnailKey = key.replace(/^([^/]+)\//, '$1/thumbnails/');
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: thumbnailKey,
          }),
        );
      } catch (error) {
        // Ignorar se thumbnail não existir
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw new BadRequestException('Erro ao remover a imagem');
    }
  }

  /**
   * Obter URL assinado (válido por 1 hora)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Extrair key de uma URL completa
   */
  extractKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Remove bucket name e retorna o resto
    return pathParts.slice(2).join('/');
  }
}
