import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import OpenAI from 'openai';
import { ChatMessageDto, ChatResponseDto, InsightDto } from './dto/chat.dto';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn('OPENAI_API_KEY not configured - IA features disabled');
      return;
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Chat com o assistente agrícola
   */
  async chat(dto: ChatMessageDto): Promise<ChatResponseDto> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    // 1. Buscar contexto relevante (RAG)
    const context = await this.buildContext(dto.organizacaoId, dto.parcelaId);

    // 2. Construir prompt do sistema
    const systemPrompt = this.buildSystemPrompt(context);

    // 3. Chamar OpenAI
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dto.message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const answer = completion.choices[0]?.message?.content || 'Sem resposta';

      // 4. Retornar com metadados
      return {
        answer,
        sources: context.sources,
        confidence: this.calculateConfidence(context, answer),
        explanation: this.explainReasoning(dto.message, context, answer),
      };
    } catch (error) {
      this.logger.error(`OpenAI error: ${error.message}`);
      throw new Error('Erro ao processar pergunta com IA');
    }
  }

  /**
   * Gerar insights automáticos para uma organização
   */
  async generateInsights(organizacaoId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    // 1. Insights de NDVI (quedas recentes)
    const ndviInsights = await this.generateNDVIInsights(organizacaoId);
    insights.push(...ndviInsights);

    // 2. Insights de Meteorologia (riscos)
    const meteoInsights = await this.generateMeteoInsights(organizacaoId);
    insights.push(...meteoInsights);

    // 3. Insights de Operações (atrasadas/pendentes)
    const opInsights = await this.generateOperationInsights(organizacaoId);
    insights.push(...opInsights);

    // Ordenar por prioridade
    return insights.sort((a, b) => b.priority - a.priority).slice(0, 10);
  }

  /**
   * Obter top 3 parcelas críticas
   */
  async getTopCriticalParcelas(organizacaoId: string): Promise<any> {
    // Combinar múltiplos fatores:
    // - NDVI a cair
    // - Operações atrasadas
    // - Risco meteorológico

    const parcelas = await this.prisma.parcela.findMany({
      where: { propriedade: { organizacaoId } },
      include: {
        culturas: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            ciclos: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        operacoes: {
          take: 5,
          orderBy: { data: 'desc' },
        },
      },
      take: 50,
    });

    // Score cada parcela
    const scored = await Promise.all(
      parcelas.map(async (parcela) => {
        let score = 0;
        const reasons: string[] = [];

        // NDVI (se houver imagens recentes)
        const lastNDVI = await this.getLastNDVI(parcela.id);
        if (lastNDVI && lastNDVI.valor < 0.4) {
          score += 40;
          reasons.push(`NDVI baixo (${lastNDVI.valor.toFixed(2)})`);
        }

        // Operações atrasadas (sem operação há >30 dias)
        const daysSinceLastOp = parcela.operacoes[0]
          ? Math.floor(
              (Date.now() - parcela.operacoes[0].data.getTime()) / (1000 * 60 * 60 * 24),
            )
          : 999;
        if (daysSinceLastOp > 30) {
          score += 30;
          reasons.push(`Sem operações há ${daysSinceLastOp} dias`);
        }

        // Meteo (risco de chuva/vento)
        const meteoRisk = await this.getMeteoRisk(parcela.id);
        if (meteoRisk > 0.5) {
          score += 20;
          reasons.push('Risco meteorológico elevado');
        }

        // Área grande sem atenção = maior prioridade
        if (parcela.area > 2 && score > 20) {
          score += 10;
          reasons.push(`Área grande (${parcela.area} ha)`);
        }

        return {
          parcelaId: parcela.id,
          nome: parcela.nome,
          area: parcela.area,
          cultura: parcela.culturas[0]?.especie || 'Sem cultura',
          score,
          reasons,
        };
      }),
    );

    return scored
      .filter((p) => p.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  /**
   * RAG: Construir contexto a partir dos dados
   */
  private async buildContext(organizacaoId: string, parcelaId?: string) {
    const context: any = {
      sources: [],
      data: {},
    };

    try {
      // Dados da organização
      const org = await this.prisma.organizacao.findUnique({
        where: { id: organizacaoId },
        include: {
          propriedades: {
            include: {
              parcelas: { take: 5 },
            },
            take: 3,
          },
        },
      });

      if (org) {
        context.data.organizacao = {
          nome: org.nome,
          numPropriedades: org.propriedades.length,
          numParcelas: org.propriedades.reduce((sum, p) => sum + p.parcelas.length, 0),
        };
        context.sources.push('Dados da Organização');
      }

      // Se parcela específica
      if (parcelaId) {
        const parcela = await this.prisma.parcela.findUnique({
          where: { id: parcelaId },
          include: {
            culturas: {
              include: {
                ciclos: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            operacoes: {
              orderBy: { data: 'desc' },
              take: 10,
            },
          },
        });

        if (parcela) {
          context.data.parcela = {
            nome: parcela.nome,
            area: parcela.area,
            cultura: parcela.culturas[0]?.especie || 'Sem cultura',
            ultimaOperacao: parcela.operacoes[0]?.tipo,
            numOperacoes: parcela.operacoes.length,
          };
          context.sources.push('Dados da Parcela');
        }
      }

      // Meteorologia recente (últimos 7 dias)
      if (parcelaId) {
        const meteo = await this.prisma.meteoParcela.findMany({
          where: { parcelaId },
          orderBy: { data: 'desc' },
          take: 7,
        });

        if (meteo.length > 0) {
          context.data.meteorologia = {
            mediaTemp: meteo.reduce((sum, m) => sum + (m.temperatura || 0), 0) / meteo.length,
            totalPrecipitacao: meteo.reduce((sum, m) => sum + (m.precipitacao || 0), 0),
            maxVento: Math.max(...meteo.map((m) => m.vento || 0)),
          };
          context.sources.push('Dados Meteorológicos (7 dias)');
        }
      }

      // NDVI recente
      if (parcelaId) {
        const ndvi = await this.getLastNDVI(parcelaId);
        if (ndvi) {
          context.data.ndvi = {
            valor: ndvi.valor,
            data: ndvi.data,
            interpretacao: this.interpretNDVI(ndvi.valor),
          };
          context.sources.push('Índices de Vegetação (NDVI)');
        }
      }

      // Tarefas pendentes (sem relação direta com parcela)
      const tarefas = await this.prisma.tarefa.findMany({
        where: {
          responsavel: {
            organizacaoId,
          },
          estado: { not: 'CONCLUIDA' },
        },
        take: 10,
        include: {
          responsavel: {
            select: { nome: true },
          },
        },
      });

      if (tarefas.length > 0) {
        context.data.tarefas = tarefas.map((t) => ({
          titulo: t.titulo,
          responsavel: t.responsavel?.nome || 'Sem responsável',
          prioridade: t.prioridade,
          dataInicio: t.dataInicio,
          dataFim: t.dataFim,
        }));
        context.sources.push('Tarefas Pendentes');
      }
    } catch (error) {
      this.logger.error(`Error building context: ${error.message}`);
    }

    return context;
  }

  /**
   * Construir prompt do sistema com contexto
   */
  private buildSystemPrompt(context: any): string {
    return `És um assistente agrícola especializado para a plataforma HarvestPilot.

**Contexto atual:**
${JSON.stringify(context.data, null, 2)}

**Instruções:**
- Responde em português de Portugal de forma clara e prática
- Foca em ações concretas que o agricultor pode tomar
- Usa os dados fornecidos para fundamentar as tuas recomendações
- Se não tiveres dados suficientes, diz isso claramente
- Prioriza a segurança das culturas e a otimização de recursos
- Explica o "porquê" das tuas sugestões

**Expertise:**
- Castanheiro (fruto e madeira)
- Cerejeira (fruto e madeira)
- Fenologia, NDVI, meteorologia
- Calendário agrícola (plantação, colheita, podas, tratamentos)

Responde à pergunta do utilizador de forma útil e baseada nos dados.`;
  }

  /**
   * Calcular confiança da resposta
   */
  private calculateConfidence(context: any, answer: string): number {
    let confidence = 0.5; // Base

    // +0.2 se tiver dados da parcela
    if (context.data.parcela) confidence += 0.2;

    // +0.15 se tiver NDVI
    if (context.data.ndvi) confidence += 0.15;

    // +0.1 se tiver meteorologia
    if (context.data.meteorologia) confidence += 0.1;

    // +0.05 por fonte de dados
    confidence += Math.min(context.sources.length * 0.05, 0.15);

    return Math.min(confidence, 1.0);
  }

  /**
   * Explicar raciocínio da IA
   */
  private explainReasoning(question: string, context: any, answer: string): string {
    const sources = context.sources.join(', ');
    return `Resposta baseada em: ${sources}. Analisei os dados disponíveis da organização e parcelas para fornecer uma recomendação prática.`;
  }

  /**
   * Gerar insights de NDVI
   */
  private async generateNDVIInsights(organizacaoId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    // Buscar parcelas com queda de NDVI
    const parcelas = await this.prisma.parcela.findMany({
      where: { propriedade: { organizacaoId } },
      take: 20,
    });

    for (const parcela of parcelas) {
      const ndviTrend = await this.getNDVITrend(parcela.id);

      if (ndviTrend && ndviTrend.quedaPercentagem > 15) {
        insights.push({
          type: 'warning',
          title: `Queda de vigor na parcela ${parcela.nome}`,
          description: `NDVI caiu ${ndviTrend.quedaPercentagem.toFixed(1)}% nos últimos 7 dias`,
          parcelaIds: [parcela.id],
          priority: ndviTrend.quedaPercentagem > 25 ? 5 : 3,
          actions: [
            'Inspecionar visualmente a parcela',
            'Verificar sinais de pragas ou doenças',
            'Considerar análise de solo ou foliar',
          ],
          explanation: `A queda acentuada de NDVI pode indicar stress hídrico, deficiência nutricional ou problemas fitossanitários.`,
          dataPoints: {
            ndviAnterior: ndviTrend.anterior,
            ndviAtual: ndviTrend.atual,
            queda: ndviTrend.quedaPercentagem,
          },
        });
      }
    }

    return insights;
  }

  /**
   * Gerar insights de meteorologia
   */
  private async generateMeteoInsights(organizacaoId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    // Buscar parcelas com risco meteorológico
    const parcelas = await this.prisma.parcela.findMany({
      where: { propriedade: { organizacaoId } },
      take: 20,
    });

    for (const parcela of parcelas) {
      const meteoRisk = await this.getDetailedMeteoRisk(parcela.id);

      if (meteoRisk && meteoRisk.score > 0.6) {
        insights.push({
          type: 'alert',
          title: `Risco meteorológico na parcela ${parcela.nome}`,
          description: meteoRisk.description,
          parcelaIds: [parcela.id],
          priority: 4,
          actions: meteoRisk.actions,
          explanation: meteoRisk.reasoning,
          dataPoints: meteoRisk.data,
        });
      }
    }

    return insights;
  }

  /**
   * Gerar insights de operações
   */
  private async generateOperationInsights(organizacaoId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    // Tarefas atrasadas (dataFim já passou e estado não é CONCLUIDA)
    const tarefasAtrasadas = await this.prisma.tarefa.findMany({
      where: {
        responsavel: {
          organizacaoId,
        },
        estado: { not: 'CONCLUIDA' },
        dataFim: { lt: new Date() },
      },
      include: {
        responsavel: {
          select: { nome: true },
        },
      },
    });

    if (tarefasAtrasadas.length > 0) {
      insights.push({
        type: 'warning',
        title: `${tarefasAtrasadas.length} tarefas atrasadas`,
        description: `Existem tarefas pendentes que passaram da data limite`,
        parcelaIds: [], // Tarefas não têm relação direta com parcela no schema
        priority: 3,
        actions: ['Rever prioridades', 'Replanear tarefas', 'Alocar recursos'],
        explanation: 'Atrasos podem comprometer a janela ideal de execução e afetar a produtividade.',
        dataPoints: {
          numTarefas: tarefasAtrasadas.length,
          titulos: tarefasAtrasadas.map((t) => t.titulo),
        },
      });
    }

    return insights;
  }

  /**
   * Helpers
   */
  private async getLastNDVI(parcelaId: string): Promise<{ valor: number; data: Date } | null> {
    const img = await this.prisma.imagemRemota.findFirst({
      where: { parcelaId },
      orderBy: { data: 'desc' },
    });

    if (img && img.ndvi !== null) {
      return { valor: img.ndvi, data: img.data };
    }

    return null;
  }

  private async getNDVITrend(parcelaId: string) {
    const imagens = await this.prisma.imagemRemota.findMany({
      where: { parcelaId, ndvi: { not: null } },
      orderBy: { data: 'desc' },
      take: 2,
    });

    if (imagens.length < 2) return null;

    const atual = imagens[0].ndvi!;
    const anterior = imagens[1].ndvi!;
    const quedaPercentagem = ((anterior - atual) / anterior) * 100;

    return { atual, anterior, quedaPercentagem };
  }

  private interpretNDVI(valor: number): string {
    if (valor > 0.7) return 'Excelente vigor vegetativo';
    if (valor > 0.5) return 'Bom vigor vegetativo';
    if (valor > 0.3) return 'Vigor moderado';
    return 'Vigor baixo - atenção necessária';
  }

  private async getMeteoRisk(parcelaId: string): Promise<number> {
    const meteo = await this.prisma.meteoParcela.findFirst({
      where: { parcelaId },
      orderBy: { data: 'desc' },
    });

    if (!meteo) return 0;

    let risk = 0;
    if (meteo.vento && meteo.vento > 40) risk += 0.5;
    if (meteo.probChuva && meteo.probChuva > 70) risk += 0.3;

    return Math.min(risk, 1);
  }

  private async getDetailedMeteoRisk(parcelaId: string) {
    const meteo = await this.prisma.meteoParcela.findMany({
      where: { parcelaId },
      orderBy: { data: 'desc' },
      take: 3,
    });

    if (meteo.length === 0) return null;

    let score = 0;
    const issues: string[] = [];
    const actions: string[] = [];

    // Vento forte
    const maxVento = Math.max(...meteo.map((m) => m.vento || 0));
    if (maxVento > 40) {
      score += 0.4;
      issues.push(`Vento forte previsto (${maxVento} km/h)`);
      actions.push('Evitar pulverizações');
    }

    // Chuva forte
    const totalChuva = meteo.reduce((sum, m) => sum + (m.precipitacao || 0), 0);
    if (totalChuva > 30) {
      score += 0.3;
      issues.push(`Chuva acumulada elevada (${totalChuva} mm)`);
      actions.push('Adiar operações de solo');
    }

    // Probabilidade de chuva alta
    if (meteo[0].probChuva && meteo[0].probChuva > 70) {
      score += 0.2;
      issues.push('Alta probabilidade de chuva');
      actions.push('Replanear colheita');
    }

    if (score === 0) return null;

    return {
      score,
      description: issues.join('. '),
      actions,
      reasoning: 'Condições meteorológicas desfavoráveis podem comprometer a qualidade das operações.',
      data: {
        maxVento,
        totalChuva,
        probabilidadeChuva: meteo[0].probChuva,
      },
    };
  }
}
