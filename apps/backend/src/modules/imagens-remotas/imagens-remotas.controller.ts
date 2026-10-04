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
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('imagens-remotas')
@Controller('imagens-remotas')
export class ImagensRemotasController {
  constructor(private readonly imagensRemotasService: ImagensRemotasService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sincronizar a captura Sentinel-2 mais recente' })
  @ApiQuery({ name: 'lookbackDays', required: false, description: 'Dias a pesquisar (padrão: 30)' })
  @ApiQuery({ name: 'maxCloud', required: false, description: 'Cobertura de nuvens máxima (padrão: 30%)' })
  sync(
    @CurrentUser() user: CurrentUserData,
    @Query('lookbackDays') lookbackDays?: string,
    @Query('maxCloud') maxCloud?: string,
  ) {
    return this.imagensRemotasService.syncOrganizacao(
      user.organizacaoId,
      lookbackDays ? Number(lookbackDays) : 30,
      maxCloud ? Number(maxCloud) : 30,
    );
  }

  @Get('status')
  @ApiOperation({ summary: 'Verificar configuração da sincronização Sentinel-2' })
  getStatus() {
    return this.imagensRemotasService.getConfigurationStatus();
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova imagem remota' })
  create(@Body() createImagemRemotaDto: CreateImagemRemotaDto, @CurrentUser() user: CurrentUserData) {
    return this.imagensRemotasService.create(createImagemRemotaDto, user.organizacaoId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as imagens remotas' })
  @ApiQuery({ name: 'parcelaId', required: false, description: 'Filtrar por ID da parcela' })
  findAll(@Query('parcelaId') parcelaId: string | undefined, @CurrentUser() user: CurrentUserData) {
    return this.imagensRemotasService.findAll(parcelaId, user.organizacaoId);
  }

  @Get('latest/:parcelaId')
  @ApiOperation({ summary: 'Obter a imagem mais recente de uma parcela' })
  getLatestByParcela(@Param('parcelaId') parcelaId: string, @CurrentUser() user: CurrentUserData) {
    return this.imagensRemotasService.getLatestByParcela(parcelaId, user.organizacaoId);
  }

  @Get('timeseries/:parcelaId')
  @ApiOperation({ summary: 'Obter série temporal de índices de uma parcela' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (ISO)' })
  getTimeSeries(
    @Param('parcelaId') parcelaId: string,
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.imagensRemotasService.getTimeSeries(parcelaId, startDate, endDate, user.organizacaoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma imagem remota' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.imagensRemotasService.findOne(id, user.organizacaoId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar imagem remota' })
  update(@Param('id') id: string, @Body() updateImagemRemotaDto: UpdateImagemRemotaDto, @CurrentUser() user: CurrentUserData) {
    return this.imagensRemotasService.update(id, updateImagemRemotaDto, user.organizacaoId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar imagem remota' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.imagensRemotasService.remove(id, user.organizacaoId);
  }
}
