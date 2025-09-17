'use client';

import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/user-context";
import AvatarUpload from "@/components/ui/avatar-upload";

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

const ProfileClient = ({ session: initialSession }: ProfileClientProps) => {
  const { data: session } = useSession();
  const { userData, refreshUser } = useUser();
  const currentSession = session || initialSession;
  
  // Usar dados atualizados do banco quando disponíveis
  // Priorizar imagem do banco, senão usar do GitHub
  const displayData = {
    ...userData,
    image: userData?.image || currentSession?.user?.image // Priorizar imagem custom
  };

  // Callback para quando o upload for bem-sucedido
  const handleUploadSuccess = async () => {
    // Atualizar contexto do usuário
    await refreshUser();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Perfil do Usuário</h1>
          
          {/* Foto do Perfil */}
          <div className="flex items-center space-x-8 mb-8">
            <div className="shrink-0">
              <AvatarUpload 
                currentImage={userData?.image}
                fallbackImage={currentSession?.user?.image}
                onUploadSuccess={handleUploadSuccess}
                size={200}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Foto do Perfil
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Clique na foto para alterar ou carregar uma nova imagem
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                {displayData?.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
              <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                {displayData?.name || 'Não informado'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status da Conta</label>
              <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Ativa
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Método de autenticação</label>
              <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                GitHub OAuth
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Adicionais</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Membro desde</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('pt-BR') : 'Carregando...'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Última atualização</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('pt-BR') : 'Carregando...'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email verificado</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userData?.emailVerified 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}>
                  {userData?.emailVerified ? 'Verificado' : 'Pendente'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status da segurança</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Protegido
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;
