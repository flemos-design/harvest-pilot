import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCalendarioRegraDto } from './dto/create-calendario-regra.dto';
import { UpdateCalendarioRegraDto } from './dto/update-calendario-regra.dto';

@Injectable()
export class CalendarioService {
  constructor(private prisma: PrismaService) {}

  async create(createCalendarioRegraDto: CreateCalendarioRegraDto) {
    return this.prisma.calendarioRegra.create({
      data: createCalendarioRegraDto,
    });
  }

  async findAll(filters?: {
    cultura?: string;
    tipoOperacao?: string;
    regiao?: string;
    mes?: number;
  }) {
    const where: any = {};

    if (filters?.cultura) {
      where.cultura = filters.cultura;
    }

    if (filters?.tipoOperacao) {
      where.tipoOperacao = filters.tipoOperacao;
    }

    if (filters?.regiao) {
      where.regiao = filters.regiao;
    }

    let regras = await this.prisma.calendarioRegra.findMany({
      where,
      orderBy: [
        { cultura: 'asc' },
        { mesInicio: 'asc' },
      ],
    });

    // Se filtrar por mês, aplicar filtro em memória
    // (necessário porque a lógica de year-crossing não é simples no Prisma)
    if (filters?.mes) {
      const mes = filters.mes;
      regras = regras.filter((regra) => {
        // Caso normal: mesInicio <= mesFim
        if (regra.mesInicio <= regra.mesFim) {
          return mes >= regra.mesInicio && mes <= regra.mesFim;
        }
        // Caso que atravessa o ano: mesInicio > mesFim (ex: Nov-Mar = 11-3)
        else {
          return mes >= regra.mesInicio || mes <= regra.mesFim;
        }
      });
    }

    return regras;
  }

  async findOne(id: string) {
    const regra = await this.prisma.calendarioRegra.findUnique({
      where: { id },
    });

    if (!regra) {
      throw new NotFoundException(`Regra de calendário com ID ${id} não encontrada`);
    }

    return regra;
  }

  async findByCultura(cultura: string) {
    return this.prisma.calendarioRegra.findMany({
      where: { cultura },
      orderBy: { mesInicio: 'asc' },
    });
  }

  async findByTipoOperacao(tipoOperacao: string) {
    return this.prisma.calendarioRegra.findMany({
      where: { tipoOperacao },
      orderBy: [
        { cultura: 'asc' },
        { mesInicio: 'asc' },
      ],
    });
  }

  async findByRegiao(regiao: string) {
    return this.prisma.calendarioRegra.findMany({
      where: { regiao },
      orderBy: [
        { cultura: 'asc' },
        { mesInicio: 'asc' },
      ],
    });
  }

  /**
   * Encontra regras ativas para um determinado mês
   */
  async findByMes(mes: number) {
    const todasRegras = await this.prisma.calendarioRegra.findMany();

    // Filtrar regras que incluem este mês
    const regrasAtivas = todasRegras.filter((regra) => {
      // Caso normal: mesInicio <= mesFim
      if (regra.mesInicio <= regra.mesFim) {
        return mes >= regra.mesInicio && mes <= regra.mesFim;
      }
      // Caso que atravessa o ano: mesInicio > mesFim (ex: Nov-Mar = 11-3)
      else {
        return mes >= regra.mesInicio || mes <= regra.mesFim;
      }
    });

    return regrasAtivas.sort((a, b) => a.cultura.localeCompare(b.cultura));
  }

  async getStats() {
    const [total, porCultura, porTipoOperacao, porRegiao] = await Promise.all([
      this.prisma.calendarioRegra.count(),
      this.prisma.calendarioRegra.groupBy({
        by: ['cultura'],
        _count: true,
      }),
      this.prisma.calendarioRegra.groupBy({
        by: ['tipoOperacao'],
        _count: true,
      }),
      this.prisma.calendarioRegra.groupBy({
        by: ['regiao'],
        _count: true,
      }),
    ]);

    return {
      total,
      porCultura: porCultura.map((c) => ({
        cultura: c.cultura,
        count: c._count,
      })),
      porTipoOperacao: porTipoOperacao.map((t) => ({
        tipoOperacao: t.tipoOperacao,
        count: t._count,
      })),
      porRegiao: porRegiao.map((r) => ({
        regiao: r.regiao,
        count: r._count,
      })),
    };
  }

  async update(id: string, updateCalendarioRegraDto: UpdateCalendarioRegraDto) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.calendarioRegra.update({
      where: { id },
      data: updateCalendarioRegraDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    await this.prisma.calendarioRegra.delete({
      where: { id },
    });
  }
}
