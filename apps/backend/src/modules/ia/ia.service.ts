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
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dto.message },
        ],
        temperature: 0.7,
        max_tokens: 2000, // Aumentado para respostas mais completas
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
   * Obter top 3 terrenos críticos
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
   * Acesso completo a TODOS os dados da plataforma da organização
   */
  private async buildContext(organizacaoId: string, parcelaId?: string) {
    const context: any = {
      sources: [],
      data: {},
    };

    try {
      // 1. ORGANIZAÇÃO - Dados gerais
      const org = await this.prisma.organizacao.findUnique({
        where: { id: organizacaoId },
        include: {
          propriedades: {
            include: {
              parcelas: {
                include: {
                  culturas: {
                    include: {
                      ciclos: {
                        orderBy: { createdAt: 'desc' },
                      },
                    },
                  },
                },
              },
            },
          },
          utilizadores: {
            select: {
              nome: true,
              papel: true,
            },
          },
        },
      });

      if (org) {
        const totalParcelas = org.propriedades.reduce((sum, p) => sum + p.parcelas.length, 0);
        const totalAreaHa = org.propriedades.reduce(
          (sum, p) => sum + p.parcelas.reduce((s, pa) => s + pa.area, 0),
          0,
        );

        context.data.organizacao = {
          nome: org.nome,
          numPropriedades: org.propriedades.length,
          numParcelas: totalParcelas,
          areaTotal: totalAreaHa,
          numUtilizadores: org.utilizadores.length,
          propriedades: org.propriedades.map((prop) => ({
            nome: prop.nome,
            numParcelas: prop.parcelas.length,
            areaTotal: prop.parcelas.reduce((sum, p) => sum + p.area, 0),
            parcelas: prop.parcelas.map((p) => ({
              nome: p.nome,
              area: p.area,
              tipoSolo: p.tipoSolo,
              cultura: p.culturas[0]?.especie || 'Sem cultura',
              variedade: p.culturas[0]?.variedade,
              cicloAtivo: p.culturas[0]?.ciclos.find((c) => c.estado === 'ATIVO')?.epoca,
            })),
          })),
        };
        context.sources.push('Organização completa');
      }

      // 2. PARCELA ESPECÍFICA - Detalhes completos
      if (parcelaId) {
        const parcela = await this.prisma.parcela.findUnique({
          where: { id: parcelaId },
          include: {
            propriedade: true,
            culturas: {
              include: {
                ciclos: {
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
            operacoes: {
              orderBy: { data: 'desc' },
              include: {
                operador: {
                  select: { nome: true },
                },
              },
            },
            imagensRemotas: {
              orderBy: { data: 'desc' },
              take: 10,
            },
            meteo: {
              orderBy: { data: 'desc' },
              take: 14,
            },
          },
        });

        if (parcela) {
          const culturaAtiva = parcela.culturas.find((c) =>
            c.ciclos.some((ci) => ci.estado === 'ATIVO'),
          );
          const cicloAtivo = culturaAtiva?.ciclos.find((c) => c.estado === 'ATIVO');

          context.data.parcela = {
            nome: parcela.nome,
            area: parcela.area,
            altitude: parcela.altitude,
            tipoSolo: parcela.tipoSolo,
            propriedade: parcela.propriedade.nome,
            cultura: {
              especie: culturaAtiva?.especie || 'Sem cultura',
              variedade: culturaAtiva?.variedade,
              finalidade: culturaAtiva?.finalidade,
              cicloAtual: cicloAtivo?.epoca,
              dataInicioCiclo: cicloAtivo?.dataInicio,
            },
            operacoes: parcela.operacoes.map((op) => ({
              tipo: op.tipo,
              data: op.data,
              descricao: op.descricao,
              operador: op.operador.nome,
              insumos: op.insumos,
              custoTotal: op.custoTotal,
            })),
            ndvi: parcela.imagensRemotas
              .filter((img) => img.ndvi !== null)
              .map((img) => ({
                data: img.data,
                valor: img.ndvi,
                nuvens: img.nuvens,
              })),
            meteo: parcela.meteo.map((m) => ({
              data: m.data,
              temp: m.temperatura,
              precipitacao: m.precipitacao,
              vento: m.vento,
              probChuva: m.probChuva,
            })),
          };
          context.sources.push('Parcela completa (histórico total)');
        }
      }

      // 3. TODAS AS OPERAÇÕES RECENTES (últimos 30 dias)
      const operacoesRecentes = await this.prisma.operacao.findMany({
        where: {
          parcela: {
            propriedade: {
              organizacaoId,
            },
          },
          data: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          parcela: { select: { nome: true } },
          operador: { select: { nome: true } },
        },
        orderBy: { data: 'desc' },
      });

      if (operacoesRecentes.length > 0) {
        context.data.operacoesRecentes = operacoesRecentes.map((op) => ({
          parcela: op.parcela.nome,
          tipo: op.tipo,
          data: op.data,
          operador: op.operador.nome,
          custoTotal: op.custoTotal,
        }));
        context.sources.push('Operações recentes (30 dias)');
      }

      // 4. TODAS AS TAREFAS (pendentes, em curso, atrasadas)
      const tarefas = await this.prisma.tarefa.findMany({
        where: {
          responsavel: {
            organizacaoId,
          },
        },
        include: {
          responsavel: {
            select: { nome: true },
          },
        },
        orderBy: { dataInicio: 'asc' },
      });

      const tarefasPendentes = tarefas.filter((t) => t.estado === 'PLANEADA');
      const tarefasEmCurso = tarefas.filter((t) => t.estado === 'EM_CURSO');
      const tarefasAtrasadas = tarefas.filter(
        (t) => t.estado !== 'CONCLUIDA' && t.dataFim && t.dataFim < new Date(),
      );

      if (tarefas.length > 0) {
        context.data.tarefas = {
          total: tarefas.length,
          pendentes: tarefasPendentes.map((t) => ({
            titulo: t.titulo,
            tipo: t.tipo,
            prioridade: t.prioridade,
            responsavel: t.responsavel?.nome,
            dataInicio: t.dataInicio,
            dataFim: t.dataFim,
          })),
          emCurso: tarefasEmCurso.map((t) => ({
            titulo: t.titulo,
            tipo: t.tipo,
            responsavel: t.responsavel?.nome,
          })),
          atrasadas: tarefasAtrasadas.map((t) => ({
            titulo: t.titulo,
            tipo: t.tipo,
            prioridade: t.prioridade,
            diasAtraso: Math.floor(
              (Date.now() - t.dataFim!.getTime()) / (1000 * 60 * 60 * 24),
            ),
          })),
        };
        context.sources.push('Todas as tarefas');
      }

      // 5. INVENTÁRIO DE INSUMOS
      const insumos = await this.prisma.insumo.findMany({
        orderBy: { nome: 'asc' },
      });

      if (insumos.length > 0) {
        const insumosAbaixoMinimo = insumos.filter(
          (i) => i.stockMinimo && i.stock < i.stockMinimo,
        );
        const insumosVencidos = insumos.filter((i) => i.validade && i.validade < new Date());

        context.data.insumos = {
          total: insumos.length,
          categorias: {
            fertilizantes: insumos.filter((i) => i.categoria === 'FERTILIZANTE').length,
            fitofarmacos: insumos.filter((i) => i.categoria === 'FITOFARMACO').length,
            sementes: insumos.filter((i) => i.categoria === 'SEMENTE').length,
            outros: insumos.filter((i) => i.categoria === 'OUTRO').length,
          },
          alertas: {
            abaixoStockMinimo: insumosAbaixoMinimo.map((i) => ({
              nome: i.nome,
              stock: i.stock,
              stockMinimo: i.stockMinimo,
            })),
            vencidos: insumosVencidos.map((i) => ({
              nome: i.nome,
              validade: i.validade,
            })),
          },
          lista: insumos.map((i) => ({
            nome: i.nome,
            categoria: i.categoria,
            stock: i.stock,
            unidade: i.unidade,
            validade: i.validade,
          })),
        };
        context.sources.push('Inventário completo de insumos');
      }

      // 6. CALENDÁRIO AGRÍCOLA - Regras e janelas ideais
      const calendarioRegras = await this.prisma.calendarioRegra.findMany({
        orderBy: [{ cultura: 'asc' }, { mesInicio: 'asc' }],
      });

      if (calendarioRegras.length > 0) {
        const mesAtual = new Date().getMonth() + 1;
        const regrasAtuais = calendarioRegras.filter(
          (r) => r.mesInicio <= mesAtual && r.mesFim >= mesAtual,
        );

        context.data.calendario = {
          totalRegras: calendarioRegras.length,
          operacoesRecomendadasAgora: regrasAtuais.map((r) => ({
            cultura: r.cultura,
            variedade: r.variedade,
            operacao: r.tipoOperacao,
            mesInicio: r.mesInicio,
            mesFim: r.mesFim,
            restricoes: {
              ventoMax: r.ventoMax,
              chuvaMax: r.chuvaMax,
            },
          })),
          todasRegras: calendarioRegras.map((r) => ({
            cultura: r.cultura,
            operacao: r.tipoOperacao,
            periodo: `${r.mesInicio}-${r.mesFim}`,
          })),
        };
        context.sources.push('Calendário agrícola completo');
      }

      // 7. METEOROLOGIA GLOBAL - Previsões para todas as parcelas
      if (org) {
        const meteoRecente = await this.prisma.meteoParcela.findMany({
          where: {
            parcela: {
              propriedade: {
                organizacaoId,
              },
            },
            data: {
              gte: new Date(), // Apenas previsões futuras
            },
          },
          include: {
            parcela: {
              select: { nome: true },
            },
          },
          orderBy: { data: 'asc' },
          take: 50, // Próximos dias para várias parcelas
        });

        if (meteoRecente.length > 0) {
          // Agrupar por parcela
          const meteoGrouped: Record<string, any[]> = {};
          meteoRecente.forEach((m) => {
            if (!meteoGrouped[m.parcela.nome]) {
              meteoGrouped[m.parcela.nome] = [];
            }
            meteoGrouped[m.parcela.nome].push({
              data: m.data,
              temp: m.temperatura,
              tempMin: m.tempMin,
              tempMax: m.tempMax,
              precipitacao: m.precipitacao,
              probChuva: m.probChuva,
              vento: m.vento,
              humidade: m.humidade,
            });
          });

          context.data.previsaoMeteorologica = {
            parcelas: meteoGrouped,
            proximosDias: Object.values(meteoGrouped)[0]?.slice(0, 7) || [], // Próximos 7 dias
            resumo: {
              totalPrevisoes: meteoRecente.length,
              dataInicio: meteoRecente[0]?.data,
              dataFim: meteoRecente[meteoRecente.length - 1]?.data,
            },
          };
          context.sources.push('Previsões meteorológicas (próximos dias)');
        }

        // Meteorologia histórica recente (últimos 7 dias)
        const meteoHistorico = await this.prisma.meteoParcela.findMany({
          where: {
            parcela: {
              propriedade: {
                organizacaoId,
              },
            },
            data: {
              lt: new Date(),
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { data: 'desc' },
          take: 30,
        });

        if (meteoHistorico.length > 0) {
          const tempMedia = meteoHistorico.reduce((sum, m) => sum + (m.temperatura || 0), 0) / meteoHistorico.length;
          const precipTotal = meteoHistorico.reduce((sum, m) => sum + (m.precipitacao || 0), 0);
          const ventoMax = Math.max(...meteoHistorico.map((m) => m.vento || 0));

          context.data.meteorologiaRecente = {
            ultimos7Dias: {
              temperaturaMedia: tempMedia,
              precipitacaoTotal: precipTotal,
              ventoMaximo: ventoMax,
            },
          };
          context.sources.push('Histórico meteorológico (7 dias)');
        }
      }

      // 8. ESTATÍSTICAS GLOBAIS DE NDVI
      if (org) {
        const todasImagens = await this.prisma.imagemRemota.findMany({
          where: {
            parcela: {
              propriedade: {
                organizacaoId,
              },
            },
            ndvi: { not: null },
          },
          orderBy: { data: 'desc' },
          take: 100,
        });

        if (todasImagens.length > 0) {
          const ndviMedio = todasImagens.reduce((sum, img) => sum + (img.ndvi || 0), 0) / todasImagens.length;
          context.data.estatisticasNDVI = {
            numImagens: todasImagens.length,
            ndviMedio,
            interpretacao: this.interpretNDVI(ndviMedio),
          };
          context.sources.push('Estatísticas de vigor vegetativo');
        }
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
    const fontesDados = context.sources.join(', ');

    return `És um assistente agrícola especializado para a plataforma HarvestPilot.

**ACESSO COMPLETO À PLATAFORMA**
Tens acesso a TODOS os dados da conta do utilizador, incluindo:
${fontesDados}

**IMPORTANTE SOBRE METEOROLOGIA:**
- Tens acesso DIRETO a previsões meteorológicas das parcelas
- Os dados estão em context.data.previsaoMeteorologica (próximos dias)
- Os dados estão em context.data.meteorologiaRecente (últimos 7 dias)
- NUNCA digas que não tens acesso a meteorologia - TU TENS!
- Usa SEMPRE os dados meteorológicos disponíveis para responder sobre o tempo

**Contexto atual:**
${JSON.stringify(context.data, null, 2)}

**Instruções:**
- Responde em português de Portugal de forma clara, prática e objetiva
- Foca em ações concretas que o agricultor pode tomar
- Usa ATIVAMENTE os dados fornecidos para fundamentar as tuas recomendações
- Cruza informação de múltiplos módulos (insumos, meteorologia, NDVI, operações, tarefas)
- NUNCA digas que não tens acesso a dados - verifica SEMPRE o contexto primeiro
- Se faltarem dados específicos no contexto, diz "não tenho essa informação disponível no momento"
- Prioriza a segurança das culturas e a otimização de recursos
- Explica o "porquê" das tuas sugestões com base nos dados
- Dá prioridade a alertas críticos (insumos vencidos, stock baixo, tarefas atrasadas, NDVI em queda)

**Expertise completa:**
- Culturas: Castanheiro, Cerejeira, Nogueira, Aveleira (fruto e madeira)
- Fenologia e ciclos de cultivo
- Índices de vegetação (NDVI, NDRE, EVI) e interpretação
- Meteorologia e janelas de aplicação
- Calendário agrícola (plantação, colheita, podas, tratamentos, adubações)
- Gestão de insumos (fertilizantes, fitofármacos, sementes)
- Operações de campo e boas práticas
- Gestão de tarefas e priorização
- Análise de custos e eficiência

**Capacidades:**
- Analisar todas as parcelas da organização e identificar prioridades
- Sugerir operações baseadas no calendário agrícola e condições meteorológicas
- Alertar sobre insumos em falta, vencidos ou abaixo do stock mínimo
- Identificar tarefas atrasadas e recomendar replanejamento
- Interpretar tendências de NDVI e correlacionar com operações
- Cruzar dados de meteorologia com janelas ideais de operação

Responde à pergunta do utilizador de forma útil, detalhada e baseada nos dados COMPLETOS da plataforma.`;
  }

  /**
   * Calcular confiança da resposta baseada na riqueza de dados disponíveis
   */
  private calculateConfidence(context: any, answer: string): number {
    let confidence = 0.4; // Base aumentado (mais dados = maior confiança mínima)

    // Dados da organização completos
    if (context.data.organizacao) confidence += 0.1;

    // Dados de parcela específica
    if (context.data.parcela) {
      confidence += 0.15;
      if (context.data.parcela.operacoes?.length > 0) confidence += 0.05;
      if (context.data.parcela.ndvi?.length > 0) confidence += 0.05;
      if (context.data.parcela.meteo?.length > 0) confidence += 0.05;
    }

    // Dados de insumos
    if (context.data.insumos) confidence += 0.05;

    // Calendário agrícola
    if (context.data.calendario) confidence += 0.05;

    // Tarefas
    if (context.data.tarefas) confidence += 0.05;

    // Operações recentes
    if (context.data.operacoesRecentes) confidence += 0.05;

    // Estatísticas NDVI globais
    if (context.data.estatisticasNDVI) confidence += 0.05;

    // Previsões meteorológicas
    if (context.data.previsaoMeteorologica) confidence += 0.05;

    // Meteorologia recente
    if (context.data.meteorologiaRecente) confidence += 0.05;

    // Bónus por número de fontes de dados (máx +0.15)
    confidence += Math.min(context.sources.length * 0.03, 0.15);

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
