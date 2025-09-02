'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Função para gerar IDs únicos
let idCounter = 0;
const generateUniqueId = (): string => {
  return `${Date.now()}-${++idCounter}`;
};

interface DashboardClientProps {
  session: {
    user?: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      id?: string;
    };
  } | null;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
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
  type: 'login' | 'profile' | 'transaction' | 'payment';
  timestamp: string;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ session }) => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  
  // Form states
  const [transactionForm, setTransactionForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [paymentForm, setPaymentForm] = useState({
    description: '',
    amount: '',
    dueDate: '',
    status: 'pending' as 'pending' | 'completed' | 'overdue'
  });

  // Estados editáveis
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', description: 'Login realizado com sucesso', type: 'login', timestamp: '2025-08-26 14:30' },
    { id: '2', description: 'Perfil atualizado', type: 'profile', timestamp: '2025-08-26 12:15' },
    { id: '3', description: 'Pagamento de R$ 150,00 registrado', type: 'transaction', timestamp: '2025-08-26 10:20' },
    { id: '4', description: 'Conta de luz agendada para pagamento', type: 'payment', timestamp: '2025-08-26 09:45' },
    { id: '5', description: 'Salário depositado: R$ 3.500,00', type: 'transaction', timestamp: '2025-08-25 16:00' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Salário', amount: 3500.00, type: 'income', category: 'Trabalho', date: '2025-08-25' },
    { id: '2', description: 'Supermercado', amount: 120.50, type: 'expense', category: 'Alimentação', date: '2025-08-24' },
    { id: '3', description: 'Gasolina', amount: 89.90, type: 'expense', category: 'Transporte', date: '2025-08-23' },
    { id: '4', description: 'Freelance', amount: 450.00, type: 'income', category: 'Trabalho', date: '2025-08-22' },
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    { id: '1', description: 'Conta de Luz', amount: 185.40, dueDate: '2025-08-30', status: 'pending' },
    { id: '2', description: 'Internet', amount: 99.90, dueDate: '2025-09-05', status: 'pending' },
    { id: '3', description: 'Cartão de Crédito', amount: 850.25, dueDate: '2025-09-10', status: 'pending' },
    { id: '4', description: 'Aluguel', amount: 1200.00, dueDate: '2025-09-01', status: 'completed' },
  ]);

  // Cálculo automático do saldo
  const calculatedBalance = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const completedPayments = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return income - expenses - completedPayments;
  }, [transactions, payments]);

  // Verificar pagamentos vencidos automaticamente
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setPayments(prev => prev.map(payment => {
      if (payment.status === 'pending' && payment.dueDate < today) {
        return { ...payment, status: 'overdue' as const };
      }
      return payment;
    }));
  }, []);

  // Adicionar nova transação
  const handleAddTransaction = () => {
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

    // Adicionar atividade
    const newActivity: Activity = {
      id: generateUniqueId(),
      description: `${transactionForm.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${parseFloat(transactionForm.amount).toFixed(2)} adicionada`,
      type: 'transaction',
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setActivities(prev => [newActivity, ...prev]);

    // Reset form
    setTransactionForm({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddTransaction(false);
  };

  // Adicionar novo pagamento
  const handleAddPayment = () => {
    if (!paymentForm.description || !paymentForm.amount || !paymentForm.dueDate) return;

    const newPayment: Payment = {
      id: generateUniqueId(),
      description: paymentForm.description,
      amount: parseFloat(paymentForm.amount),
      dueDate: paymentForm.dueDate,
      status: paymentForm.status
    };

    setPayments(prev => [newPayment, ...prev]);

    // Adicionar atividade
    const newActivity: Activity = {
      id: generateUniqueId(),
      description: `Pagamento de R$ ${parseFloat(paymentForm.amount).toFixed(2)} agendado para ${paymentForm.dueDate}`,
      type: 'payment',
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setActivities(prev => [newActivity, ...prev]);

    // Reset form
    setPaymentForm({
      description: '',
      amount: '',
      dueDate: '',
      status: 'pending'
    });
    setShowAddPayment(false);
  };

  // Alterar status do pagamento
  const handlePaymentStatusChange = (paymentId: string, newStatus: Payment['status']) => {
    setPayments(prev => prev.map(payment => {
      if (payment.id === paymentId) {
        const updatedPayment = { ...payment, status: newStatus };
        
        // Adicionar atividade
        const statusText = newStatus === 'completed' ? 'concluído' : 
                          newStatus === 'pending' ? 'marcado como pendente' : 'marcado como vencido';
        const newActivity: Activity = {
          id: generateUniqueId(),
          description: `Pagamento "${payment.description}" ${statusText}`,
          type: 'payment',
          timestamp: new Date().toLocaleString('pt-BR')
        };
        setActivities(prev => [newActivity, ...prev]);
        
        return updatedPayment;
      }
      return payment;
    }));
  };

  // Editar pagamento
  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      description: payment.description,
      amount: payment.amount.toString(),
      dueDate: payment.dueDate,
      status: payment.status
    });
    setShowEditPayment(true);
  };

  // Salvar edição do pagamento
  const handleSaveEditPayment = () => {
    if (!editingPayment || !paymentForm.description || !paymentForm.amount || !paymentForm.dueDate) return;

    setPayments(prev => prev.map(payment => {
      if (payment.id === editingPayment.id) {
        return {
          ...payment,
          description: paymentForm.description,
          amount: parseFloat(paymentForm.amount),
          dueDate: paymentForm.dueDate,
          status: paymentForm.status
        };
      }
      return payment;
    }));

    // Adicionar atividade
    const newActivity: Activity = {
      id: generateUniqueId(),
      description: `Pagamento "${paymentForm.description}" foi editado`,
      type: 'payment',
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setActivities(prev => [newActivity, ...prev]);

    setShowEditPayment(false);
    setEditingPayment(null);
    setPaymentForm({
      description: '',
      amount: '',
      dueDate: '',
      status: 'pending'
    });
  };

  // Excluir pagamento
  const handleDeletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setPayments(prev => prev.filter(p => p.id !== paymentId));

    // Adicionar atividade
    const newActivity: Activity = {
      id: generateUniqueId(),
      description: `Pagamento "${payment.description}" foi excluído`,
      type: 'payment',
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      case 'profile':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'transaction':
        return (
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Financeiro</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Bem-vindo, {session?.user?.name || session?.user?.email}! Gerencie suas finanças aqui.
        </p>
      </div>

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
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pagamentos Pendentes</p>
              <p className="text-2xl font-semibold text-yellow-600">
                R$ {pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades da Conta */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Atividades Recentes</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controle de Saldo */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Controle de Saldo</h2>
            <button 
              onClick={() => setShowAddTransaction(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              + Transação
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-300">Saldo Atual</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                R$ {calculatedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <span className="text-sm text-green-600 dark:text-green-400">Total de Receitas</span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <span className="text-sm text-red-600 dark:text-red-400">Total de Despesas</span>
              <span className="font-semibold text-red-700 dark:text-red-400">
                - R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos Recentes */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transações Recentes</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category} • {transaction.date}</p>
                </div>
                <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagamentos Agendados */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pagamentos Agendados</h2>
            <button 
              onClick={() => setShowAddPayment(true)}
              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
            >
              + Pagamento
            </button>
          </div>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vencimento: {payment.dueDate}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <select
                      value={payment.status}
                      onChange={(e) => handlePaymentStatusChange(payment.id, e.target.value as Payment['status'])}
                      className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        payment.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="completed">Pago</option>
                      <option value="overdue">Vencido</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleEditPayment(payment)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
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
                  <input
                    type="text"
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, status: e.target.value as Payment['status'] }))}
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
    </div>
  );
};

export default DashboardClient;
