import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload de uma imagem' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'Pasta de destino (opcional)',
          example: 'operacoes',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum ficheiro fornecido');
    }

    const result = await this.uploadService.uploadImage(file, folder || 'images');

    return {
      message: 'Imagem enviada com sucesso',
      data: result,
    };
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload múltiplo de imagens (máximo 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          description: 'Pasta de destino (opcional)',
          example: 'operacoes',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 ficheiros
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum ficheiro fornecido');
    }

    const results = await this.uploadService.uploadMultipleImages(files, folder || 'images');

    return {
      message: `${results.length} imagens enviadas com sucesso`,
      data: results,
    };
  }

  @Delete(':key(*)')
  @ApiOperation({ summary: 'Remover uma imagem pelo key' })
  async deleteImage(@Param('key') key: string) {
    await this.uploadService.deleteImage(key);

    return {
      message: 'Imagem removida com sucesso',
    };
  }

  @Post('signed-url')
  @ApiOperation({ summary: 'Obter URL assinado temporário' })
  async getSignedUrl(@Body('key') key: string, @Body('expiresIn') expiresIn?: number) {
    if (!key) {
      throw new BadRequestException('Key é obrigatório');
    }

    const url = await this.uploadService.getSignedUrl(key, expiresIn);

    return {
      url,
      expiresIn: expiresIn || 3600,
    };
  }
}
