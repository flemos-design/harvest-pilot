import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('notificacoes')
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar notificação' })
  async create(@Body() dto: CreateNotificacaoDto, @CurrentUser() user: CurrentUserData) {
    return this.notificacoesService.createForUser(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações do utilizador' })
  @ApiQuery({ name: 'userId', required: false, deprecated: true, description: 'Ignorado; o utilizador é derivado do token.' })
  @ApiQuery({ name: 'lida', required: false, description: 'Filtrar por estado de leitura' })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('lida') lida?: string,
  ) {
    return this.notificacoesService.findAll(user.id, lida === 'true' ? true : lida === 'false' ? false : undefined);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  @ApiQuery({ name: 'userId', required: false, deprecated: true, description: 'Ignorado; o utilizador é derivado do token.' })
  async countUnread(@CurrentUser() user: CurrentUserData) {
    return this.notificacoesService.countUnread(user.id);
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.notificacoesService.markAsRead(id, user.id);
  }

  @Patch('marcar-todas-lidas')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiQuery({ name: 'userId', required: false, deprecated: true, description: 'Ignorado; o utilizador é derivado do token.' })
  async markAllAsRead(@CurrentUser() user: CurrentUserData) {
    return this.notificacoesService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover notificação' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.notificacoesService.remove(id, user.id);
  }
}
