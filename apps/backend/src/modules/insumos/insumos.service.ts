import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@Injectable()
export class InsumosService {
  constructor(private prisma: PrismaService) {}

  async create(createInsumoDto: CreateInsumoDto) {
    return this.prisma.insumo.create({
      data: {
        ...createInsumoDto,
        ...(createInsumoDto.validade && { validade: new Date(createInsumoDto.validade) }),
      },
    });
  }

  async findAll(categoria?: string) {
    const where = categoria ? { categoria } : {};

    return this.prisma.insumo.findMany({
      where,
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id },
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo com ID ${id} não encontrado`);
    }

    return insumo;
  }

  async getLowStock() {
    // Buscar todos os insumos com stockMinimo definido
    const insumos = await this.prisma.insumo.findMany({
      where: {
        stockMinimo: { not: null },
      },
    });

    // Filtrar os que estão abaixo do stock mínimo
    return insumos
      .filter((insumo) => insumo.stock <= (insumo.stockMinimo || 0))
      .sort((a, b) => a.stock - b.stock);
  }

  async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.insumo.findMany({
      where: {
        validade: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: {
        validade: 'asc',
      },
    });
  }

  async getByCategoria(categoria: string) {
    return this.prisma.insumo.findMany({
      where: { categoria },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async getStats() {
    const [total, categorias, valorTotal] = await Promise.all([
      this.prisma.insumo.count(),
      this.prisma.insumo.groupBy({
        by: ['categoria'],
        _count: true,
        _sum: {
          stock: true,
        },
      }),
      this.prisma.insumo.aggregate({
        _sum: {
          stock: true,
        },
      }),
    ]);

    // Calcular lowStockCount usando o método getLowStock
    const lowStock = await this.getLowStock();

    return {
      total,
      categorias: categorias.map((c) => ({
        categoria: c.categoria,
        quantidade: c._count,
        stockTotal: c._sum.stock || 0,
      })),
      stockTotal: valorTotal._sum.stock || 0,
      lowStockCount: lowStock.length,
    };
  }

  async update(id: string, updateInsumoDto: UpdateInsumoDto) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id },
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo com ID ${id} não encontrado`);
    }

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...updateInsumoDto,
        ...(updateInsumoDto.validade && { validade: new Date(updateInsumoDto.validade) }),
      },
    });
  }

  async adjustStock(id: string, quantidade: number) {
    const insumo = await this.findOne(id);

    return this.prisma.insumo.update({
      where: { id },
      data: {
        stock: insumo.stock + quantidade,
      },
    });
  }

  async remove(id: string) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id },
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo com ID ${id} não encontrado`);
    }

    await this.prisma.insumo.delete({
      where: { id },
    });
  }
}
