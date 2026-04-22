import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';

@ApiTags('notificacoes')
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar notificação' })
  async create(@Body() dto: CreateNotificacaoDto) {
    return this.notificacoesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações do utilizador' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'lida', required: false, description: 'Filtrar por estado de leitura' })
  async findAll(
    @Query('userId') userId: string,
    @Query('lida') lida?: string,
  ) {
    return this.notificacoesService.findAll(userId, lida === 'true' ? true : lida === 'false' ? false : undefined);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  @ApiQuery({ name: 'userId', required: true })
  async countUnread(@Query('userId') userId: string) {
    return this.notificacoesService.countUnread(userId);
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markAsRead(@Param('id') id: string) {
    return this.notificacoesService.markAsRead(id);
  }

  @Patch('marcar-todas-lidas')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  async markAllAsRead(@Query('userId') userId: string) {
    return this.notificacoesService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover notificação' })
  async remove(@Param('id') id: string) {
    return this.notificacoesService.remove(id);
  }
}
