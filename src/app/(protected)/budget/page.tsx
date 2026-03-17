'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useEventTracking } from '@/hooks/use-event-tracking';

interface Budget {
  id: string;
  name: string;
  month: number;
  year: number;
  category: string;
  limitAmount: number;
  spentAmount: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = [
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

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const PROGRESS_WIDTH_CLASSES = [
  'w-0',
  'w-[5%]',
  'w-[10%]',
  'w-[15%]',
  'w-[20%]',
  'w-[25%]',
  'w-[30%]',
  'w-[35%]',
  'w-[40%]',
  'w-[45%]',
  'w-1/2',
  'w-[55%]',
  'w-[60%]',
  'w-[65%]',
  'w-[70%]',
  'w-3/4',
  'w-[80%]',
  'w-[85%]',
  'w-[90%]',
  'w-[95%]',
  'w-full',
];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgetForm, setBudgetForm] = useState({
    name: '',
    category: 'Outros',
    limitAmount: '',
    alertThreshold: '80',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });
  const { capture, events } = useEventTracking();

  // Carregar budgets e transações
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Carregar budgets
      const budgetResponse = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (budgetResponse.ok) {
        const data = await budgetResponse.json();
        setBudgets(data.budgets || []);
      }

      // Carregar transações do mês para calcular gastos
      const transResponse = await fetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}`);
      if (transResponse.ok) {
        const data = await transResponse.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear, loadData]);

  useEffect(() => {
    capture(events.featureVisited, {
      feature: 'budget',
      month: selectedMonth,
      year: selectedYear,
    });
  }, [capture, events.featureVisited, selectedMonth, selectedYear]);

  // Calcular gastos por categoria
  const spendingByCategory = useMemo(() => {
    const spending: Record<string, number> = {};
    transactions.forEach(transaction => {
      if (!spending[transaction.category]) {
        spending[transaction.category] = 0;
      }
      spending[transaction.category] += transaction.amount;
    });
    return spending;
  }, [transactions]);

  // Atualizar orçamentos com gastos reais
  const budgetsWithSpending = useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      spentAmount: spendingByCategory[budget.category] || 0
    }));
  }, [budgets, spendingByCategory]);

  const handleAddBudget = async () => {
    if (!budgetForm.name || !budgetForm.limitAmount) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: budgetForm.name,
          category: budgetForm.category,
          limitAmount: parseFloat(budgetForm.limitAmount),
          alertThreshold: parseFloat(budgetForm.alertThreshold),
          month: budgetForm.month,
          year: budgetForm.year
        })
      });

      if (response.ok) {
        await loadData();
        capture(events.budgetCreated, {
          category: budgetForm.category,
          limitAmount: parseFloat(budgetForm.limitAmount),
          month: budgetForm.month,
          year: budgetForm.year,
        });
        setShowAddModal(false);
        setBudgetForm({
          name: '',
          category: 'Outros',
          limitAmount: '',
          alertThreshold: '80',
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        });
      }
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;

    try {
      const response = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: budgetForm.name,
          limitAmount: parseFloat(budgetForm.limitAmount),
          alertThreshold: parseFloat(budgetForm.alertThreshold)
        })
      });

      if (response.ok) {
        await loadData();
        capture(events.budgetUpdated, {
          budgetId: editingBudget.id,
          category: editingBudget.category,
          limitAmount: parseFloat(budgetForm.limitAmount),
        });
        setShowEditModal(false);
        setEditingBudget(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Do you really want to delete this budget?')) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadData();
        capture(events.budgetDeleted, {
          budgetId: id,
        });
      }
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
    }
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      name: budget.name,
      category: budget.category,
      limitAmount: budget.limitAmount.toString(),
      alertThreshold: budget.alertThreshold.toString(),
      month: budget.month,
      year: budget.year
    });
    setShowEditModal(true);
  };

  const getProgressPercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number, threshold: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= threshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressWidthClass = (percentage: number) => {
    const safePercentage = Math.max(0, Math.min(100, percentage));
    const classIndex = Math.round(safePercentage / 5);
    return PROGRESS_WIDTH_CLASSES[classIndex] || 'w-0';
  };

  const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          💰 Orçamento Mensal
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Planeje e acompanhe seus gastos por categoria
        </p>
      </div>

      {/* Seletor de Período */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mês
              </label>
              <select
                title="Selecionar mês"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ano
              </label>
              <select
                title="Selecionar ano"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                {[2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Novo Orçamento
          </button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Orçamento Total</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Gasto Total</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`p-6 rounded-lg ${
          totalRemaining >= 0 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          <p className={`text-sm mb-1 ${
            totalRemaining >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {totalRemaining >= 0 ? 'Disponível' : 'Excedente'}
          </p>
          <p className={`text-2xl font-bold ${
            totalRemaining >= 0 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            R$ {Math.abs(totalRemaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="space-y-4">
        {budgetsWithSpending.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum orçamento criado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crie seu primeiro orçamento para começar a controlar seus gastos
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Orçamento
            </button>
          </div>
        ) : (
          budgetsWithSpending.map(budget => {
            const percentage = getProgressPercentage(budget.spentAmount, budget.limitAmount);
            const remaining = budget.limitAmount - budget.spentAmount;
            
            return (
              <div key={budget.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {budget.name}
                      </h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {budget.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Alerta em {budget.alertThreshold}% do orçamento
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      R$ {budget.spentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {budget.limitAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`font-semibold ${
                      percentage >= 100 ? 'text-red-600' :
                      percentage >= budget.alertThreshold ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressColor(percentage, budget.alertThreshold)} ${getProgressWidthClass(percentage)}`}
                    />
                  </div>
                </div>

                {/* Status e Ações */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {percentage >= 100 ? (
                      <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Orçamento excedido
                      </span>
                    ) : percentage >= budget.alertThreshold ? (
                      <span className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Próximo do limite
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Dentro do orçamento
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {remaining >= 0 ? 'Restam' : 'Excedeu'} R$ {Math.abs(remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Adicionar Orçamento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Novo Orçamento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Orçamento
                </label>
                <input
                  type="text"
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Orçamento Alimentação Fevereiro"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <select
                  title="Categoria do orçamento"
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mês
                  </label>
                  <select
                    title="Mês do orçamento"
                    value={budgetForm.month}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ano
                  </label>
                  <select
                    title="Ano do orçamento"
                    value={budgetForm.year}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Limite (R$)
                </label>
                <input
                  title="Valor limite do orçamento"
                  type="number"
                  step="0.01"
                  value={budgetForm.limitAmount}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, limitAmount: e.target.value }))}
                  placeholder="1000.00"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alerta em (%)
                </label>
                <input
                  title="Percentual para alerta de orçamento"
                  type="number"
                  min="1"
                  max="100"
                  value={budgetForm.alertThreshold}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, alertThreshold: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Você será alertado quando atingir este percentual do orçamento
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddBudget}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Orçamento
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Orçamento */}
      {showEditModal && editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Editar Orçamento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Orçamento
                </label>
                <input
                  title="Nome do orçamento"
                  type="text"
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Limite (R$)
                </label>
                <input
                  title="Valor limite do orçamento"
                  type="number"
                  step="0.01"
                  value={budgetForm.limitAmount}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, limitAmount: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alerta em (%)
                </label>
                <input
                  title="Percentual para alerta de orçamento"
                  type="number"
                  min="1"
                  max="100"
                  value={budgetForm.alertThreshold}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, alertThreshold: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateBudget}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBudget(null);
                }}
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
