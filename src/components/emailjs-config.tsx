"use client";

import { useState } from "react";
import emailjs from '@emailjs/browser';
import { APP_CONFIG } from '../lib/app-config';

const EmailJSConfig = () => {
  const [serviceId, setServiceId] = useState("");
  const [resetTemplateId, setResetTemplateId] = useState("");
  const [verifyTemplateId, setVerifyTemplateId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testType, setTestType] = useState<'reset' | 'verify'>('reset');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Inicializar EmailJS com a chave pública
      emailjs.init(publicKey);

      const templateId = testType === 'reset' ? resetTemplateId : verifyTemplateId;

      if (!templateId) {
        setMessage(`❌ Template ID para ${testType === 'reset' ? 'reset de senha' : 'verificação'} não está definido`);
        return;
      }

      // Dados do template baseado no tipo
      let templateParams;
      
      if (testType === 'reset') {
        templateParams = {
          to_email: testEmail,
          email: testEmail,
          user_name: testEmail.split('@')[0],
          subject: APP_CONFIG.emails.subjects.resetTest,
          message: APP_CONFIG.emails.messages.resetTest,
          from_name: APP_CONFIG.emails.from.test,
          link: `${APP_CONFIG.url}/reset-password?token=test123`,
          reset_link: `${APP_CONFIG.url}/reset-password?token=test123`,
          app_name: APP_CONFIG.name,
          support_email: APP_CONFIG.support.email
        };
      } else {
        templateParams = {
          to_email: testEmail,
          email: testEmail,
          user_name: testEmail.split('@')[0],
          subject: APP_CONFIG.emails.subjects.verifyTest,
          message: APP_CONFIG.emails.messages.verifyTest,
          from_name: APP_CONFIG.emails.from.test,
          verification_link: `${APP_CONFIG.url}/api/auth/verify?token=test123`,
          reset_link: `${APP_CONFIG.url}/api/auth/verify?token=test123`,
          app_name: APP_CONFIG.name,
          welcome_message: APP_CONFIG.emails.messages.welcome
        };
      }

      // Enviar email
      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      console.log('Email enviado:', result);
      setMessage(`✅ Email de ${testType === 'reset' ? 'reset de senha' : 'verificação'} enviado com sucesso! Verifique sua caixa de entrada.`);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setMessage(`❌ Erro ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuração EmailJS
        </h2>
        
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
            <h3 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
              Como configurar o EmailJS com 2 templates:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>Acesse <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" className="underline">emailjs.com</a> e crie uma conta</li>
              <li>Crie um novo serviço de email (Gmail, Outlook, etc.)</li>
              <li>Crie 2 templates separados:</li>
              <li className="ml-4">• Template 1: Reset de Senha</li>
              <li className="ml-4">• Template 2: Verificação de Email</li>
              <li>Copie o Service ID, ambos Template IDs e Public Key</li>
              <li>Cole as informações abaixo e teste cada template</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleTestEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service ID
            </label>
            <input
              type="text"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              placeholder="service_xxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template ID - Reset de Senha
            </label>
            <input
              type="text"
              value={resetTemplateId}
              onChange={(e) => setResetTemplateId(e.target.value)}
              placeholder="template_reset_xxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template ID - Verificação de Email
            </label>
            <input
              type="text"
              value={verifyTemplateId}
              onChange={(e) => setVerifyTemplateId(e.target.value)}
              placeholder="template_verify_xxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Public Key
            </label>
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="user_xxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Email para Teste
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as 'reset' | 'verify')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="reset">Reset de Senha</option>
              <option value="verify">Verificação de Email</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email para teste
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !serviceId || !resetTemplateId || !verifyTemplateId || !publicKey || !testEmail}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enviando..." : `Testar Email ${testType === 'reset' ? 'Reset' : 'Verificação'}`}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${message.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Variáveis de Ambiente (.env):
          </h4>
          <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
{`NEXT_PUBLIC_EMAILJS_SERVICE_ID=${serviceId || 'your_service_id'}
NEXT_PUBLIC_EMAILJS_TEMPLATE_RESET_PASSWORD=${resetTemplateId || 'your_reset_template_id'}
NEXT_PUBLIC_EMAILJS_TEMPLATE_VERIFY_EMAIL=${verifyTemplateId || 'your_verify_template_id'}
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=${publicKey || 'your_public_key'}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default EmailJSConfig;
