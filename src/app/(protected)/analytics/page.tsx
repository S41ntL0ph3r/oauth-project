'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * Analytics Page - Métricas de Faturamento
 * 
 * CONFORMIDADE LGPD/GDPR:
 * - Apenas dados de faturamento agregados (Art. 7, I - Execução de contrato)
 * - NÃO coleta dados comportamentais de usuários
 * - NÃO rastreia sessões ou navegação
 * - Todos os acessos são registrados em audit log
 */

interface RevenueAnalytics {
  overview: {
    totalRevenue: number;        // Receita total no período
    monthlyAverage: number;      // Média mensal
    growthRate: number;          // Taxa de crescimento (%)
    averageTicket: number;       // Ticket médio
    transactionCount: number;    // Número de transações
    lastUpdate: string;          // Última atualização
  };
  charts: {
    // Receita por período
    revenueOverTime: Array<{ 
      date: string; 
      revenue: number;
      transactions: number;
    }>;
    // Receita por categoria
    revenueByCategory: Array<{ 
      category: string; 
      amount: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // API retorna apenas dados agregados de faturamento
      // Servidor registra acesso em audit log (LGPD Art. 37)
      const response = await fetch(`/api/analytics/revenue?period=${period}`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error('Erro ao carregar analytics');
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">Erro ao carregar dados de faturamento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Analytics & Métricas de Faturamento
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dados agregados - Última atualização: {new Date(data.overview.lastUpdate).toLocaleString('pt-BR')}
          </p>
        </div>
        
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Selecionar período"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="14">Últimos 14 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="365">Último ano</option>
        </select>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Receita Total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(data.overview.totalRevenue)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        {/* Média Mensal */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Média Mensal
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(data.overview.monthlyAverage)}
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>

        {/* Taxa de Crescimento */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Crescimento
              </p>
              <p className={`text-2xl font-bold mt-2 ${
                data.overview.growthRate >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercent(data.overview.growthRate)}
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ticket Médio
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(data.overview.averageTicket)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.overview.transactionCount} transações
              </p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Gráfico de Receita ao Longo do Tempo */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Evolução da Receita
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.charts.revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis 
              dataKey="date" 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Receita"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Receita por Categoria */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Receita por Categoria
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.charts.revenueByCategory}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis 
              dataKey="category" 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
            />
            <Legend />
            <Bar 
              dataKey="amount" 
              name="Receita"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer LGPD/GDPR */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>ℹ️ Privacidade:</strong> Esta página exibe apenas métricas agregadas de faturamento, 
          sem identificação individual. Conformidade com LGPD Art. 7, I (Execução de contrato) e 
          GDPR Art. 6(1)(b). Todos os acessos são registrados para auditoria.
        </p>
      </div>
    </div>
  );
}
