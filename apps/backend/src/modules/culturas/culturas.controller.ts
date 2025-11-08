import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CulturasService } from './culturas.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';

@ApiTags('culturas')
@Controller('culturas')
export class CulturasController {
  constructor(private readonly culturasService: CulturasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova cultura' })
  @ApiResponse({
    status: 201,
    description: 'Cultura criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  create(@Body() createCulturaDto: CreateCulturaDto) {
    return this.culturasService.create(createCulturaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as culturas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de culturas retornada com sucesso',
  })
  findAll() {
    return this.culturasService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas agregadas de culturas' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  getStats() {
    return this.culturasService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma cultura' })
  @ApiResponse({
    status: 200,
    description: 'Cultura encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Cultura não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.culturasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma cultura' })
  @ApiResponse({
    status: 200,
    description: 'Cultura atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cultura não encontrada',
  })
  update(@Param('id') id: string, @Body() updateCulturaDto: UpdateCulturaDto) {
    return this.culturasService.update(id, updateCulturaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma cultura' })
  @ApiResponse({
    status: 204,
    description: 'Cultura removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cultura não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.culturasService.remove(id);
  }
}
