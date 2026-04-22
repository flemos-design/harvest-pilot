import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';

@Injectable()
export class NotificacoesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificacaoDto) {
    return this.prisma.notificacao.create({ data: dto });
  }

  async findAll(userId: string, lida?: boolean) {
    return this.prisma.notificacao.findMany({
      where: { userId, ...(lida !== undefined && { lida }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countUnread(userId: string) {
    return this.prisma.notificacao.count({
      where: { userId, lida: false },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notificacao.updateMany({
      where: { userId, lida: false },
      data: { lida: true },
    });
  }

  async remove(id: string) {
    return this.prisma.notificacao.delete({ where: { id } });
  }
}
