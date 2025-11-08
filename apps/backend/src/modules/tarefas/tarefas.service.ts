import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTarefaDto, EstadoTarefa, PrioridadeTarefa } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';

@Injectable()
export class TarefasService {
  constructor(private prisma: PrismaService) {}

  async create(createTarefaDto: CreateTarefaDto) {
    return this.prisma.tarefa.create({
      data: {
        ...createTarefaDto,
        janelaMeteo: createTarefaDto.janelaMeteo || undefined,
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    estado?: EstadoTarefa;
    prioridade?: PrioridadeTarefa;
    tipo?: string;
    responsavelId?: string;
  }) {
    return this.prisma.tarefa.findMany({
      where: {
        estado: filters?.estado,
        prioridade: filters?.prioridade,
        tipo: filters?.tipo,
        responsavelId: filters?.responsavelId,
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: [
        { prioridade: 'desc' }, // URGENTE primeiro
        { dataInicio: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const tarefa = await this.prisma.tarefa.findUnique({
      where: { id },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!tarefa) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return tarefa;
  }

  async getByEstado(estado: EstadoTarefa) {
    return this.prisma.tarefa.findMany({
      where: { estado },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: [
        { prioridade: 'desc' },
        { dataInicio: 'asc' },
      ],
    });
  }

  async getByPrioridade(prioridade: PrioridadeTarefa) {
    return this.prisma.tarefa.findMany({
      where: { prioridade },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { dataInicio: 'asc' },
    });
  }

  async getByResponsavel(responsavelId: string) {
    return this.prisma.tarefa.findMany({
      where: { responsavelId },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: [
        { estado: 'asc' }, // PLANEADA primeiro
        { prioridade: 'desc' },
        { dataInicio: 'asc' },
      ],
    });
  }

  /**
   * Tarefas que começam nos próximos N dias
   */
  async getUpcoming(days: number = 7) {
    const hoje = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.tarefa.findMany({
      where: {
        estado: { in: ['PLANEADA', 'EM_CURSO'] },
        dataInicio: {
          gte: hoje,
          lte: futureDate,
        },
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: [
        { dataInicio: 'asc' },
        { prioridade: 'desc' },
      ],
    });
  }

  /**
   * Tarefas atrasadas (passaram da data fim e não concluídas)
   */
  async getOverdue() {
    const hoje = new Date();

    return this.prisma.tarefa.findMany({
      where: {
        estado: { in: ['PLANEADA', 'EM_CURSO'] },
        dataFim: {
          lt: hoje,
        },
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: [
        { prioridade: 'desc' },
        { dataFim: 'asc' },
      ],
    });
  }

  /**
   * Tarefas planeadas para hoje
   */
  async getTodayTasks() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.tarefa.findMany({
      where: {
        OR: [
          {
            dataInicio: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            estado: 'EM_CURSO',
          },
        ],
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: [
        { prioridade: 'desc' },
        { dataInicio: 'asc' },
      ],
    });
  }

  /**
   * Estatísticas gerais
   */
  async getStats() {
    const [total, porEstado, porPrioridade, atrasadas] = await Promise.all([
      this.prisma.tarefa.count(),
      this.prisma.tarefa.groupBy({
        by: ['estado'],
        _count: true,
      }),
      this.prisma.tarefa.groupBy({
        by: ['prioridade'],
        _count: true,
      }),
      this.getOverdue(),
    ]);

    // Transformar array de estados em objeto com propriedades diretas
    const estadosMap = porEstado.reduce((acc, e) => {
      acc[e.estado] = e._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      planeadas: estadosMap['PLANEADA'] || 0,
      emCurso: estadosMap['EM_CURSO'] || 0,
      concluidas: estadosMap['CONCLUIDA'] || 0,
      canceladas: estadosMap['CANCELADA'] || 0,
      atrasadas: atrasadas.length,
      porEstado: porEstado.map((e) => ({
        estado: e.estado,
        count: e._count,
      })),
      porPrioridade: porPrioridade.map((p) => ({
        prioridade: p.prioridade,
        count: p._count,
      })),
    };
  }

  async update(id: string, updateTarefaDto: UpdateTarefaDto) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.tarefa.update({
      where: { id },
      data: {
        ...updateTarefaDto,
        janelaMeteo: updateTarefaDto.janelaMeteo || undefined,
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Atualizar apenas o estado da tarefa
   */
  async updateEstado(id: string, estado: EstadoTarefa) {
    await this.findOne(id);

    return this.prisma.tarefa.update({
      where: { id },
      data: { estado },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Marcar tarefa como concluída
   */
  async markConcluida(id: string) {
    await this.findOne(id);

    return this.prisma.tarefa.update({
      where: { id },
      data: {
        estado: 'CONCLUIDA',
        dataConclusao: new Date(),
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    await this.prisma.tarefa.delete({
      where: { id },
    });
  }
}
