'use client'

import { useEffect, useState } from 'react'

interface SwStatus {
  supported: boolean
  registered: boolean
  installing: boolean
  waiting: boolean
  active: boolean
  error: string | null
}

export function useServiceWorker() {
  const [status, setStatus] = useState<SwStatus>({
    supported: false,
    registered: false,
    installing: false,
    waiting: false,
    active: false,
    error: null
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    if ('serviceWorker' in navigator) {
      setStatus(prev => ({ ...prev, supported: true }))

      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration.scope)
          
          setStatus(prev => ({ 
            ...prev, 
            registered: true,
            installing: !!registration.installing,
            waiting: !!registration.waiting,
            active: !!registration.active
          }))

          // Escutar mudanças no Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              setStatus(prev => ({ ...prev, installing: true }))
              
              newWorker.addEventListener('statechange', () => {
                switch (newWorker.state) {
                  case 'installed':
                    if (navigator.serviceWorker.controller) {
                      // Novo SW disponível
                      setStatus(prev => ({ ...prev, waiting: true, installing: false }))
                    } else {
                      // SW instalado pela primeira vez
                      setStatus(prev => ({ ...prev, active: true, installing: false }))
                    }
                    break
                  case 'activated':
                    setStatus(prev => ({ ...prev, active: true, waiting: false }))
                    break
                }
              })
            }
          })
        })
        .catch(error => {
          console.error('Erro ao registrar Service Worker:', error)
          setStatus(prev => ({ ...prev, error: error.message }))
        })
    }
  }, [isClient])

  const clearCache = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller) {
        resolve(false)
        return
      }

      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success)
      }

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  return {
    ...status,
    clearCache,
    updateServiceWorker
  }
}
