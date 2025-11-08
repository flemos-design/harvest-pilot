import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUtilizadorDto } from './dto/create-utilizador.dto';
import { UpdateUtilizadorDto } from './dto/update-utilizador.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UtilizadoresService {
  constructor(private prisma: PrismaService) {}

  async create(createUtilizadorDto: CreateUtilizadorDto) {
    // Verificar se email já existe
    const existingUser = await this.prisma.utilizador.findUnique({
      where: { email: createUtilizadorDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUtilizadorDto.password, saltRounds);

    // Criar utilizador
    const { password, ...userData } = createUtilizadorDto;
    return this.prisma.utilizador.create({
      data: {
        ...userData,
        passwordHash,
        papel: userData.papel || 'OPERADOR',
      },
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        organizacaoId: true,
        createdAt: true,
        updatedAt: true,
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
    const where = organizacaoId ? { organizacaoId } : {};

    return this.prisma.utilizador.findMany({
      where,
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        organizacaoId: true,
        createdAt: true,
        updatedAt: true,
        organizacao: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            operacoes: true,
            tarefas: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const utilizador = await this.prisma.utilizador.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        organizacaoId: true,
        createdAt: true,
        updatedAt: true,
        organizacao: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            operacoes: true,
            tarefas: true,
          },
        },
      },
    });

    if (!utilizador) {
      throw new NotFoundException(`Utilizador com ID ${id} não encontrado`);
    }

    return utilizador;
  }

  async findByEmail(email: string) {
    return this.prisma.utilizador.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        organizacaoId: true,
        createdAt: true,
        updatedAt: true,
        organizacao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUtilizadorDto: UpdateUtilizadorDto) {
    await this.findOne(id); // Verifica se existe

    // Se está a atualizar o email, verificar se não existe outro utilizador com esse email
    if (updateUtilizadorDto.email) {
      const existingUser = await this.prisma.utilizador.findUnique({
        where: { email: updateUtilizadorDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    return this.prisma.utilizador.update({
      where: { id },
      data: updateUtilizadorDto,
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        organizacaoId: true,
        createdAt: true,
        updatedAt: true,
        organizacao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const utilizador = await this.prisma.utilizador.findUnique({
      where: { id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!utilizador) {
      throw new NotFoundException(`Utilizador com ID ${id} não encontrado`);
    }

    // Verificar password atual
    const passwordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      utilizador.passwordHash
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Password atual incorreta');
    }

    // Hash da nova password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    await this.prisma.utilizador.update({
      where: { id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return { message: 'Password alterada com sucesso' };
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    await this.prisma.utilizador.delete({
      where: { id },
    });
  }

  // Autenticação
  async login(loginDto: LoginDto) {
    const utilizador = await this.prisma.utilizador.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        organizacaoId: true,
        passwordHash: true,
        organizacao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!utilizador) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar password
    const passwordMatches = await bcrypt.compare(loginDto.password, utilizador.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Retornar dados do utilizador (sem password hash)
    const { passwordHash, ...userData } = utilizador;
    return userData;
  }

  async getStats(organizacaoId?: string) {
    const where = organizacaoId ? { organizacaoId } : {};

    const [total, porPapel, comMaisOperacoes, comMaisTarefas] = await Promise.all([
      this.prisma.utilizador.count({ where }),
      this.prisma.utilizador.groupBy({
        by: ['papel'],
        where,
        _count: true,
      }),
      this.prisma.utilizador.findMany({
        where,
        select: {
          id: true,
          nome: true,
          _count: {
            select: {
              operacoes: true,
            },
          },
        },
        orderBy: {
          operacoes: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
      this.prisma.utilizador.findMany({
        where,
        select: {
          id: true,
          nome: true,
          _count: {
            select: {
              tarefas: true,
            },
          },
        },
        orderBy: {
          tarefas: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    return {
      total,
      porPapel: porPapel.map((p) => ({
        papel: p.papel,
        count: p._count,
      })),
      comMaisOperacoes: comMaisOperacoes.map((u) => ({
        id: u.id,
        nome: u.nome,
        totalOperacoes: u._count.operacoes,
      })),
      comMaisTarefas: comMaisTarefas.map((u) => ({
        id: u.id,
        nome: u.nome,
        totalTarefas: u._count.tarefas,
      })),
    };
  }
}
