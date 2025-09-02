"use client";

import Image from "next/image";
import { useState } from "react";

interface ProfileClientProps {
  session: {
    user?: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      id?: string;
    };
  } | null;
}

const ProfileClient = ({ session }: ProfileClientProps) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil do Usuário</h1>
            
            {/* Foto do Perfil */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="shrink-0">
                {session?.user?.image ? (
                  <div className="relative group">
                    <Image 
                      className="h-32 w-32 object-cover rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg" 
                      src={session.user.image} 
                      alt="Foto do perfil"
                      width={128}
                      height={128}
                      onClick={() => setShowImageModal(true)}
                    />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all cursor-pointer flex items-center justify-center"
                         onClick={() => setShowImageModal(true)}>
                      <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Alterar foto
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                  {session?.user?.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                  {session?.user?.name || 'Não informado'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status da Conta</label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ativa
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Método de autenticação</label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                  {session?.user?.image ? 'GitHub OAuth' : 'Email/Senha'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Membro desde</dt>
                <dd className="mt-1 text-sm text-gray-900">Janeiro 2024</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Último login</dt>
                <dd className="mt-1 text-sm text-gray-900">Agora</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nível de acesso</dt>
                <dd className="mt-1 text-sm text-gray-900">Usuário padrão</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status da segurança</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verificado
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Modal de Zoom da Imagem */}
      {showImageModal && session?.user?.image && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-2xl max-h-full">
            <Image
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              src={session.user.image}
              alt="Foto do perfil - Zoom"
              width={500}
              height={500}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
              onClick={() => setShowImageModal(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileClient;
