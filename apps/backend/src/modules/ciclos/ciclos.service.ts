import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';

@Injectable()
export class CiclosService {
  constructor(private prisma: PrismaService) {}

  async create(createCicloDto: CreateCicloDto) {
    return this.prisma.ciclo.create({
      data: {
        ...createCicloDto,
        dataInicio: new Date(createCicloDto.dataInicio),
        dataFim: createCicloDto.dataFim ? new Date(createCicloDto.dataFim) : null,
      },
      include: {
        cultura: {
          include: {
            parcela: {
              include: {
                propriedade: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(culturaId?: string) {
    const where = culturaId ? { culturaId } : {};

    return this.prisma.ciclo.findMany({
      where,
      include: {
        cultura: {
          include: {
            parcela: {
              include: {
                propriedade: true,
              },
            },
          },
        },
        _count: {
          select: {
            operacoes: true,
          },
        },
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const ciclo = await this.prisma.ciclo.findUnique({
      where: { id },
      include: {
        cultura: {
          include: {
            parcela: {
              include: {
                propriedade: true,
              },
            },
          },
        },
        operacoes: {
          orderBy: {
            data: 'desc',
          },
          include: {
            operador: true,
          },
        },
        _count: {
          select: {
            operacoes: true,
          },
        },
      },
    });

    if (!ciclo) {
      throw new NotFoundException(`Ciclo com ID ${id} não encontrado`);
    }

    return ciclo;
  }

  async update(id: string, updateCicloDto: UpdateCicloDto) {
    await this.findOne(id); // Verifica se existe

    const data: any = { ...updateCicloDto };
    if (updateCicloDto.dataInicio) {
      data.dataInicio = new Date(updateCicloDto.dataInicio);
    }
    if (updateCicloDto.dataFim) {
      data.dataFim = new Date(updateCicloDto.dataFim);
    }

    return this.prisma.ciclo.update({
      where: { id },
      data,
      include: {
        cultura: {
          include: {
            parcela: {
              include: {
                propriedade: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.ciclo.delete({
      where: { id },
    });
  }

  // Estatísticas agregadas
  async getStats(culturaId?: string) {
    const where = culturaId ? { culturaId } : {};

    const total = await this.prisma.ciclo.count({ where });

    const porEstado = await this.prisma.ciclo.groupBy({
      where,
      by: ['estado'],
      _count: true,
    });

    const cicloAtivo = await this.prisma.ciclo.findFirst({
      where: {
        ...where,
        estado: 'ATIVO',
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });

    return {
      total,
      porEstado,
      cicloAtivo,
    };
  }
}
