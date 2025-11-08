import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';

@Injectable()
export class CulturasService {
  constructor(private prisma: PrismaService) {}


  async create(createCulturaDto: CreateCulturaDto) {
    return this.prisma.cultura.create({
      data: createCulturaDto,
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.cultura.findMany({
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
        _count: {
          select: {
            ciclos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const cultura = await this.prisma.cultura.findUnique({
      where: { id },
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
        ciclos: {
          orderBy: {
            dataInicio: 'desc',
          },
        },
        _count: {
          select: {
            ciclos: true,
          },
        },
      },
    });

    if (!cultura) {
      throw new NotFoundException(`Cultura com ID ${id} não encontrada`);
    }

    return cultura;
  }

  async update(id: string, updateCulturaDto: UpdateCulturaDto) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.cultura.update({
      where: { id },
      data: updateCulturaDto,
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.cultura.delete({
      where: { id },
    });
  }

  // Estatísticas agregadas
  async getStats() {
    const total = await this.prisma.cultura.count();
    const porEspecie = await this.prisma.cultura.groupBy({
      by: ['especie'],
      _count: true,
      orderBy: {
        _count: {
          especie: 'desc',
        },
      },
    });

    const porFinalidade = await this.prisma.cultura.groupBy({
      by: ['finalidade'],
      _count: true,
    });

    return {
      total,
      porEspecie,
      porFinalidade,
    };
  }
}
