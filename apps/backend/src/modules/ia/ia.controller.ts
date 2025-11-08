import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IaService } from './ia.service';
import { ChatMessageDto, ChatResponseDto, InsightDto } from './dto/chat.dto';

@ApiTags('ia')
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Conversar com o assistente agrícola (ex: "O que fazer hoje?")' })
  async chat(@Body() dto: ChatMessageDto): Promise<ChatResponseDto> {
    return this.iaService.chat(dto);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Obter insights automáticos (alertas, recomendações, avisos)' })
  @ApiQuery({ name: 'organizacaoId', required: true, description: 'ID da organização' })
  async getInsights(@Query('organizacaoId') organizacaoId: string): Promise<InsightDto[]> {
    return this.iaService.generateInsights(organizacaoId);
  }

  @Get('critical-parcelas')
  @ApiOperation({ summary: 'Top 3 terrenos mais críticos (priorizar atenção)' })
  @ApiQuery({ name: 'organizacaoId', required: true, description: 'ID da organização' })
  async getTopCriticalParcelas(@Query('organizacaoId') organizacaoId: string) {
    return this.iaService.getTopCriticalParcelas(organizacaoId);
  }
}
