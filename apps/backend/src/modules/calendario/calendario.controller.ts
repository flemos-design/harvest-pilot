import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CalendarioService } from './calendario.service';
import { CreateCalendarioRegraDto } from './dto/create-calendario-regra.dto';
import { UpdateCalendarioRegraDto } from './dto/update-calendario-regra.dto';

@ApiTags('calendario')
@Controller('calendario')
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova regra de calendário' })
  create(@Body() createCalendarioRegraDto: CreateCalendarioRegraDto) {
    return this.calendarioService.create(createCalendarioRegraDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar regras com filtros opcionais' })
  @ApiQuery({ name: 'cultura', required: false })
  @ApiQuery({ name: 'tipoOperacao', required: false })
  @ApiQuery({ name: 'regiao', required: false })
  @ApiQuery({ name: 'mes', required: false, type: Number })
  findAll(
    @Query('cultura') cultura?: string,
    @Query('tipoOperacao') tipoOperacao?: string,
    @Query('regiao') regiao?: string,
    @Query('mes') mes?: string,
  ) {
    return this.calendarioService.findAll({
      cultura,
      tipoOperacao,
      regiao,
      mes: mes ? parseInt(mes, 10) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de regras' })
  getStats() {
    return this.calendarioService.getStats();
  }

  @Get('cultura/:cultura')
  @ApiOperation({ summary: 'Obter regras por cultura' })
  findByCultura(@Param('cultura') cultura: string) {
    return this.calendarioService.findByCultura(cultura);
  }

  @Get('tipo-operacao/:tipoOperacao')
  @ApiOperation({ summary: 'Obter regras por tipo de operação' })
  findByTipoOperacao(@Param('tipoOperacao') tipoOperacao: string) {
    return this.calendarioService.findByTipoOperacao(tipoOperacao);
  }

  @Get('regiao/:regiao')
  @ApiOperation({ summary: 'Obter regras por região' })
  findByRegiao(@Param('regiao') regiao: string) {
    return this.calendarioService.findByRegiao(regiao);
  }

  @Get('mes/:mes')
  @ApiOperation({ summary: 'Obter regras ativas para um mês' })
  findByMes(@Param('mes') mes: string) {
    return this.calendarioService.findByMes(parseInt(mes, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma regra por ID' })
  findOne(@Param('id') id: string) {
    return this.calendarioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma regra' })
  update(@Param('id') id: string, @Body() updateCalendarioRegraDto: UpdateCalendarioRegraDto) {
    return this.calendarioService.update(id, updateCalendarioRegraDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma regra' })
  remove(@Param('id') id: string) {
    return this.calendarioService.remove(id);
  }
}
