import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateParcelaDto } from './dto/create-parcela.dto';
import { UpdateParcelaDto } from './dto/update-parcela.dto';

@Injectable()
export class ParcelasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse geometria string to JSON object
   */
  private parseGeometria(parcela: any) {
    if (parcela && parcela.geometria && typeof parcela.geometria === 'string') {
      try {
        parcela.geometria = JSON.parse(parcela.geometria);
      } catch (e) {
        // If parsing fails, keep it as is
        console.error('Failed to parse geometria:', e);
      }
    }
    return parcela;
  }

  async create(createParcelaDto: CreateParcelaDto) {
    const { geometria, ...data } = createParcelaDto;

    return this.prisma.parcela.create({
      data: {
        ...data,
        geometria: JSON.stringify(geometria),
      },
      include: {
        propriedade: {
          select: {
            id: true,
            nome: true,
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
      },
    });
  }

  /**
   * Criar múltiplas parcelas de uma vez (ex: importar KMZ)
   * Usa transação para garantir atomicidade
   */
  async createBulk(createParcelasDtos: CreateParcelaDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const parcelas = [];

      for (const createParcelaDto of createParcelasDtos) {
        const { geometria, ...data } = createParcelaDto;

        const parcela = await tx.parcela.create({
          data: {
            ...data,
            geometria: JSON.stringify(geometria),
          },
          include: {
            propriedade: {
              select: {
                id: true,
                nome: true,
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
          },
        });

        parcelas.push(parcela);
      }

      return parcelas;
    });
  }

  async findAll(propriedadeId?: string) {
    const parcelas = await this.prisma.parcela.findMany({
      where: propriedadeId ? { propriedadeId } : undefined,
      include: {
        propriedade: {
          select: {
            id: true,
            nome: true,
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
        _count: {
          select: {
            operacoes: true,
            imagensRemotas: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse geometria for each parcela
    return parcelas.map(parcela => this.parseGeometria(parcela));
  }

  async findOne(id: string) {
    const parcela = await this.prisma.parcela.findUnique({
      where: { id },
      include: {
        propriedade: true,
        culturas: {
          include: {
            ciclos: {
              where: { estado: 'ATIVO' },
              orderBy: { dataInicio: 'desc' },
            },
          },
        },
        operacoes: {
          take: 10,
          orderBy: { data: 'desc' },
          include: {
            operador: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        imagensRemotas: {
          take: 5,
          orderBy: { data: 'desc' },
        },
        meteo: {
          take: 7,
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!parcela) {
      throw new NotFoundException(`Parcela com ID ${id} não encontrada`);
    }

    return this.parseGeometria(parcela);
  }

  async update(id: string, updateParcelaDto: UpdateParcelaDto) {
    await this.findOne(id); // Verifica se existe

    const { geometria, ...data } = updateParcelaDto;

    return this.prisma.parcela.update({
      where: { id },
      data: {
        ...data,
        ...(geometria && { geometria: JSON.stringify(geometria) }),
      },
      include: {
        propriedade: {
          select: {
            id: true,
            nome: true,
          },
        },
        culturas: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.parcela.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    const parcela = await this.findOne(id);

    const [totalOperacoes, ultimaOperacao, imagensCount, ultimoNDVI] =
      await Promise.all([
        this.prisma.operacao.count({
          where: { parcelaId: id },
        }),
        this.prisma.operacao.findFirst({
          where: { parcelaId: id },
          orderBy: { data: 'desc' },
          select: {
            tipo: true,
            data: true,
          },
        }),
        this.prisma.imagemRemota.count({
          where: { parcelaId: id },
        }),
        this.prisma.imagemRemota.findFirst({
          where: { parcelaId: id, ndvi: { not: null } },
          orderBy: { data: 'desc' },
          select: {
            ndvi: true,
            data: true,
          },
        }),
      ]);

    return {
      parcelaId: id,
      nome: parcela.nome,
      area: parcela.area,
      stats: {
        totalOperacoes,
        ultimaOperacao,
        imagensCount,
        ultimoNDVI,
      },
    };
  }
}
