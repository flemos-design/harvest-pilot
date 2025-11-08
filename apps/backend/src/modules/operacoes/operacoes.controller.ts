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
} from '@nestjs/swagger';
import { OperacoesService } from './operacoes.service';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';

@ApiTags('operacoes')
@Controller('operacoes')
export class OperacoesController {
  constructor(private readonly operacoesService: OperacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Registar nova operação de campo' })
  @ApiResponse({ status: 201, description: 'Operação registada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createOperacaoDto: CreateOperacaoDto) {
    return this.operacoesService.create(createOperacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar operações' })
  @ApiQuery({ name: 'parcelaId', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'operadorId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de operações' })
  findAll(
    @Query('parcelaId') parcelaId?: string,
    @Query('tipo') tipo?: string,
    @Query('operadorId') operadorId?: string,
  ) {
    return this.operacoesService.findAll(parcelaId, tipo, operadorId);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Obter resumo de operações' })
  @ApiQuery({ name: 'parcelaId', required: false })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  @ApiResponse({ status: 200, description: 'Resumo de operações' })
  getResumo(
    @Query('parcelaId') parcelaId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.operacoesService.getResumo(
      parcelaId,
      dataInicio ? new Date(dataInicio) : undefined,
      dataFim ? new Date(dataFim) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma operação' })
  @ApiParam({ name: 'id', description: 'ID da operação' })
  @ApiResponse({ status: 200, description: 'Detalhes da operação' })
  @ApiResponse({ status: 404, description: 'Operação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.operacoesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar operação' })
  @ApiParam({ name: 'id', description: 'ID da operação' })
  @ApiResponse({
    status: 200,
    description: 'Operação atualizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Operação não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateOperacaoDto: UpdateOperacaoDto,
  ) {
    return this.operacoesService.update(id, updateOperacaoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover operação' })
  @ApiParam({ name: 'id', description: 'ID da operação' })
  @ApiResponse({ status: 204, description: 'Operação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Operação não encontrada' })
  remove(@Param('id') id: string) {
    return this.operacoesService.remove(id);
  }
}
