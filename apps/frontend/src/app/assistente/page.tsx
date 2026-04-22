'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useChat, useInsights, useCriticalParcelas,
  useConversas, useConversa, useCreateConversa,
  useDeleteConversa, useUpdateConversa,
} from '@/hooks/use-ia';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import {
  Send, Loader2, Lightbulb, AlertTriangle, TrendingDown, Brain,
  Plus, MessageSquare, Trash2, Edit3, X, Check, Clock,
} from 'lucide-react';
import type { ChatResponse, Insight } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  response?: ChatResponse;
}

export default function AssistentePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeConversaId, setActiveConversaId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: organizacoes } = useOrganizacoes();
  const orgId = organizacoes?.[0]?.id || '';

  const chatMutation = useChat();
  const { data: insights, isLoading: loadingInsights } = useInsights(orgId);
  const { data: criticalParcelas, isLoading: loadingCritical } = useCriticalParcelas(orgId);
  const { data: conversas, isLoading: loadingConversas } = useConversas(orgId);
  const { data: conversaData } = useConversa(activeConversaId || '');
  const createConversa = useCreateConversa();
  const deleteConversa = useDeleteConversa();
  const updateConversa = useUpdateConversa();

  // Load messages when a conversation is selected
  useEffect(() => {
    if (conversaData?.mensagens) {
      const loaded: Message[] = conversaData.mensagens.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      setMessages(loaded);
    } else if (!activeConversaId) {
      setMessages([]);
    }
  }, [conversaData, activeConversaId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleNewConversa = async () => {
    if (!orgId) return;
    setActiveConversaId(null);
    setMessages([]);
  };

  const handleSelectConversa = (id: string) => {
    setActiveConversaId(id);
  };

  const handleDeleteConversa = async (id: string) => {
    if (!orgId || !confirm('Tens a certeza que queres apagar esta conversa?')) return;
    await deleteConversa.mutateAsync({ id, organizacaoId: orgId });
    if (activeConversaId === id) {
      setActiveConversaId(null);
      setMessages([]);
    }
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveEdit = async (id: string) => {
    if (!orgId || !editingTitle.trim()) return;
    await updateConversa.mutateAsync({ id, titulo: editingTitle.trim(), organizacaoId: orgId });
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSend = async () => {
    if (!input.trim() || !orgId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chatMutation.mutateAsync({
        message: input,
        organizacaoId: orgId,
        conversaId: activeConversaId || undefined,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If a new conversation was created, set it as active
      if (response.conversaId && !activeConversaId) {
        setActiveConversaId(response.conversaId);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Erro ao comunicar com o assistente. Verifica se a chave OpenAI está configurada no backend.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      default: return <TrendingDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'recommendation': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* ===== SIDEBAR DE CONVERSAS ===== */}
      <aside className="w-72 bg-white dark:bg-gray-800 border-r flex flex-col hidden lg:flex">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-6 h-6 text-green-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Assistente IA</h2>
          </div>
          <button
            onClick={handleNewConversa}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Conversa
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : conversas && conversas.length > 0 ? (
            conversas.map((conversa) => (
              <div
                key={conversa.id}
                className={`group relative rounded-lg transition ${
                  activeConversaId === conversa.id
                    ? 'bg-green-50 border border-green-200'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 border border-transparent'
                }`}
              >
                {editingId === conversa.id ? (
                  <div className="p-2 flex items-center gap-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(conversa.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 text-sm px-2 py-1 border rounded"
                    />
                    <button onClick={() => saveEdit(conversa.id)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectConversa(conversa.id)}
                    className="w-full text-left p-3 pr-10"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{conversa.titulo}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {format(new Date(conversa.updatedAt), 'd MMM, HH:mm', { locale: pt })}
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {editingId !== conversa.id && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditing(conversa.id, conversa.titulo); }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteConversa(conversa.id); }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Sem conversas ainda</p>
            </div>
          )}
        </div>
      </aside>

      {/* ===== ÁREA PRINCIPAL ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="bg-white dark:bg-gray-800 border-b lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-green-600" />
              <h1 className="font-semibold text-gray-900 dark:text-gray-100">Assistente IA</h1>
            </div>
            <button
              onClick={handleNewConversa}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Nova
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)]">
            {/* Chat header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {activeConversaId
                    ? conversas?.find((c) => c.id === activeConversaId)?.titulo || 'Conversa'
                    : 'Nova Conversa'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeConversaId
                    ? 'Continua a conversa com o assistente'
                    : 'Experimenta: "O que fazer hoje?" ou "Quais as parcelas mais críticas?"'}
                </p>
              </div>
              {activeConversaId && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {conversas?.find((c) => c.id === activeConversaId)
                    ? format(new Date(conversas.find((c) => c.id === activeConversaId)!.updatedAt), 'd MMM, HH:mm', { locale: pt })
                    : ''}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Envia uma mensagem para começar</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['O que fazer hoje?', 'Quais as parcelas mais críticas?', 'Previsão do tempo?', 'Stock de insumos'].map((sug) => (
                      <button
                        key={sug}
                        onClick={() => setInput(sug)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-full text-sm text-gray-700 dark:text-gray-300 transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
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
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600 dark:text-gray-400">A pensar...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escreve a tua pergunta..."
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
        </main>

        {/* Insights & Critical - Bottom on mobile, right sidebar on desktop */}
        <div className="container mx-auto px-4 pb-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Terrenos Críticos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Terrenos Críticos
              </h3>
              {loadingCritical ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : criticalParcelas && criticalParcelas.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {criticalParcelas.map((item, i) => (
                    <div key={i} className="p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.nome}</span>
                        <span className="text-sm font-bold text-red-600">{item.score.toFixed(0)}%</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.reasons.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum terreno crítico</p>
              )}
            </div>

            {/* Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Insights Automáticos
              </h3>
              {loadingInsights ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : insights && insights.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {insights.slice(0, 3).map((insight, i) => (
                    <div key={i} className={`p-2 border rounded-lg ${getInsightBg(insight.type)}`}>
                      <div className="flex items-start gap-2">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{insight.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum insight disponível</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
