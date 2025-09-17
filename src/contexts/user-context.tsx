"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import useLocalStorage from '@/hooks/useLocalStorage';

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => void;
  clearCache: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Cache localStorage para dados não sensíveis
  const [, setCachedUserPreferences] = useLocalStorage('user-preferences', {
    lastVisit: null as string | null,
    theme: 'system',
    language: 'pt-BR'
  });

  // Garantir que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isClient || !session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const { user } = await response.json();
        setUserData(user);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setLoading(false);
    }
  }, [session?.user?.id, isClient]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => {
      const updated = prev ? { ...prev, ...data } : null;
      
      // Atualizar cache localStorage
      if (updated && session?.user?.id && isClient && typeof window !== 'undefined') {
        const cacheKey = `user-data-${session.user.id}`;
        const cacheData = {
          data: {
            id: updated.id,
            name: updated.name,
            image: updated.image,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            emailVerified: updated.emailVerified
          },
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
      
      return updated;
    });
  };

  const clearCache = () => {
    if (isClient && typeof window !== 'undefined' && session?.user?.id) {
      const cacheKey = `user-data-${session.user.id}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem('user-preferences');
    }
  };

  // Atualizar último acesso apenas quando o usuário muda
  useEffect(() => {
    if (session?.user?.id) {
      // Usar setTimeout para evitar atualizações em loop
      const timer = setTimeout(() => {
        setCachedUserPreferences(prev => ({
          ...prev,
          lastVisit: new Date().toISOString()
        }));
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [session?.user?.id, setCachedUserPreferences]);

  // Separar o efeito que chama refreshUser para evitar loops
  useEffect(() => {
    if (!isClient) return;
    
    // Só executar quando o session.user.id muda
    if (session?.user?.id) {
      const userId = session.user.id; // Capturar o ID para evitar problemas de tipo
      
      // Mover fetchUserDataFromAPI para dentro do effect para evitar dependências problemáticas
      const fetchUserDataFromAPI = async (userId: string) => {
        const response = await fetch('/api/user/profile', {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const { user } = await response.json();
          setUserData(user);
          
          // Salvar no localStorage (apenas dados não sensíveis)
          if (isClient && typeof window !== 'undefined') {
            const cacheKey = `user-data-${userId}`;
            const cacheData = {
              data: {
                id: user.id,
                name: user.name,
                image: user.image,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                emailVerified: user.emailVerified
              },
              timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          }
        }
        setLoading(false);
      };
      
      // Usar uma função inline para evitar dependências problemáticas
      const loadUserData = async () => {
        setLoading(true);
        
        // Tentar cache localStorage primeiro
        const cacheKey = `user-data-${userId}`;
        const cachedData = isClient && typeof window !== 'undefined' ? 
          localStorage.getItem(cacheKey) : null;
        
        if (cachedData) {
          try {
            const { data: cached, timestamp } = JSON.parse(cachedData);
            const isRecent = Date.now() - timestamp < 5 * 60 * 1000;
            
            if (isRecent && cached) {
              setUserData(cached);
              setLoading(false);
              
              // Buscar dados frescos em background
              fetchUserDataFromAPI(userId).catch(console.warn);
              return;
            }
          } catch (error) {
            console.warn('Erro ao ler cache:', error);
          }
        }
        
        // Buscar dados do servidor
        await fetchUserDataFromAPI(userId).catch((error) => {
          console.error('Erro ao buscar dados do usuário:', error);
          setLoading(false);
        });
      };
      
      loadUserData();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [session?.user?.id, isClient]); // Adicionar isClient como dependência

  return (
    <UserContext.Provider value={{ 
      userData, 
      loading, 
      refreshUser, 
      updateUserData, 
      clearCache 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};
