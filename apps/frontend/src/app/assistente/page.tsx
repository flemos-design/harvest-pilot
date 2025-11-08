'use client';

import { useState } from 'react';
import { useChat, useInsights, useCriticalParcelas } from '@/hooks/use-ia';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { Send, Loader2, Lightbulb, AlertTriangle, TrendingDown, Brain } from 'lucide-react';
import type { ChatResponse, Insight } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  response?: ChatResponse;
}

export default function AssistentePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const { data: organizacoes } = useOrganizacoes();
  const orgId = organizacoes?.[0]?.id || '';

  const chatMutation = useChat();
  const { data: insights, isLoading: loadingInsights } = useInsights(orgId);
  const { data: criticalParcelas, isLoading: loadingCritical } = useCriticalParcelas(orgId);

  const handleSend = async () => {
    if (!input.trim() || !orgId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chatMutation.mutateAsync({
        message: input,
        organizacaoId: orgId,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Erro ao comunicar com o assistente. Verifique se a chave OpenAI está configurada no backend.',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      default: return <TrendingDown className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'recommendation': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assistente Agrícola IA</h1>
              <p className="text-gray-600 mt-1">Perguntas, insights e recomendações inteligentes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Chat com Assistente</h2>
              <p className="text-sm text-gray-600">Experimente: "O que fazer hoje?" ou "Quais as parcelas mais críticas?"</p>
            </div>

            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Envie uma mensagem para começar</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.response && (
                      <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                        <div className="flex items-center gap-2 text-xs opacity-75">
                          <span>Confiança: {(msg.response.confidence * 100).toFixed(0)}%</span>
                        </div>
                        {msg.response.sources.length > 0 && (
                          <div className="text-xs opacity-75">
                            <strong>Fontes:</strong> {msg.response.sources.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600">A pensar...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escreva a sua pergunta..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!orgId}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending || !orgId}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Insights & Critical */}
          <div className="space-y-6">
            {/* Terrenos Críticos */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Terrenos Críticos
              </h3>
              {loadingCritical ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : criticalParcelas && criticalParcelas.length > 0 ? (
                <div className="space-y-3">
                  {criticalParcelas.map((item, i) => (
                    <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.parcela.nome}</span>
                        <span className="text-sm font-bold text-red-600">{item.score.toFixed(0)}%</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {item.reasons.map((reason, j) => (
                          <div key={j}>• {reason}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum terreno crítico</p>
              )}
            </div>

            {/* Insights */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Insights Automáticos
              </h3>
              {loadingInsights ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : insights && insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.slice(0, 5).map((insight, i) => (
                    <div key={i} className={`p-3 border rounded-lg ${getInsightBg(insight.type)}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                      {insight.actions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-700">
                          <strong>Ações:</strong>
                          <ul className="mt-1 space-y-1">
                            {insight.actions.map((action, j) => (
                              <li key={j}>• {action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum insight disponível</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
