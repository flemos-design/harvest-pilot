import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { RelatoriosService } from './relatorios.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('relatorios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('operacoes/pdf')
  @ApiOperation({ summary: 'Exportar relatório de operações em PDF' })
  @ApiQuery({ name: 'dataInicio', required: true, type: String })
  @ApiQuery({ name: 'dataFim', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'PDF gerado com sucesso',
    content: {
      'application/pdf': {},
    },
  })
  async exportOperacoesPDF(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    if (!dataInicio || !dataFim) {
      throw new BadRequestException(
        'dataInicio e dataFim são obrigatórios',
      );
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new BadRequestException('Datas inválidas');
    }

    const pdfBuffer = await this.relatoriosService.generateOperacoesReport(
      user.organizacaoId,
      inicio,
      fim,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=relatorio-operacoes-${dataInicio}-${dataFim}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  @Get('caderno-campo/pdf')
  @ApiOperation({ summary: 'Exportar Caderno de Campo em PDF' })
  @ApiQuery({ name: 'parcelaId', required: true, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'PDF gerado com sucesso',
    content: {
      'application/pdf': {},
    },
  })
  async exportCadernoCampoPDF(
    @Query('parcelaId') parcelaId: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Res() res?: Response,
  ) {
    if (!parcelaId) {
      throw new BadRequestException('parcelaId é obrigatório');
    }

    let inicio: Date | undefined;
    let fim: Date | undefined;

    if (dataInicio) {
      inicio = new Date(dataInicio);
      if (isNaN(inicio.getTime())) {
        throw new BadRequestException('dataInicio inválida');
      }
    }

    if (dataFim) {
      fim = new Date(dataFim);
      if (isNaN(fim.getTime())) {
        throw new BadRequestException('dataFim inválida');
      }
    }

    const pdfBuffer = await this.relatoriosService.generateCadernoCampo(
      parcelaId,
      inicio,
      fim,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=caderno-campo-${parcelaId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
