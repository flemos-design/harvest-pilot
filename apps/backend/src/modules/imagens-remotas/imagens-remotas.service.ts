import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateImagemRemotaDto } from './dto/create-imagem-remota.dto';
import { UpdateImagemRemotaDto } from './dto/update-imagem-remota.dto';

@Injectable()
export class ImagensRemotasService {
  constructor(private prisma: PrismaService) {}

  async create(createImagemRemotaDto: CreateImagemRemotaDto) {
    return this.prisma.imagemRemota.create({
      data: {
        ...createImagemRemotaDto,
        data: new Date(createImagemRemotaDto.data),
      },
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });
  }

  async findAll(parcelaId?: string) {
    const where = parcelaId ? { parcelaId } : {};

    return this.prisma.imagemRemota.findMany({
      where,
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
            area: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const imagemRemota = await this.prisma.imagemRemota.findUnique({
      where: { id },
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });

    if (!imagemRemota) {
      throw new NotFoundException(`Imagem remota com ID ${id} não encontrada`);
    }

    return imagemRemota;
  }

  async getLatestByParcela(parcelaId: string) {
    return this.prisma.imagemRemota.findFirst({
      where: { parcelaId },
      orderBy: { data: 'desc' },
    });
  }

  async getTimeSeries(parcelaId: string, startDate?: string, endDate?: string) {
    const where: any = { parcelaId };

    if (startDate || endDate) {
      where.data = {};
      if (startDate) where.data.gte = new Date(startDate);
      if (endDate) where.data.lte = new Date(endDate);
    }

    return this.prisma.imagemRemota.findMany({
      where,
      orderBy: { data: 'asc' },
      select: {
        id: true,
        data: true,
        ndvi: true,
        ndre: true,
        evi: true,
        fonte: true,
        nuvens: true,
      },
    });
  }

  async update(id: string, updateImagemRemotaDto: UpdateImagemRemotaDto) {
    await this.findOne(id);

    const updateData: any = { ...updateImagemRemotaDto };
    if (updateImagemRemotaDto.data) {
      updateData.data = new Date(updateImagemRemotaDto.data);
    }

    return this.prisma.imagemRemota.update({
      where: { id },
      data: updateData,
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
    await this.findOne(id);

    await this.prisma.imagemRemota.delete({
      where: { id },
    });
  }
}
