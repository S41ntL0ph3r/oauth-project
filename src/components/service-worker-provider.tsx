'use client'

import { useServiceWorker } from '@/hooks/useServiceWorker'
import { useEffect } from 'react'

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { supported, registered, error, waiting } = useServiceWorker()

  useEffect(() => {
    if (registered) {
      console.log('✅ Service Worker ativo - Cache offline habilitado')
    }
    
    if (error) {
      console.warn('⚠️ Erro no Service Worker:', error)
    }

    if (waiting) {
      console.log('🔄 Nova versão do Service Worker disponível')
      // Poderia mostrar uma notificação para o usuário aqui
    }
  }, [registered, error, waiting])

  // Registra o SW apenas no cliente
  useEffect(() => {
    if (supported && !registered) {
      console.log('🚀 Registrando Service Worker...')
    }
  }, [supported, registered])

  return <>{children}</>
}
