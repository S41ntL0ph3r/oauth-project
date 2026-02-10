import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Bem-vindo ao seu Dashboard!
        </h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            <span className="font-medium">Usuário conectado:</span> {session.user?.email}
          </p>
          <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
            Você está autenticado e pode acessar todas as funcionalidades protegidas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">💰 Orçamento</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Planeje e controle seus gastos mensais</p>
          <a 
            href="/budget" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Gerenciar Orçamento →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">📊 Relatórios</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Crie relatórios personalizados</p>
          <a 
            href="/relatorios" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Ver Relatórios →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">🔔 Notificações</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Central de alertas e avisos</p>
          <a 
            href="/notificacoes" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Ver Notificações →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">📈 Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Visualize suas estatísticas financeiras</p>
          <a 
            href="/dashboard" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Ver Dashboard →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">👤 Perfil</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Gerencie suas informações pessoais</p>
          <a 
            href="/profile" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Ver Perfil →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">⚙️ Configurações</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Ajuste suas preferências do sistema</p>
          <a 
            href="/settings" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Configurar →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">📊 Analytics</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Métricas e insights do sistema</p>
          <a 
            href="/analytics" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Ver Analytics →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">🔒 Segurança</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Monitore eventos de segurança</p>
          <a 
            href="/security" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Ver Segurança →
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">💾 Backups</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Gerencie backups dos seus dados</p>
          <a 
            href="/backups" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            Ver Backups →
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
