import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bem-vindo ao seu Dashboard!
        </h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <span className="font-medium">Usuário conectado:</span> {session.user?.email}
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Você está autenticado e pode acessar todas as funcionalidades protegidas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Perfil</h3>
          <p className="text-gray-600 mb-4">Gerencie suas informações pessoais</p>
          <a 
            href="/profile" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Ver Perfil →
          </a>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações</h3>
          <p className="text-gray-600 mb-4">Ajuste suas preferências</p>
          <a 
            href="/settings" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Configurar →
          </a>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard</h3>
          <p className="text-gray-600 mb-4">Visualize suas estatísticas</p>
          <a 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Ver Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
