'use client'

import { useServiceWorker } from '@/hooks/useServiceWorker'
import { useUser } from '@/contexts/user-context'
import { useState, useEffect } from 'react'

export default function CacheManager() {
  const { supported, registered, active, error, clearCache } = useServiceWorker()
  const { clearCache: clearUserCache } = useUser()
  const [clearing, setClearing] = useState(false)
  const [lastCleared, setLastCleared] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [cacheSize, setCacheSize] = useState<string>('N/A')

  // Garantir que o componente só renderize no cliente
  useEffect(() => {
    setIsClient(true)
    
    // Calcular o tamanho do cache apenas no cliente
    if (typeof window !== 'undefined') {
      let size = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage.getItem(key)?.length || 0
        }
      }
      setCacheSize(`${(size / 1024).toFixed(1)} KB`)
    }
  }, [])

  // Se não estiver no cliente, renderizar um estado de carregamento
  if (!isClient) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gerenciamento de Cache
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const handleClearAllCache = async () => {
    setClearing(true)
    try {
      // Limpar cache do Service Worker
      const swCleared = await clearCache()
      
      // Limpar cache localStorage
      clearUserCache()
      
      // Limpar dados específicos do dashboard
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboard-activities');
        localStorage.removeItem('dashboard-transactions');
        localStorage.removeItem('dashboard-payments');
      }
      
      // Limpar cache do navegador (localStorage geral)
      if (typeof window !== 'undefined') {
        // Manter apenas dados essenciais, limpar cache específico
        const keysToRemove = [];
        for (const key in localStorage) {
          if (key.startsWith('user-data-') || key.startsWith('dashboard-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      setLastCleared(new Date().toLocaleString('pt-BR'))
      
      if (swCleared) {
        alert('✅ Cache limpo com sucesso! Os dados do dashboard foram redefinidos.')
      } else {
        alert('⚠️ Cache localStorage limpo, mas Service Worker não estava ativo')
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
      alert('❌ Erro ao limpar cache')
    } finally {
      setClearing(false)
    }
  }

  const handleClearDashboardData = () => {
    if (typeof window !== 'undefined') {
      const confirmReset = confirm('⚠️ Tem certeza que deseja resetar todos os dados do dashboard? Esta ação não pode ser desfeita.');
      if (confirmReset) {
        localStorage.removeItem('dashboard-activities');
        localStorage.removeItem('dashboard-transactions');
        localStorage.removeItem('dashboard-payments');
        setLastCleared(new Date().toLocaleString('pt-BR'));
        alert('✅ Dados do dashboard resetados com sucesso! Recarregue a página para ver os dados padrão.');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Gerenciamento de Cache
      </h3>
      
      <div className="space-y-4">
        {/* Status do Service Worker */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Service Worker</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Cache offline e otimização
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              supported && registered && active
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : supported
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {supported && registered && active ? 'Ativo' : supported ? 'Carregando' : 'Não Suportado'}
            </span>
          </div>
        </div>

        {/* Status do localStorage */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Cache Local</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Dados do usuário e preferências
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {cacheSize}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Ativo
            </span>
          </div>
        </div>

        {/* Cache das APIs */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Cache HTTP</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Respostas da API com revalidação
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              5 min TTL
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <div className="text-sm text-red-800 dark:text-red-200">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        )}

        {lastCleared && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <div className="text-sm text-green-800 dark:text-green-200">
              Cache limpo em: {lastCleared}
            </div>
          </div>
        )}

        {/* Botão para limpar cache */}
        <button
          onClick={handleClearAllCache}
          disabled={clearing}
          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {clearing ? 'Limpando...' : 'Limpar Todo o Cache'}
        </button>

        {/* Botão para resetar apenas dados do dashboard */}
        <button
          onClick={handleClearDashboardData}
          className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
        >
          Resetar Dados do Dashboard
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Service Worker: Cache offline para APIs e imagens</p>
          <p>• Cache Local: Dados não sensíveis para performance</p>
          <p>• Cache HTTP: Headers de cache para reduzir requisições</p>
          <p>• Dashboard: Transações, pagamentos e atividades salvas localmente</p>
        </div>
      </div>
    </div>
  )
}
