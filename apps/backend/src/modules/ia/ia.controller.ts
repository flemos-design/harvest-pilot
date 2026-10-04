import { Controller, Post, Get, Body, Query, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IaService } from './ia.service';
import { ChatMessageDto, ChatResponseDto, InsightDto } from './dto/chat.dto';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('ia')
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Conversar com o assistente agrícola (ex: "O que fazer hoje?")' })
  async chat(@Body() dto: ChatMessageDto, @CurrentUser() user: CurrentUserData): Promise<ChatResponseDto> {
    return this.iaService.chat({ ...dto, organizacaoId: user.organizacaoId });
  }

  @Get('insights')
  @ApiOperation({ summary: 'Obter insights automáticos (alertas, recomendações, avisos)' })
  @ApiQuery({ name: 'organizacaoId', required: true, description: 'ID da organização' })
  async getInsights(@Query('organizacaoId') _organizacaoId: string, @CurrentUser() user: CurrentUserData): Promise<InsightDto[]> {
    return this.iaService.generateInsights(user.organizacaoId);
  }

  @Get('critical-parcelas')
  @ApiOperation({ summary: 'Top 3 terrenos mais críticos (priorizar atenção)' })
  @ApiQuery({ name: 'organizacaoId', required: true, description: 'ID da organização' })
  async getTopCriticalParcelas(@Query('organizacaoId') _organizacaoId: string, @CurrentUser() user: CurrentUserData) {
    return this.iaService.getTopCriticalParcelas(user.organizacaoId);
  }

  // ===== HISTÓRICO DE CONVERSAS =====

  @Get('conversas')
  @ApiOperation({ summary: 'Listar conversas do assistente IA' })
  @ApiQuery({ name: 'organizacaoId', required: true })
  async getConversas(@Query('organizacaoId') _organizacaoId: string, @CurrentUser() user: CurrentUserData) {
    return this.iaService.getConversas(user.organizacaoId);
  }

  @Get('conversas/:id')
  @ApiOperation({ summary: 'Obter uma conversa com todas as mensagens' })
  async getConversa(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.iaService.getConversa(id, user.organizacaoId);
  }

  @Post('conversas')
  @ApiOperation({ summary: 'Criar nova conversa' })
  async createConversa(
    @Body('organizacaoId') _organizacaoId: string,
    @Body('titulo') titulo: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.iaService.createConversa(user.organizacaoId, titulo);
  }

  @Patch('conversas/:id')
  @ApiOperation({ summary: 'Renomear conversa' })
  async updateConversa(
    @Param('id') id: string,
    @Body('titulo') titulo: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.iaService.updateConversa(id, titulo, user.organizacaoId);
  }

  @Delete('conversas/:id')
  @ApiOperation({ summary: 'Apagar conversa e mensagens' })
  async deleteConversa(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.iaService.deleteConversa(id, user.organizacaoId);
  }
}
