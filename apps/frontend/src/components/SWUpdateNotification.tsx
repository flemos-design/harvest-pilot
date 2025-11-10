'use client';

import { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

export default function SWUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Escutar por updates do Service Worker
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Novo Service Worker instalado e há um antigo ativo
                setShowUpdate(true);
                setRegistration(reg);
              }
            });
          }
        });

        // Verificar se já há uma atualização waiting
        if (reg.waiting) {
          setShowUpdate(true);
          setRegistration(reg);
        }
      });

      // Escutar mensagens do SW (controllerchange)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Enviar mensagem SKIP_WAITING ao SW
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Nova versão disponível
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Uma atualização do HarvestPilot está pronta. Recarrega para obter as últimas funcionalidades.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition"
              >
                Atualizar agora
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition"
              >
                Mais tarde
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
