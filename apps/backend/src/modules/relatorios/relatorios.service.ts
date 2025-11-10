import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate PDF report of operations within a date range
   */
  async generateOperacoesReport(
    organizacaoId: string,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<Buffer> {
    // Fetch operations
    const operacoes = await this.prisma.operacao.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim,
        },
        parcela: {
          propriedade: {
            organizacaoId,
          },
        },
      },
      include: {
        parcela: {
          select: {
            nome: true,
            area: true,
          },
        },
        operador: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });

    return this.createOperacoesPDF(operacoes, dataInicio, dataFim);
  }

  /**
   * Generate Caderno de Campo (Field Notebook) PDF
   */
  async generateCadernoCampo(
    parcelaId: string,
    dataInicio?: Date,
    dataFim?: Date,
  ): Promise<Buffer> {
    // Fetch parcela details
    const parcela = await this.prisma.parcela.findUnique({
      where: { id: parcelaId },
      include: {
        propriedade: {
          select: {
            nome: true,
            organizacao: {
              select: {
                nome: true,
              },
            },
          },
        },
        culturas: {
          include: {
            ciclos: {
              where: { estado: 'ATIVO' },
              take: 1,
              orderBy: { dataInicio: 'desc' },
            },
          },
        },
        operacoes: {
          where: dataInicio && dataFim
            ? {
                data: {
                  gte: dataInicio,
                  lte: dataFim,
                },
              }
            : undefined,
          include: {
            operador: {
              select: {
                nome: true,
              },
            },
          },
          orderBy: {
            data: 'desc',
          },
        },
      },
    });

    if (!parcela) {
      throw new Error('Parcela não encontrada');
    }

    return this.createCadernoCampoPDF(parcela, dataInicio, dataFim);
  }

  /**
   * Create PDF document for operations report
   */
  private async createOperacoesPDF(
    operacoes: any[],
    dataInicio: Date,
    dataFim: Date,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Relatório de Operações', { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(
          `Período: ${format(dataInicio, 'dd/MM/yyyy')} a ${format(dataFim, 'dd/MM/yyyy')}`,
          { align: 'center' },
        );

      doc.moveDown(1);

      // Summary
      const custoTotal = operacoes.reduce(
        (sum, op) => sum + (op.custoTotal || 0),
        0,
      );
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Resumo');
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Total de Operações: ${operacoes.length}`)
        .text(`Custo Total: €${custoTotal.toFixed(2)}`);

      if (operacoes.length > 0) {
        doc.text(
          `Custo Médio por Operação: €${(custoTotal / operacoes.length).toFixed(2)}`,
        );
      }

      doc.moveDown(1);

      // Operations by type
      const opsPorTipo: Record<string, number> = {};
      operacoes.forEach((op) => {
        opsPorTipo[op.tipo] = (opsPorTipo[op.tipo] || 0) + 1;
      });

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Operações por Tipo');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      Object.entries(opsPorTipo).forEach(([tipo, count]) => {
        doc.text(`${tipo}: ${count}`);
      });

      doc.moveDown(1);

      // Detailed operations list
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Detalhes das Operações');
      doc.moveDown(0.5);

      operacoes.forEach((op, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`${index + 1}. ${op.tipo}`);
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Data: ${format(new Date(op.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`)
          .text(`Parcela: ${op.parcela?.nome || 'N/A'}`)
          .text(`Operador: ${op.operador?.nome || 'N/A'}`);

        if (op.descricao) {
          doc.text(`Descrição: ${op.descricao}`);
        }

        if (op.custoTotal) {
          doc.text(`Custo: €${op.custoTotal.toFixed(2)}`);
        }

        doc.moveDown(0.5);
      });

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - HarvestPilot`,
            50,
            doc.page.height - 50,
            { align: 'center' },
          );
        doc.text(
          `Página ${i + 1} de ${pages.count}`,
          50,
          doc.page.height - 35,
          { align: 'center' },
        );
      }

      doc.end();
    });
  }

  /**
   * Create PDF document for Caderno de Campo
   */
  private async createCadernoCampoPDF(
    parcela: any,
    dataInicio?: Date,
    dataFim?: Date,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Caderno de Campo', { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .font('Helvetica')
        .text(parcela.nome, { align: 'center' });

      doc.moveDown(1);

      // Parcel information
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Informações da Parcela');
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Propriedade: ${parcela.propriedade.nome}`)
        .text(`Organização: ${parcela.propriedade.organizacao.nome}`)
        .text(`Área: ${parcela.area} hectares`);

      if (parcela.altitude) {
        doc.text(`Altitude: ${parcela.altitude}m`);
      }

      if (parcela.tipoSolo) {
        doc.text(`Tipo de Solo: ${parcela.tipoSolo}`);
      }

      doc.moveDown(1);

      // Cultures
      if (parcela.culturas && parcela.culturas.length > 0) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Culturas');
        doc.moveDown(0.5);

        parcela.culturas.forEach((cultura: any) => {
          doc
            .fontSize(11)
            .font('Helvetica')
            .text(`• ${cultura.especie}${cultura.variedade ? ` - ${cultura.variedade}` : ''}`);

          if (cultura.ciclos && cultura.ciclos.length > 0) {
            const ciclo = cultura.ciclos[0];
            doc
              .fontSize(10)
              .text(
                `  Ciclo: ${ciclo.epoca} (Início: ${format(new Date(ciclo.dataInicio), 'dd/MM/yyyy')})`,
              );
          }
        });

        doc.moveDown(1);
      }

      // Operations
      if (parcela.operacoes && parcela.operacoes.length > 0) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Histórico de Operações');

        if (dataInicio && dataFim) {
          doc
            .fontSize(11)
            .font('Helvetica')
            .text(
              `Período: ${format(dataInicio, 'dd/MM/yyyy')} a ${format(dataFim, 'dd/MM/yyyy')}`,
            );
        }

        doc.moveDown(0.5);

        parcela.operacoes.forEach((op: any, index: number) => {
          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();
          }

          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(
              `${format(new Date(op.data), 'dd/MM/yyyy')} - ${op.tipo}`,
            );

          doc.fontSize(10).font('Helvetica');

          if (op.descricao) {
            doc.text(`Descrição: ${op.descricao}`);
          }

          if (op.operador) {
            doc.text(`Operador: ${op.operador.nome}`);
          }

          if (op.custoTotal) {
            doc.text(`Custo: €${op.custoTotal.toFixed(2)}`);
          }

          if (op.notas) {
            doc.text(`Notas: ${op.notas}`);
          }

          doc.moveDown(0.5);
        });
      } else {
        doc
          .fontSize(11)
          .font('Helvetica')
          .text('Nenhuma operação registada neste período.');
      }

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - HarvestPilot`,
            50,
            doc.page.height - 50,
            { align: 'center' },
          );
        doc.text(
          `Página ${i + 1} de ${pages.count}`,
          50,
          doc.page.height - 35,
          { align: 'center' },
        );
      }

      doc.end();
    });
  }
}
