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
import { MeteorologiaService } from './meteorologia.service';
import { CreateMeteoParcelaDto } from './dto/create-meteo-parcela.dto';
import { UpdateMeteoParcelaDto } from './dto/update-meteo-parcela.dto';

@ApiTags('meteorologia')
@Controller('meteorologia')
export class MeteorologiaController {
  constructor(private readonly meteorologiaService: MeteorologiaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo registo meteorológico' })
  create(@Body() createMeteoParcelaDto: CreateMeteoParcelaDto) {
    return this.meteorologiaService.create(createMeteoParcelaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registos meteorológicos' })
  @ApiQuery({ name: 'parcelaId', required: false, description: 'Filtrar por ID da parcela' })
  @ApiQuery({ name: 'fonte', required: false, description: 'Filtrar por fonte (IPMA, OpenMeteo)' })
  findAll(
    @Query('parcelaId') parcelaId?: string,
    @Query('fonte') fonte?: string,
  ) {
    return this.meteorologiaService.findAll(parcelaId, fonte);
  }

  @Get('latest/:parcelaId')
  @ApiOperation({ summary: 'Obter o registo mais recente de uma parcela' })
  getLatestByParcela(@Param('parcelaId') parcelaId: string) {
    return this.meteorologiaService.getLatestByParcela(parcelaId);
  }

  @Get('forecast/:parcelaId')
  @ApiOperation({ summary: 'Obter previsão meteorológica para uma parcela' })
  @ApiQuery({ name: 'days', required: false, description: 'Número de dias (padrão: 7)' })
  getForecast(
    @Param('parcelaId') parcelaId: string,
    @Query('days') days?: string,
  ) {
    const numDays = days ? parseInt(days, 10) : 7;
    return this.meteorologiaService.getForecast(parcelaId, numDays);
  }

  @Get('historico/:parcelaId')
  @ApiOperation({ summary: 'Obter histórico meteorológico de uma parcela' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (ISO)' })
  getHistorico(
    @Param('parcelaId') parcelaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.meteorologiaService.getHistorico(parcelaId, startDate, endDate);
  }

  @Get('stats/:parcelaId')
  @ApiOperation({ summary: 'Obter estatísticas meteorológicas de uma parcela' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (ISO)' })
  getStats(
    @Param('parcelaId') parcelaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.meteorologiaService.getStats(parcelaId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um registo meteorológico' })
  findOne(@Param('id') id: string) {
    return this.meteorologiaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registo meteorológico' })
  update(
    @Param('id') id: string,
    @Body() updateMeteoParcelaDto: UpdateMeteoParcelaDto,
  ) {
    return this.meteorologiaService.update(id, updateMeteoParcelaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar registo meteorológico' })
  remove(@Param('id') id: string) {
    return this.meteorologiaService.remove(id);
  }
}
