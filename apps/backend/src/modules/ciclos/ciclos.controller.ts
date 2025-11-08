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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CiclosService } from './ciclos.service';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';

@ApiTags('ciclos')
@Controller('ciclos')
export class CiclosController {
  constructor(private readonly ciclosService: CiclosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo ciclo' })
  @ApiResponse({
    status: 201,
    description: 'Ciclo criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  create(@Body() createCicloDto: CreateCicloDto) {
    return this.ciclosService.create(createCicloDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os ciclos' })
  @ApiQuery({
    name: 'culturaId',
    required: false,
    description: 'Filtrar por ID da cultura',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ciclos retornada com sucesso',
  })
  findAll(@Query('culturaId') culturaId?: string) {
    return this.ciclosService.findAll(culturaId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas agregadas de ciclos' })
  @ApiQuery({
    name: 'culturaId',
    required: false,
    description: 'Filtrar por ID da cultura',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  getStats(@Query('culturaId') culturaId?: string) {
    return this.ciclosService.getStats(culturaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um ciclo' })
  @ApiResponse({
    status: 200,
    description: 'Ciclo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Ciclo não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.ciclosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um ciclo' })
  @ApiResponse({
    status: 200,
    description: 'Ciclo atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Ciclo não encontrado',
  })
  update(@Param('id') id: string, @Body() updateCicloDto: UpdateCicloDto) {
    return this.ciclosService.update(id, updateCicloDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um ciclo' })
  @ApiResponse({
    status: 204,
    description: 'Ciclo removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Ciclo não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.ciclosService.remove(id);
  }
}
