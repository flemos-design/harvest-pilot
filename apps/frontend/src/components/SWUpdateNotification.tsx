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
      let refreshing = false;

      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };

      // Escutar mensagens do SW (controllerchange)
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Escutar por updates do Service Worker
      navigator.serviceWorker.ready.then((reg) => {
        const handleUpdateFound = () => {
          const newWorker = reg.installing;
          if (newWorker) {
            const handleStateChange = () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
                setRegistration(reg);
              }
            };
            newWorker.addEventListener('statechange', handleStateChange);
          }
        };

        reg.addEventListener('updatefound', handleUpdateFound);

        // Verificar se já há uma atualização waiting
        if (reg.waiting) {
          setShowUpdate(true);
          setRegistration(reg);
        }
      });

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Nova versão disponível
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 transition"
              >
                Mais tarde
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-400 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
