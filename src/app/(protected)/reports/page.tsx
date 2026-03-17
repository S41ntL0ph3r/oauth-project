'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  description?: string;
  type: string;
  format: string;
  status: string;
  fileUrl?: string;
  fileSize?: bigint;
  recordCount?: number;
  generatedBy: string;
  generatedAt: string;
  completedAt?: string;
  expiresAt?: string;
  downloaded: boolean;
  downloadCount: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'USERS',
    format: 'CSV',
    parameters: {},
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Relatório iniciado! O arquivo será gerado em breve.');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          type: 'USERS',
          format: 'CSV',
          parameters: {},
        });
        // Atualizar lista após 2 segundos para dar tempo de processar
        setTimeout(fetchReports, 2000);
      } else {
        alert('Erro ao criar relatório');
      }
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      alert('Erro ao criar relatório');
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/download?reportId=${reportId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Extrair nome do arquivo do cabeçalho Content-Disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `report_${reportId}`;
        if (contentDisposition) {
          const matches = /filename="([^"]*)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Atualizar lista para mostrar download count atualizado
        fetchReports();
      } else {
        alert('Erro ao baixar relatório');
      }
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      alert('Erro ao baixar relatório');
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Deseja realmente deletar este relatório?')) return;

    try {
      const response = await fetch(`/api/reports?reportId=${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Relatório deletado com sucesso!');
        fetchReports();
      } else {
        alert('Erro ao deletar relatório');
      }
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      alert('Erro ao deletar relatório');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'GENERATING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'USERS':
        return '👥';
      case 'ANALYTICS':
        return '📊';
      case 'SECURITY':
        return '🔒';
      case 'SESSIONS':
        return '🔐';
      case 'AUDIT':
        return '📋';
      case 'CUSTOM':
        return '⚙️';
      default:
        return '📄';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF':
        return '📕';
      case 'EXCEL':
        return '📊';
      case 'CSV':
        return '📝';
      case 'JSON':
        return '📦';
      default:
        return '📄';
    }
  };

  const formatBytes = (bytes: bigint | number | undefined) => {
    if (!bytes) return 'N/A';
    const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (numBytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(numBytes) / Math.log(1024));
    return Math.round((numBytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📈 Relatórios Exportáveis</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Gerar Relatório
        </button>
      </div>

      {/* Cards de templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-semibold mb-1">Relatório de Usuários</h3>
          <p className="text-sm opacity-90">
            Lista completa de usuários cadastrados com dados de perfil
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-semibold mb-1">Relatório de Analytics</h3>
          <p className="text-sm opacity-90">
            Métricas e estatísticas de uso do sistema
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold mb-1">Relatório de Segurança</h3>
          <p className="text-sm opacity-90">
            Eventos de segurança e atividades suspeitas
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(report.type)}</span>
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xl">{getFormatIcon(report.format)}</span>
                    <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                      {report.format}
                    </span>
                  </div>

                  {report.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {report.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="font-medium">{report.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tamanho</p>
                      <p className="font-medium">{formatBytes(report.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Registros</p>
                      <p className="font-medium">
                        {report.recordCount?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Downloads</p>
                      <p className="font-medium">{report.downloadCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gerado em</p>
                      <p className="font-medium">
                        {format(new Date(report.generatedAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {report.expiresAt && (
                    <p className="text-xs text-gray-500 mt-3">
                      Expira em: {format(new Date(report.expiresAt), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {report.status === 'COMPLETED' && (
                    <button
                      onClick={() => downloadReport(report.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                    >
                      <span>⬇️</span>
                      <span>Baixar</span>
                    </button>
                  )}
                  {report.status === 'GENERATING' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-blue-300 text-white rounded-lg cursor-not-allowed flex items-center space-x-2"
                    >
                      <LoadingSpinner />
                      <span>Gerando...</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📊</p>
              <p>Nenhum relatório encontrado. Gere seu primeiro relatório!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Gerar Novo Relatório</h2>

            <form onSubmit={createReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Título do Relatório *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: Relatório Mensal de Usuários"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Descrição opcional"
                  rows={2}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Tipo de Relatório *
                </label>
                <select
                  title="Tipo de relatório"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="USERS">👥 Usuários</option>
                  <option value="ANALYTICS">📊 Analytics</option>
                  <option value="SECURITY">🔒 Segurança</option>
                  <option value="SESSIONS">🔐 Sessões</option>
                  <option value="AUDIT">📋 Auditoria</option>
                  <option value="CUSTOM">⚙️ Customizado</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Formato de Exportação *
                </label>
                <select
                  title="Formato de exportação"
                  value={formData.format}
                  onChange={(e) =>
                    setFormData({ ...formData, format: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="CSV">📝 CSV (Excel compatível)</option>
                  <option value="EXCEL">📊 Excel (.xlsx)</option>
                  <option value="PDF">📕 PDF</option>
                  <option value="JSON">📦 JSON</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gerar Relatório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
