import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrganizacaoDto } from './dto/create-organizacao.dto';
import { UpdateOrganizacaoDto } from './dto/update-organizacao.dto';

@Injectable()
export class OrganizacoesService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizacaoDto: CreateOrganizacaoDto) {
    // Verificar se slug já existe
    const existingSlug = await this.prisma.organizacao.findUnique({
      where: { slug: createOrganizacaoDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException(`Slug '${createOrganizacaoDto.slug}' já está em uso`);
    }

    return this.prisma.organizacao.create({
      data: createOrganizacaoDto,
      include: {
        _count: {
          select: {
            propriedades: true,
            utilizadores: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.organizacao.findMany({
      include: {
        _count: {
          select: {
            propriedades: true,
            utilizadores: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const organizacao = await this.prisma.organizacao.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            propriedades: true,
            utilizadores: true,
          },
        },
        propriedades: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            createdAt: true,
          },
          orderBy: { nome: 'asc' },
        },
      },
    });

    if (!organizacao) {
      throw new NotFoundException(`Organização com ID ${id} não encontrada`);
    }

    return organizacao;
  }

  async findBySlug(slug: string) {
    const organizacao = await this.prisma.organizacao.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            propriedades: true,
            utilizadores: true,
          },
        },
        propriedades: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            createdAt: true,
          },
          orderBy: { nome: 'asc' },
        },
      },
    });

    if (!organizacao) {
      throw new NotFoundException(`Organização com slug '${slug}' não encontrada`);
    }

    return organizacao;
  }

  async getStats() {
    const [total, withPropriedades, totalPropriedades, totalUtilizadores] = await Promise.all([
      this.prisma.organizacao.count(),
      this.prisma.organizacao.count({
        where: {
          propriedades: {
            some: {},
          },
        },
      }),
      this.prisma.propriedade.count(),
      this.prisma.utilizador.count(),
    ]);

    return {
      total,
      withPropriedades,
      totalPropriedades,
      totalUtilizadores,
      avgPropriedadesPorOrganizacao: total > 0 ? totalPropriedades / total : 0,
    };
  }

  async update(id: string, updateOrganizacaoDto: UpdateOrganizacaoDto) {
    await this.findOne(id); // Verifica se existe

    // Se está a atualizar o slug, verificar se não existe outro com esse slug
    if (updateOrganizacaoDto.slug) {
      const existingSlug = await this.prisma.organizacao.findUnique({
        where: { slug: updateOrganizacaoDto.slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(`Slug '${updateOrganizacaoDto.slug}' já está em uso`);
      }
    }

    return this.prisma.organizacao.update({
      where: { id },
      data: updateOrganizacaoDto,
      include: {
        _count: {
          select: {
            propriedades: true,
            utilizadores: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    // Verificar se tem propriedades associadas
    const org = await this.prisma.organizacao.findUnique({
      where: { id },
      include: {
        _count: {
          select: { propriedades: true },
        },
      },
    });

    if (org && org._count.propriedades > 0) {
      throw new ConflictException(
        `Não é possível remover organização com ${org._count.propriedades} propriedades associadas`,
      );
    }

    await this.prisma.organizacao.delete({
      where: { id },
    });
  }
}
