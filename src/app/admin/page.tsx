'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Eye
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Dados mockados para demonstração
const salesData = [
  { name: 'Jan', vendas: 4000, usuarios: 240 },
  { name: 'Fev', vendas: 3000, usuarios: 139 },
  { name: 'Mar', vendas: 2000, usuarios: 980 },
  { name: 'Abr', vendas: 2780, usuarios: 390 },
  { name: 'Mai', vendas: 1890, usuarios: 480 },
  { name: 'Jun', vendas: 2390, usuarios: 380 },
];

const productData = [
  { name: 'Eletrônicos', value: 400 },
  { name: 'Roupas', value: 300 },
  { name: 'Casa', value: 200 },
  { name: 'Esportes', value: 100 },
];

const recentActivities = [
  {
    id: 1,
    type: 'user',
    message: 'Novo usuário cadastrado: João Silva',
    time: '2 minutos atrás'
  },
  {
    id: 2,
    type: 'product',
    message: 'Produto "Smartphone XYZ" foi atualizado',
    time: '15 minutos atrás'
  },
  {
    id: 3,
    type: 'order',
    message: 'Novo pedido #1234 recebido',
    time: '1 hora atrás'
  },
  {
    id: 4,
    type: 'user',
    message: 'Usuário Maria Santos fez login',
    time: '2 horas atrás'
  }
];

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
}

function StatsCard({ title, value, change, changeType, icon }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {changeType === 'increase' ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${
          changeType === 'increase' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
          vs último mês
        </span>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: typeof recentActivities[0] }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'product':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          {activity.message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {activity.time}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Visão geral do sistema e métricas principais
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Usuários"
            value="2,543"
            change="+12.5%"
            changeType="increase"
            icon={<Users className="h-6 w-6 text-blue-600" />}
          />
          <StatsCard
            title="Produtos Ativos"
            value="186"
            change="+5.2%"
            changeType="increase"
            icon={<Package className="h-6 w-6 text-green-600" />}
          />
          <StatsCard
            title="Pedidos Hoje"
            value="47"
            change="-3.1%"
            changeType="decrease"
            icon={<ShoppingCart className="h-6 w-6 text-orange-600" />}
          />
          <StatsCard
            title="Receita Mensal"
            value="R$ 12.543"
            change="+8.7%"
            changeType="increase"
            icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vendas e Usuários
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Area
                  type="monotone"
                  dataKey="vendas"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Line type="monotone" dataKey="usuarios" stroke="#10B981" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Product Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição de Produtos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {productData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Performance */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Mensal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atividades Recentes
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Ver todas
              </button>
            </div>
            <div className="space-y-1">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
