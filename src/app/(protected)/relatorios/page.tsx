'use client';

import { useState, useEffect, useMemo } from 'react';

interface SavedReport {
  id: string;
  name: string;
  description: string;
  reportType: string;
  filters: {
    reportType: string;
    startDate: string;
    endDate: string;
    category: string;
    transactionType: string;
    minAmount: string;
    maxAmount: string;
  };
  isFavorite: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

const REPORT_TYPES = [
  { value: 'transactions', label: 'Transações' },
  { value: 'categories', label: 'Gastos por Categoria' },
  { value: 'monthly', label: 'Comparativo Mensal' },
  { value: 'budget', label: 'Orçamento vs Real' },
  { value: 'custom', label: 'Personalizado' }
];

const CATEGORIES = [
  'Todos',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Trabalho',
  'Moradia',
  'Educação',
  'Vestuário',
  'Investimentos',
  'Outros'
];

export default function RelatoriosPage() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');

  const [filters, setFilters] = useState({
    reportType: 'transactions',
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'Todos',
    transactionType: 'all', // all, income, expense
    minAmount: '',
    maxAmount: ''
  });

  const [saveForm, setSaveForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    try {
      const response = await fetch('/api/custom-reports');
      if (response.ok) {
        const data = await response.json();
        setSavedReports(data.reports || []);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios salvos:', error);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.category !== 'Todos' && { category: filters.category }),
        ...(filters.transactionType !== 'all' && { type: filters.transactionType }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount })
      });

      const response = await fetch(`/api/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async () => {
    if (!saveForm.name) {
      alert('Digite um nome para o relatório');
      return;
    }

    try {
      const response = await fetch('/api/custom-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveForm.name,
          description: saveForm.description,
          reportType: 'CUSTOM',
          filters: filters
        })
      });

      if (response.ok) {
        await loadSavedReports();
        setShowSaveModal(false);
        setSaveForm({ name: '', description: '' });
        alert('Relatório salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
    }
  };

  const loadSavedReport = async (report: SavedReport) => {
    setFilters(report.filters);
    setActiveTab('generate');
    await generateReport();
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Deseja excluir este relatório salvo?')) return;

    try {
      const response = await fetch(`/api/custom-reports/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSavedReports();
      }
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const response = await fetch(`/api/custom-reports/${id}/favorite`, {
        method: 'PUT'
      });

      if (response.ok) {
        await loadSavedReports();
      }
    } catch (error) {
      console.error('Erro ao favoritar relatório:', error);
    }
  };

  const exportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          data: transactions,
          filters
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${new Date().getTime()}.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  // Cálculos do relatório
  const reportStats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory: Record<string, number> = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      byCategory[t.category] += t.type === 'expense' ? t.amount : 0;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      transactionCount: transactions.length,
      byCategory
    };
  }, [transactions]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Relatórios Personalizados
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crie relatórios customizados com filtros avançados
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Gerar Relatório
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Relatórios Salvos ({savedReports.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'generate' ? (
        <>
          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filtros do Relatório
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Relatório
                </label>
                <select
                  value={filters.reportType}
                  onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  {REPORT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Transação
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todas</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  placeholder="R$ 0.00"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  placeholder="R$ 9999.99"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={generateReport}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={transactions.length === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Salvar Configuração
              </button>
            </div>
          </div>

          {/* Resultados */}
          {transactions.length > 0 && (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total de Transações</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {reportStats.transactionCount}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Receitas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    R$ {reportStats.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Despesas</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    R$ {reportStats.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${
                  reportStats.balance >= 0 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <p className={`text-sm mb-1 ${
                    reportStats.balance >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    Saldo
                  </p>
                  <p className={`text-2xl font-bold ${
                    reportStats.balance >= 0 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    R$ {Math.abs(reportStats.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Botões de Exportação */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Exportar Relatório
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportReport('csv')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      CSV
                    </button>
                    <button
                      onClick={() => exportReport('excel')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel
                    </button>
                    <button
                      onClick={() => exportReport('pdf')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Gastos por Categoria */}
              {Object.keys(reportStats.byCategory).length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Gastos por Categoria
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(reportStats.byCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => {
                        const percentage = reportStats.totalExpense > 0 
                          ? (amount / reportStats.totalExpense) * 100 
                          : 0;
                        return (
                          <div key={category}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {category}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Lista de Transações */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Transações Encontradas
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descrição</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoria</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map(transaction => (
                        <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {transaction.category}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* Relatórios Salvos */
        <div className="space-y-4">
          {savedReports.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum relatório salvo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Gere um relatório e salve a configuração para reutilizar depois
              </p>
              <button
                onClick={() => setActiveTab('generate')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gerar Relatório
              </button>
            </div>
          ) : (
            savedReports.map(report => (
              <div key={report.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      {report.isFavorite && (
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                    {report.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {report.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(report.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={report.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <svg className="w-5 h-5" fill={report.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => loadSavedReport(report)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Carregar
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Salvar Relatório */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Salvar Configuração do Relatório
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Relatório
                </label>
                <input
                  type="text"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Despesas de Janeiro 2026"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Adicione uma descrição..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveReport}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvar Relatório
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
