"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import CacheManager from "@/components/cache-manager";
import ChangePasswordModal from "@/components/change-password-modal";

interface SettingsClientProps {
  session: {
    user?: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      id?: string;
    };
  } | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SettingsClient = ({ session }: SettingsClientProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-300">Gerencie suas preferências e configurações da conta.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configurações de Aparência</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Modo escuro</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Use tema escuro para melhor experiência</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={theme === 'dark'}
              >
                <span 
                  className={`${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configurações de Conta</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notificações por Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receba atualizações importantes por email</p>
              </div>
              <button
                type="button"
                className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600"
                role="switch"
                aria-checked="true"
              >
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacidade e Segurança</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Alterar Senha</h3>
              <button 
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Alterar Senha
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sessões Ativas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Gerencie onde você está logado</p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                Encerrar Todas as Sessões
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Exportar Dados</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Baixe uma cópia dos seus dados</p>
              <button className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                Exportar Dados
              </button>
            </div>
          </div>
        </div>
      </div>

      <CacheManager />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-red-200 dark:border-red-800">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4">Zona de Perigo</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-red-900 dark:text-red-400 mb-2">Excluir Conta</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                Excluir Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default SettingsClient;
