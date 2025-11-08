import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';

@Injectable()
export class PropriedadesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPropriedadeDto: CreatePropriedadeDto) {
    return this.prisma.propriedade.create({
      data: createPropriedadeDto,
      include: {
        organizacao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async findAll(organizacaoId?: string) {
    return this.prisma.propriedade.findMany({
      where: organizacaoId ? { organizacaoId } : undefined,
      include: {
        organizacao: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            parcelas: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const propriedade = await this.prisma.propriedade.findUnique({
      where: { id },
      include: {
        organizacao: true,
        parcelas: {
          include: {
            culturas: true,
            _count: {
              select: {
                operacoes: true,
              },
            },
          },
        },
      },
    });

    if (!propriedade) {
      throw new NotFoundException(
        `Propriedade com ID ${id} não encontrada`,
      );
    }

    return propriedade;
  }

  async update(id: string, updatePropriedadeDto: UpdatePropriedadeDto) {
    await this.findOne(id);

    return this.prisma.propriedade.update({
      where: { id },
      data: updatePropriedadeDto,
      include: {
        organizacao: {
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

    return this.prisma.propriedade.delete({
      where: { id },
    });
  }
}
