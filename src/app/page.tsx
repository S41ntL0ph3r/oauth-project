'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && status === 'authenticated') {
      router.push('/home');
    }
  }, [status, router, isClient]);

  // Evita hidration mismatch mostrando loading inicial
  if (!isClient) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Bem-vindo ao OAuth App
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Sistema completo de autenticação com NextAuth.js, verificação por email e proteção de rotas
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/sign-in" 
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            Entrar
          </Link>
          <Link 
            href="/sign-up" 
            className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
          >
            Criar Conta
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Funcionalidades disponíveis:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Email Verification
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              GitHub OAuth
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Protected Routes
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Secure Sessions
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
