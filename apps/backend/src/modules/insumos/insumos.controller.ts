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
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@ApiTags('insumos')
@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo insumo' })
  create(@Body() createInsumoDto: CreateInsumoDto) {
    return this.insumosService.create(createInsumoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os insumos' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoria' })
  findAll(@Query('categoria') categoria?: string) {
    return this.insumosService.findAll(categoria);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Obter insumos com stock baixo' })
  getLowStock() {
    return this.insumosService.getLowStock();
  }

  @Get('expiring-soon')
  @ApiOperation({ summary: 'Obter insumos a expirar em breve' })
  @ApiQuery({ name: 'days', required: false, description: 'Dias até expiração (padrão: 30)' })
  getExpiringSoon(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;
    return this.insumosService.getExpiringSoon(numDays);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de insumos' })
  getStats() {
    return this.insumosService.getStats();
  }

  @Get('categoria/:categoria')
  @ApiOperation({ summary: 'Obter insumos por categoria' })
  getByCategoria(@Param('categoria') categoria: string) {
    return this.insumosService.getByCategoria(categoria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um insumo' })
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar insumo' })
  update(@Param('id') id: string, @Body() updateInsumoDto: UpdateInsumoDto) {
    return this.insumosService.update(id, updateInsumoDto);
  }

  @Patch(':id/adjust-stock')
  @ApiOperation({ summary: 'Ajustar stock de um insumo' })
  adjustStock(
    @Param('id') id: string,
    @Body() body: { quantidade: number }
  ) {
    return this.insumosService.adjustStock(id, body.quantidade);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar insumo' })
  remove(@Param('id') id: string) {
    return this.insumosService.remove(id);
  }
}
