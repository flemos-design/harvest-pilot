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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PropriedadesService } from './propriedades.service';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';
import { BulkImportDto } from './dto/bulk-import.dto';

@ApiTags('propriedades')
@Controller('propriedades')
export class PropriedadesController {
  constructor(private readonly propriedadesService: PropriedadesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova propriedade' })
  @ApiResponse({ status: 201, description: 'Propriedade criada com sucesso' })
  create(@Body() createPropriedadeDto: CreatePropriedadeDto) {
    return this.propriedadesService.create(createPropriedadeDto);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Importar propriedades e terrenos em massa (KMZ/KML)' })
  @ApiBody({ type: BulkImportDto })
  @ApiResponse({ status: 201, description: 'Propriedades e terrenos importados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  bulkImport(@Body() bulkImportDto: BulkImportDto) {
    return this.propriedadesService.bulkImport(bulkImportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar propriedades' })
  @ApiQuery({ name: 'organizacaoId', required: false })
  findAll(@Query('organizacaoId') organizacaoId?: string) {
    return this.propriedadesService.findAll(organizacaoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma propriedade' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.propriedadesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar propriedade' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id') id: string,
    @Body() updatePropriedadeDto: UpdatePropriedadeDto,
  ) {
    return this.propriedadesService.update(id, updatePropriedadeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover propriedade' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.propriedadesService.remove(id);
  }
}
