'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Edit3, 
  Trash2, 
  Key, 
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Clock,
  Shield,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  lastActive: string;
  loginMethod: string;
  accountAge: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Carregar usuários
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao carregar usuários' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conectividade' });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Atualizar usuário
  const handleUpdateUser = async (userData: { name: string; email: string }) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...userData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso' });
        setShowEditModal(false);
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar usuário' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conectividade' });
    } finally {
      setActionLoading(false);
    }
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Usuário excluído com sucesso' });
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao excluir usuário' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conectividade' });
    } finally {
      setActionLoading(false);
    }
  };

  // Solicitar reset de senha
  const handlePasswordReset = async (userId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/users/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Token de reset criado. Link: ${data.resetLink}` 
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao solicitar reset' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conectividade' });
    } finally {
      setActionLoading(false);
    }
  };

  // Buscar com delay
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Fechar mensagens automaticamente
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Usuários
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Mensagens */}
      {message.text && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            )}
            <p className="ml-3 text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Buscar
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nome ou email..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="verified">Verificados</option>
              <option value="unverified">Não Verificados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ordenar por
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="createdAt">Data de Criação</option>
              <option value="name">Nome</option>
              <option value="email">Email</option>
              <option value="updatedAt">Última Atualização</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ordem
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Usuários ({pagination.total})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Página {pagination.page} de {pagination.totalPages}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Última Atividade
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.image ? (
                              <Image 
                                className="h-10 w-10 rounded-full" 
                                src={user.image} 
                                alt={user.name || 'Avatar'} 
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || 'Sem nome'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {user.loginMethod === 'github' ? (
                                <span className="inline-flex items-center">
                                  <Shield className="w-3 h-3 mr-1" />
                                  GitHub
                                </span>
                              ) : (
                                <span className="inline-flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.isOnline ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                              Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                              Offline
                            </span>
                          )}
                          {user.emailVerified ? (
                            <div title="Email verificado">
                              <UserCheck className="w-4 h-4 text-green-500" />
                            </div>
                          ) : (
                            <div title="Email não verificado">
                              <UserX className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.accountAge} dias
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(user.lastActive).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.lastActive).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePasswordReset(user.id)}
                            disabled={actionLoading}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50"
                            title="Reset de senha"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {!loading && pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando{' '}
                    <span className="font-medium">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span>{' '}
                    até{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = pagination.page <= 3 
                        ? i + 1 
                        : pagination.page >= pagination.totalPages - 2 
                          ? pagination.totalPages - 4 + i 
                          : pagination.page - 2 + i;
                      
                      if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      Próximo
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUser}
          loading={actionLoading}
        />
      )}

      {/* Modal de Exclusão */}
      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteUser}
          loading={actionLoading}
        />
      )}

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

// Modal de Edição
function EditUserModal({ user, onClose, onSave, loading }: {
  user: User;
  onClose: () => void;
  onSave: (data: { name: string; email: string }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Editar Usuário
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Modal de Exclusão
function DeleteUserModal({ user, onClose, onConfirm, loading }: {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-red-600">
              Excluir Usuário
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir o usuário <strong>{user.name || user.email}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Esta ação não pode ser desfeita!
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de Detalhes
function UserDetailsModal({ user, onClose }: {
  user: User;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Detalhes do Usuário
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Avatar e Info Básica */}
            <div className="flex items-center space-x-4">
              {user.image ? (
                <Image 
                  className="h-20 w-20 rounded-full" 
                  src={user.image} 
                  alt={user.name || 'Avatar'} 
                  width={80}
                  height={80}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-700 dark:text-gray-300">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.name || 'Sem nome'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <div className="flex items-center mt-2 space-x-4">
                  {user.isOnline ? (
                    <span className="inline-flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      Offline
                    </span>
                  )}
                  {user.emailVerified ? (
                    <span className="inline-flex items-center text-green-600">
                      <UserCheck className="w-4 h-4 mr-1" />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-600">
                      <UserX className="w-4 h-4 mr-1" />
                      Não Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Detalhadas */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Informações da Conta
                </h5>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-900 dark:text-white">ID do Usuário</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400 font-mono">{user.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900 dark:text-white">Método de Login</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {user.loginMethod === 'github' ? 'GitHub OAuth' : 'Email/Senha'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900 dark:text-white">Email Verificado</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400">
                      {user.emailVerified 
                        ? new Date(user.emailVerified).toLocaleString('pt-BR')
                        : 'Não verificado'
                      }
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Atividade
                </h5>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-900 dark:text-white">Data de Criação</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900 dark:text-white">Última Atividade</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.lastActive).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900 dark:text-white">Idade da Conta</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400">
                      {user.accountAge} dias
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900 dark:text-white">Última Atualização</dt>
                    <dd className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.updatedAt).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
