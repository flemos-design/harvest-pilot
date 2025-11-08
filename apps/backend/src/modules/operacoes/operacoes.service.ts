import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';

@Injectable()
export class OperacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOperacaoDto: CreateOperacaoDto) {
    const { insumos, ...data } = createOperacaoDto;

    return this.prisma.operacao.create({
      data: {
        ...data,
        data: new Date(createOperacaoDto.data),
        insumos: insumos ? (insumos as any) : undefined,
      },
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
            area: true,
          },
        },
        ciclo: {
          select: {
            id: true,
            epoca: true,
          },
        },
        operador: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(parcelaId?: string, tipo?: string, operadorId?: string) {
    return this.prisma.operacao.findMany({
      where: {
        ...(parcelaId && { parcelaId }),
        ...(tipo && { tipo }),
        ...(operadorId && { operadorId }),
      },
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
          },
        },
        ciclo: {
          select: {
            id: true,
            epoca: true,
          },
        },
        operador: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: string) {
    const operacao = await this.prisma.operacao.findUnique({
      where: { id },
      include: {
        parcela: {
          include: {
            propriedade: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        ciclo: true,
        operador: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!operacao) {
      throw new NotFoundException(`Operação com ID ${id} não encontrada`);
    }

    return operacao;
  }

  async update(id: string, updateOperacaoDto: UpdateOperacaoDto) {
    await this.findOne(id);

    const { insumos, data, ...updateData } = updateOperacaoDto;

    return this.prisma.operacao.update({
      where: { id },
      data: {
        ...updateData,
        ...(data && { data: new Date(data) }),
        ...(insumos && { insumos: insumos as any }),
      },
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
          },
        },
        operador: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.operacao.delete({
      where: { id },
    });
  }

  async getResumo(parcelaId?: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = {};
    if (parcelaId) where.parcelaId = parcelaId;
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = dataInicio;
      if (dataFim) where.data.lte = dataFim;
    }

    const [totalOperacoes, custoTotal, operacoesPorTipo] = await Promise.all([
      this.prisma.operacao.count({ where }),
      this.prisma.operacao.aggregate({
        where,
        _sum: { custoTotal: true },
      }),
      this.prisma.operacao.groupBy({
        by: ['tipo'],
        where,
        _count: true,
        orderBy: { _count: { tipo: 'desc' } },
      }),
    ]);

    return {
      totalOperacoes,
      custoTotal: custoTotal._sum.custoTotal || 0,
      operacoesPorTipo: operacoesPorTipo.map((item) => ({
        tipo: item.tipo,
        count: item._count,
      })),
    };
  }
}
