import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ImagensRemotasService } from './imagens-remotas.service';
import { CreateImagemRemotaDto } from './dto/create-imagem-remota.dto';
import { UpdateImagemRemotaDto } from './dto/update-imagem-remota.dto';

@ApiTags('imagens-remotas')
@Controller('imagens-remotas')
export class ImagensRemotasController {
  constructor(private readonly imagensRemotasService: ImagensRemotasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova imagem remota' })
  create(@Body() createImagemRemotaDto: CreateImagemRemotaDto) {
    return this.imagensRemotasService.create(createImagemRemotaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as imagens remotas' })
  @ApiQuery({ name: 'parcelaId', required: false, description: 'Filtrar por ID da parcela' })
  findAll(@Query('parcelaId') parcelaId?: string) {
    return this.imagensRemotasService.findAll(parcelaId);
  }

  @Get('latest/:parcelaId')
  @ApiOperation({ summary: 'Obter a imagem mais recente de uma parcela' })
  getLatestByParcela(@Param('parcelaId') parcelaId: string) {
    return this.imagensRemotasService.getLatestByParcela(parcelaId);
  }

  @Get('timeseries/:parcelaId')
  @ApiOperation({ summary: 'Obter série temporal de índices de uma parcela' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (ISO)' })
  getTimeSeries(
    @Param('parcelaId') parcelaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.imagensRemotasService.getTimeSeries(parcelaId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma imagem remota' })
  findOne(@Param('id') id: string) {
    return this.imagensRemotasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar imagem remota' })
  update(@Param('id') id: string, @Body() updateImagemRemotaDto: UpdateImagemRemotaDto) {
    return this.imagensRemotasService.update(id, updateImagemRemotaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar imagem remota' })
  remove(@Param('id') id: string) {
    return this.imagensRemotasService.remove(id);
  }
}
