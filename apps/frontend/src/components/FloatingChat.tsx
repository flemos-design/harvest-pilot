'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-ia';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { Send, Loader2, X, Minimize2 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: string[];
}

const CHAT_STORAGE_KEY = 'moranguinha-chat-messages';
const CHAT_TIMESTAMP_KEY = 'moranguinha-chat-timestamp';
const CHAT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatExpiresAt, setChatExpiresAt] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: organizacoes } = useOrganizacoes();
  const orgId = organizacoes?.[0]?.id || '';

  const chatMutation = useChat();

  // Calcular tempo restante até expiração
  const getTimeUntilExpiry = () => {
    if (!chatExpiresAt) return null;
    const now = Date.now();
    const remaining = chatExpiresAt - now;

    if (remaining <= 0) return 'Expirado';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `Conversa guardada por ${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `Conversa guardada por ${minutes}m`;
  };

  // Carregar mensagens do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      const storedTimestamp = localStorage.getItem(CHAT_TIMESTAMP_KEY);

      if (storedMessages && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp, 10);
        const now = Date.now();
        const expiresAt = timestamp + CHAT_EXPIRY_MS;

        // Verificar se passaram 24 horas
        if (now < expiresAt) {
          // Restaurar mensagens
          setMessages(JSON.parse(storedMessages));
          setChatExpiresAt(expiresAt);
        } else {
          // Limpar mensagens expiradas
          localStorage.removeItem(CHAT_STORAGE_KEY);
          localStorage.removeItem(CHAT_TIMESTAMP_KEY);
          setChatExpiresAt(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do chat:', error);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem(CHAT_TIMESTAMP_KEY);
      setChatExpiresAt(null);
    }
  }, []);

  // Guardar mensagens no localStorage sempre que mudarem
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const now = Date.now();
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        localStorage.setItem(CHAT_TIMESTAMP_KEY, now.toString());
        setChatExpiresAt(now + CHAT_EXPIRY_MS);
      } catch (error) {
        console.error('Erro ao guardar histórico do chat:', error);
      }
    }
  }, [messages]);

  // Mensagem de boas-vindas automática (só se não houver histórico)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Olá, sou a Moranguinha, a tua assistente de IA! 🍓\n\nPosso ajudar-te com:\n• Análise das tuas parcelas e culturas\n• Recomendações de operações\n• Alertas sobre insumos e tarefas\n• Previsões meteorológicas\n• Interpretação de NDVI\n\nO que gostarias de saber?',
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !orgId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chatMutation.mutateAsync({
        message: input,
        organizacaoId: orgId,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        confidence: response.confidence,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Ups! Tive um problema a processar o teu pedido. Verifica se a chave OpenAI está configurada.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 z-50 overflow-hidden border-4 border-white"
        aria-label="Abrir chat com a Moranguinha"
      >
        <Image
          src="/moranguinha.png"
          alt="Moranguinha - Assistente IA"
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            <Image
              src="/moranguinha.png"
              alt="Moranguinha"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Moranguinha</h3>
            <p className="text-xs text-green-100">Assistente IA • Online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
            aria-label="Minimizar chat"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMessages([]);
              localStorage.removeItem(CHAT_STORAGE_KEY);
              localStorage.removeItem(CHAT_TIMESTAMP_KEY);
              setChatExpiresAt(null);
              setIsOpen(false);
            }}
            className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
            aria-label="Fechar e limpar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

              {msg.role === 'assistant' && msg.confidence && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
                  <span>Confiança: {(msg.confidence * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span className="text-sm text-gray-600">A pensar...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreve a tua pergunta..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            disabled={!orgId || chatMutation.isPending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending || !orgId}
            className="px-4 py-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center space-y-0.5">
          <p>Tenho acesso a todos os dados da tua conta</p>
          {chatExpiresAt && (
            <p className="text-green-600 font-medium">{getTimeUntilExpiry()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
