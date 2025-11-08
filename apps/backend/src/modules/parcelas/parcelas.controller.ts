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
import { ParcelasService } from './parcelas.service';
import { CreateParcelaDto } from './dto/create-parcela.dto';
import { UpdateParcelaDto } from './dto/update-parcela.dto';

@ApiTags('parcelas')
@Controller('parcelas')
export class ParcelasController {
  constructor(private readonly parcelasService: ParcelasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova parcela' })
  @ApiResponse({ status: 201, description: 'Parcela criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createParcelaDto: CreateParcelaDto) {
    return this.parcelasService.create(createParcelaDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Criar múltiplas parcelas de uma vez (ex: importar KMZ)' })
  @ApiBody({ type: [CreateParcelaDto] })
  @ApiResponse({ status: 201, description: 'Parcelas criadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  createBulk(@Body() createParcelasDtos: CreateParcelaDto[]) {
    return this.parcelasService.createBulk(createParcelasDtos);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as parcelas' })
  @ApiQuery({
    name: 'propriedadeId',
    required: false,
    description: 'Filtrar por propriedade',
  })
  @ApiResponse({ status: 200, description: 'Lista de parcelas' })
  findAll(@Query('propriedadeId') propriedadeId?: string) {
    return this.parcelasService.findAll(propriedadeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma parcela' })
  @ApiParam({ name: 'id', description: 'ID da parcela' })
  @ApiResponse({ status: 200, description: 'Detalhes da parcela' })
  @ApiResponse({ status: 404, description: 'Parcela não encontrada' })
  findOne(@Param('id') id: string) {
    return this.parcelasService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obter estatísticas de uma parcela' })
  @ApiParam({ name: 'id', description: 'ID da parcela' })
  @ApiResponse({ status: 200, description: 'Estatísticas da parcela' })
  @ApiResponse({ status: 404, description: 'Parcela não encontrada' })
  getStats(@Param('id') id: string) {
    return this.parcelasService.getStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar parcela' })
  @ApiParam({ name: 'id', description: 'ID da parcela' })
  @ApiResponse({ status: 200, description: 'Parcela atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Parcela não encontrada' })
  update(@Param('id') id: string, @Body() updateParcelaDto: UpdateParcelaDto) {
    return this.parcelasService.update(id, updateParcelaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover parcela' })
  @ApiParam({ name: 'id', description: 'ID da parcela' })
  @ApiResponse({ status: 204, description: 'Parcela removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Parcela não encontrada' })
  remove(@Param('id') id: string) {
    return this.parcelasService.remove(id);
  }
}
