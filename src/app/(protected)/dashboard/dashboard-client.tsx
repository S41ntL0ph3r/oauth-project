'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useLocalStorage from '@/hooks/useLocalStorage';
import useDataExport from '@/hooks/useDataExport';

// Tipos
type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface Activity {
  id: string;
  description: string;
  type: 'transaction' | 'payment';
  timestamp: string;
}

type ActiveTab = 'overview' | 'transactions' | 'payments' | 'activities' | 'settings';

const DashboardClient: React.FC = () => {
  const { data: session } = useSession();
  const { exportToCSV, exportToPDF } = useDataExport();
  
  // Estados principais com localStorage
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('dashboard-transactions', []);
  const [payments, setPayments] = useLocalStorage<Payment[]>('dashboard-payments', []);
  const [activities, setActivities] = useLocalStorage<Activity[]>('dashboard-activities', []);
  
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  // Estado para evitar hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Estados dos modais
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Estados dos modais de confirmação de limpeza
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteTransactionsConfirm, setShowDeleteTransactionsConfirm] = useState(false);
  const [showDeletePaymentsConfirm, setShowDeletePaymentsConfirm] = useState(false);
  const [showDeleteActivitiesConfirm, setShowDeleteActivitiesConfirm] = useState(false);
  
  // Estados dos modais de confirmação individual
  const [showDeleteTransactionConfirm, setShowDeleteTransactionConfirm] = useState(false);
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  
  // Estados dos formulários
  const [transactionForm, setTransactionForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as TransactionType,
    category: 'Outros',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [paymentForm, setPaymentForm] = useState({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0]
  });
  
  // Função para gerar ID único
  const generateUniqueId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);
  
  // Cálculos
  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);
  
  const totalExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);
  
  const calculatedBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);
  
  // Handlers
  const handleAddTransaction = useCallback(() => {
    if (!transactionForm.description || !transactionForm.amount) return;

    const newTransaction: Transaction = {
      id: generateUniqueId(),
      description: transactionForm.description,
      amount: parseFloat(transactionForm.amount),
      type: transactionForm.type,
      category: transactionForm.category,
      date: transactionForm.date
    };

    setTransactions(prev => [newTransaction, ...prev]);

    const newActivity: Activity = {
      id: generateUniqueId(),
      description: `${transactionForm.type === 'income' ? 'Receita' : 'Despesa'} adicionada: ${transactionForm.description}`,
      type: 'transaction',
      timestamp: new Date().toISOString()
    };

    setActivities(prev => [newActivity, ...prev]);

    setTransactionForm({
      description: '',
      amount: '',
      type: 'expense',
      category: 'Outros',
      date: new Date().toISOString().split('T')[0]
    });

    setShowAddTransaction(false);
  }, [transactionForm, setTransactions, setActivities, generateUniqueId]);
  
  const handleAddPayment = useCallback(() => {
    if (!paymentForm.description || !paymentForm.amount) return;

    const newPayment: Payment = {
      id: generateUniqueId(),
      description: paymentForm.description,
      amount: parseFloat(paymentForm.amount),
      dueDate: paymentForm.dueDate,
      status: 'pending'
    };

    setPayments(prev => [newPayment, ...prev]);

    const newActivity: Activity = {
      id: generateUniqueId(),
      description: `Pagamento agendado: ${paymentForm.description}`,
      type: 'payment',
      timestamp: new Date().toISOString()
    };

    setActivities(prev => [newActivity, ...prev]);

    setPaymentForm({
      description: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0]
    });

    setShowAddPayment(false);
  }, [paymentForm, setPayments, setActivities, generateUniqueId]);
  
  const handleSaveEditPayment = useCallback(() => {
    if (!editingPayment) return;

    // Obter o pagamento original para comparar status
    const originalPayment = payments.find(p => p.id === editingPayment.id);
    const wasNotCompleted = originalPayment && originalPayment.status !== 'completed';
    const isNowCompleted = editingPayment.status === 'completed';

    // Se o pagamento foi marcado como pago (de pendente/vencido para completed)
    if (wasNotCompleted && isNowCompleted) {
      // Criar uma transação de despesa correspondente
      const expenseTransaction: Transaction = {
        id: generateUniqueId(),
        description: `Pagamento: ${editingPayment.description}`,
        amount: editingPayment.amount, // Valor positivo para despesa
        type: 'expense',
        category: 'Pagamentos',
        date: new Date().toISOString().split('T')[0]
      };

      // Adicionar a transação de despesa
      setTransactions(prev => [expenseTransaction, ...prev]);

      // Adicionar atividade específica para o pagamento realizado
      const paymentActivity: Activity = {
        id: generateUniqueId(),
        description: `Pagamento realizado: ${editingPayment.description} - R$ ${editingPayment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        type: 'payment',
        timestamp: new Date().toISOString()
      };

      setActivities(prev => [paymentActivity, ...prev]);
    }

    // Atualizar o pagamento
    setPayments(prev => prev.map(payment => 
      payment.id === editingPayment.id ? editingPayment : payment
    ));

    // Adicionar atividade geral de atualização
    const updateActivity: Activity = {
      id: generateUniqueId(),
      description: `Status do pagamento atualizado: ${editingPayment.description} - ${
        editingPayment.status === 'completed' ? 'Pago' : 
        editingPayment.status === 'overdue' ? 'Vencido' : 'Pendente'
      }`,
      type: 'payment',
      timestamp: new Date().toISOString()
    };

    setActivities(prev => [updateActivity, ...prev]);

    setShowEditPayment(false);
    setEditingPayment(null);
  }, [editingPayment, payments, setPayments, setTransactions, setActivities, generateUniqueId]);
  
  // Função para deletar transação individual
  const handleDeleteTransactionRequest = useCallback((transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteTransactionConfirm(true);
  }, []);

  const handleConfirmDeleteTransaction = useCallback(() => {
    if (!transactionToDelete) return;

    // Remover a transação
    setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
    
    // Adicionar atividade de exclusão
    const deleteActivity: Activity = {
      id: generateUniqueId(),
      description: `Transação excluída: ${transactionToDelete.description} - ${transactionToDelete.type === 'income' ? '+' : '-'}R$ ${Math.abs(transactionToDelete.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      type: 'transaction',
      timestamp: new Date().toISOString()
    };

    setActivities(prev => [deleteActivity, ...prev]);
    
    // Limpar estado
    setTransactionToDelete(null);
    setShowDeleteTransactionConfirm(false);
  }, [transactionToDelete, setTransactions, setActivities, generateUniqueId]);

  // Função para deletar pagamento individual
  const handleDeletePaymentRequest = useCallback((payment: Payment) => {
    setPaymentToDelete(payment);
    setShowDeletePaymentConfirm(true);
  }, []);

  const handleConfirmDeletePayment = useCallback(() => {
    if (!paymentToDelete) return;

    // Remover o pagamento
    setPayments(prev => prev.filter(p => p.id !== paymentToDelete.id));
    
    // Adicionar atividade de exclusão
    const deleteActivity: Activity = {
      id: generateUniqueId(),
      description: `Pagamento excluído: ${paymentToDelete.description} - R$ ${paymentToDelete.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      type: 'payment',
      timestamp: new Date().toISOString()
    };

    setActivities(prev => [deleteActivity, ...prev]);
    
    // Limpar estado
    setPaymentToDelete(null);
    setShowDeletePaymentConfirm(false);
  }, [paymentToDelete, setPayments, setActivities, generateUniqueId]);

  // Função para preparar dados de exportação
  const prepareExportData = useCallback(() => {
    return {
      transactions,
      payments,
      activities,
      summary: {
        totalIncome,
        totalExpenses,
        balance: calculatedBalance,
        totalTransactions: transactions.length,
        totalPayments: payments.length
      }
    };
  }, [transactions, payments, activities, totalIncome, totalExpenses, calculatedBalance]);

  // Função para exportar CSV
  const handleExportCSV = useCallback(() => {
    console.log('handleExportCSV chamado');
    const data = prepareExportData();
    console.log('Dados preparados:', data);
    const result = exportToCSV(data);
    console.log('Resultado exportToCSV:', result);
    
    if (result.success) {
      const exportActivity: Activity = {
        id: generateUniqueId(),
        description: 'Dados exportados em formato CSV',
        type: 'transaction',
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [exportActivity, ...prev]);
    }
    
    // Mostrar feedback visual (você pode adicionar um toast aqui)
    console.log(result.message);
  }, [prepareExportData, exportToCSV, generateUniqueId, setActivities]);

  // Função para exportar PDF
  const handleExportPDF = useCallback(() => {
    console.log('handleExportPDF chamado');
    const data = prepareExportData();
    console.log('Dados preparados:', data);
    const result = exportToPDF(data);
    console.log('Resultado exportToPDF:', result);
    
    if (result.success) {
      const exportActivity: Activity = {
        id: generateUniqueId(),
        description: 'Dados exportados em formato PDF',
        type: 'transaction',
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [exportActivity, ...prev]);
    }
    
    // Mostrar feedback visual (você pode adicionar um toast aqui)
    console.log(result.message);
  }, [prepareExportData, exportToPDF, generateUniqueId, setActivities]);
  
  // Função para renderizar o conteúdo ativo
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'transactions':
        return renderTransactionsTab();
      case 'payments':
        return renderPaymentsTab();
      case 'activities':
        return renderActivitiesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };
  
  // Componente da aba Overview
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                R$ {calculatedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas</p>
              <p className="text-2xl font-semibold text-green-600">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas</p>
              <p className="text-2xl font-semibold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pagamentos Pendentes</p>
              <p className="text-2xl font-semibold text-purple-600">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seções de navegação rápida */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transações Recentes</h3>
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setActiveTab('transactions')}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Ver Todas as Transações
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Próximos Pagamentos</h3>
          <div className="space-y-3">
            {payments.slice(0, 3).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{payment.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setActiveTab('payments')}
            className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Ver Todos os Pagamentos
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            {activities.slice(0, 3).map((activity) => (
              <div key={activity.id}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setActiveTab('activities')}
            className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Ver Todas as Atividades
          </button>
        </div>
      </div>
    </div>
  );

  // Componente da aba Transações
  const renderTransactionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gerenciar Transações</h2>
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Nova Transação
          </button>
        </div>

        {/* Resumo rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Receitas Total</p>
            <p className="text-xl font-semibold text-green-700 dark:text-green-300">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Despesas Total</p>
            <p className="text-xl font-semibold text-red-700 dark:text-red-300">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">Saldo Líquido</p>
            <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
              R$ {(totalIncome - totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Lista de transações */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Todas as Transações</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma transação encontrada. Adicione sua primeira transação!
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {transaction.type === 'income' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTransactionRequest(transaction)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Excluir transação"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Componente da aba Pagamentos
  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gerenciar Pagamentos</h2>
          <button 
            onClick={() => setShowAddPayment(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            + Novo Pagamento
          </button>
        </div>

        {/* Resumo de pagamentos por status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</p>
            <p className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">
              {payments.filter(p => p.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Pagos</p>
            <p className="text-xl font-semibold text-green-700 dark:text-green-300">
              {payments.filter(p => p.status === 'completed').length}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Vencidos</p>
            <p className="text-xl font-semibold text-red-700 dark:text-red-300">
              {payments.filter(p => p.status === 'overdue').length}
            </p>
          </div>
        </div>

        {/* Lista de pagamentos */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Todos os Pagamentos</h3>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum pagamento agendado. Adicione seu primeiro pagamento!
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'completed' ? 'bg-green-500' :
                      payment.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {payment.status === 'completed' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{payment.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          payment.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {payment.status === 'completed' ? 'Pago' : payment.status === 'overdue' ? 'Vencido' : 'Pendente'}
                        </span>
                        <span>•</span>
                        <span>Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingPayment(payment);
                        setShowEditPayment(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Editar pagamento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePaymentRequest(payment)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Excluir pagamento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Componente da aba Atividades
  const renderActivitiesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Histórico de Atividades</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {activities.length} atividades
          </div>
        </div>

        {/* Lista de atividades */}
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma atividade registrada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                    activity.type === 'transaction' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {activity.type === 'transaction' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activity.type === 'transaction' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {activity.type === 'transaction' ? 'Transação' : 'Pagamento'}
                      </span>
                      <span>•</span>
                      <span>{new Date(activity.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Componente da aba Configurações
  const renderSettingsTab = () => {
    const handleDeleteAll = () => {
      setTransactions([]);
      setPayments([]);
      setActivities([]);
      setShowDeleteAllConfirm(false);
    };

    const handleDeleteTransactions = () => {
      setTransactions([]);
      // Remover atividades relacionadas a transações
      setActivities(prev => prev.filter(activity => activity.type !== 'transaction'));
      setShowDeleteTransactionsConfirm(false);
    };

    const handleDeletePayments = () => {
      setPayments([]);
      // Remover atividades relacionadas a pagamentos
      setActivities(prev => prev.filter(activity => activity.type !== 'payment'));
      setShowDeletePaymentsConfirm(false);
    };

    const handleDeleteActivities = () => {
      setActivities([]);
      setShowDeleteActivitiesConfirm(false);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">⚙️ Configurações do Sistema</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gerencie e limpe seus dados financeiros com cuidado. Estas ações não podem ser desfeitas.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total de Transações</p>
              <p className="text-2xl font-semibold text-blue-700 dark:text-blue-300">{transactions.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400">Total de Pagamentos</p>
              <p className="text-2xl font-semibold text-purple-700 dark:text-purple-300">{payments.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">Total de Atividades</p>
              <p className="text-2xl font-semibold text-green-700 dark:text-green-300">{activities.length}</p>
            </div>
          </div>

          {/* Ações de Limpeza */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">🗑️ Limpeza de Dados</h3>
            
            {/* Limpar Transações */}
            <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Limpar Transações</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Remove todas as transações de receitas e despesas ({transactions.length} items)
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteTransactionsConfirm(true)}
                  disabled={transactions.length === 0}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Limpar Transações
                </button>
              </div>
            </div>

            {/* Limpar Pagamentos */}
            <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Limpar Pagamentos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Remove todos os pagamentos agendados e realizados ({payments.length} items)
                  </p>
                </div>
                <button
                  onClick={() => setShowDeletePaymentsConfirm(true)}
                  disabled={payments.length === 0}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Limpar Pagamentos
                </button>
              </div>
            </div>

            {/* Limpar Atividades */}
            <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Limpar Histórico de Atividades</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Remove todo o histórico de atividades ({activities.length} items)
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteActivitiesConfirm(true)}
                  disabled={activities.length === 0}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Limpar Histórico
                </button>
              </div>
            </div>

            {/* Limpar Tudo */}
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-200">⚠️ Limpar Todos os Dados</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Remove TODOS os dados financeiros: transações, pagamentos e histórico de atividades
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                    Esta ação é irreversível e apagará completamente seu histórico financeiro!
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  disabled={transactions.length === 0 && payments.length === 0 && activities.length === 0}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  🗑️ Limpar Tudo
                </button>
              </div>
            </div>
          </div>

          {/* Modais de Confirmação */}
          {/* Modal Confirmar Limpar Tudo */}
          {showDeleteAllConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4">⚠️ Confirmar Limpeza Total</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Tem certeza que deseja apagar <strong>TODOS</strong> os seus dados financeiros? 
                  Esta ação não pode ser desfeita e você perderá:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                  <li>{transactions.length} transações</li>
                  <li>{payments.length} pagamentos</li>
                  <li>{activities.length} atividades</li>
                </ul>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Sim, apagar tudo
                  </button>
                  <button
                    onClick={() => setShowDeleteAllConfirm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Confirmar Limpar Transações */}
          {showDeleteTransactionsConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-4">Confirmar Limpeza de Transações</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Tem certeza que deseja apagar todas as {transactions.length} transações? 
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteTransactions}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                  >
                    Sim, apagar
                  </button>
                  <button
                    onClick={() => setShowDeleteTransactionsConfirm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Confirmar Limpar Pagamentos */}
          {showDeletePaymentsConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-4">Confirmar Limpeza de Pagamentos</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Tem certeza que deseja apagar todos os {payments.length} pagamentos? 
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeletePayments}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                  >
                    Sim, apagar
                  </button>
                  <button
                    onClick={() => setShowDeletePaymentsConfirm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Confirmar Limpar Atividades */}
          {showDeleteActivitiesConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-4">Confirmar Limpeza do Histórico</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Tem certeza que deseja apagar todas as {activities.length} atividades do histórico? 
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteActivities}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                  >
                    Sim, apagar
                  </button>
                  <button
                    onClick={() => setShowDeleteActivitiesConfirm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Financeiro</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isClient && session ? 
                `Bem-vindo, ${session.user?.name || session.user?.email}! Gerencie suas finanças aqui.` :
                'Bem-vindo! Gerencie suas finanças aqui.'
              }
            </p>
          </div>
          
          {/* Botão de Exportação */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Exportar dados financeiros"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Exportar dados
            </button>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Transações
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Pagamentos
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activities'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Atividades
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            ⚙️ Configurações
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {renderActiveTab()}

      {/* Modal Adicionar Transação */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adicionar Transação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value as TransactionType }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={handleAddTransaction}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
              <button 
                onClick={() => setShowAddTransaction(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Pagamento */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agendar Pagamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={paymentForm.dueDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={handleAddPayment}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Agendar
              </button>
              <button 
                onClick={() => setShowAddPayment(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Pagamento */}
      {showEditPayment && editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editar Pagamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingPayment.description}
                  onChange={(e) => setEditingPayment(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPayment.amount}
                    onChange={(e) => setEditingPayment(prev => prev ? ({ ...prev, amount: parseFloat(e.target.value) || 0 }) : null)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={editingPayment.dueDate}
                    onChange={(e) => setEditingPayment(prev => prev ? ({ ...prev, dueDate: e.target.value }) : null)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={editingPayment.status}
                  onChange={(e) => setEditingPayment(prev => prev ? ({ ...prev, status: e.target.value as Payment['status'] }) : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">Pendente</option>
                  <option value="completed">Pago</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={handleSaveEditPayment}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
              <button 
                onClick={() => {
                  setShowEditPayment(false);
                  setEditingPayment(null);
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão de Transação */}
      {showDeleteTransactionConfirm && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4">⚠️ Confirmar Exclusão</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Tem certeza que deseja excluir esta transação?
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900 dark:text-white">{transactionToDelete.description}</p>
              <p className={`text-sm ${transactionToDelete.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transactionToDelete.type === 'income' ? '+' : '-'}R$ {Math.abs(transactionToDelete.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {transactionToDelete.category} • {new Date(transactionToDelete.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmDeleteTransaction}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => {
                  setShowDeleteTransactionConfirm(false);
                  setTransactionToDelete(null);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão de Pagamento */}
      {showDeletePaymentConfirm && paymentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4">⚠️ Confirmar Exclusão</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Tem certeza que deseja excluir este pagamento?
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900 dark:text-white">{paymentToDelete.description}</p>
              <p className="text-sm text-gray-900 dark:text-white">
                R$ {paymentToDelete.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  paymentToDelete.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  paymentToDelete.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {paymentToDelete.status === 'completed' ? 'Pago' : paymentToDelete.status === 'overdue' ? 'Vencido' : 'Pendente'}
                </span>
                • Vencimento: {new Date(paymentToDelete.dueDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmDeletePayment}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => {
                  setShowDeletePaymentConfirm(false);
                  setPaymentToDelete(null);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exportar Dados Financeiros
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Escolha o formato para exportar seus dados financeiros:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  handleExportCSV();
                  setShowExportModal(false);
                }}
                className="w-full flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full mr-3 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Exportar como CSV</div>
                  <div className="text-sm text-green-200">Ideal para planilhas (Excel, Google Sheets)</div>
                </div>
              </button>

              <button
                onClick={() => {
                  console.log('Clicou no botão PDF');
                  handleExportPDF();
                  setShowExportModal(false);
                }}
                className="w-full flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full mr-3 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Exportar como PDF</div>
                  <div className="text-sm text-red-200">Relatório formatado para impressão</div>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardClient;
