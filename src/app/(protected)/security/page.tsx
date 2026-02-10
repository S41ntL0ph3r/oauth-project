'use client';

import { useEffect, useState, useCallback } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format } from 'date-fns';

interface SessionLog {
  id: string;
  action: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  success: boolean;
  failReason?: string;
  createdAt: string;
}

interface ActiveSession {
  id: string;
  sessionToken: string;
  expires: string;
  device?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  lastActivity?: string;
}

interface SecurityEvent {
  id: string;
  eventType: string;
  severity: string;
  description: string;
  ipAddress?: string;
  resolved: boolean;
  createdAt: string;
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'logs' | 'events'>(
    'sessions'
  );
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'sessions') {
        const response = await fetch('/api/session-logs/active');
        if (response.ok) {
          const data = await response.json();
          setActiveSessions(data);
        }
      } else if (activeTab === 'logs') {
        const response = await fetch('/api/session-logs?limit=50');
        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs);
        }
      } else if (activeTab === 'events') {
        const response = await fetch('/api/security-events?limit=50');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Deseja realmente revogar esta sessão?')) return;

    try {
      const response = await fetch(
        `/api/session-logs/active?sessionId=${sessionId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        alert('Sessão revogada com sucesso!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao revogar sessão:', error);
      alert('Erro ao revogar sessão');
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm('Deseja realmente revogar TODAS as outras sessões?')) return;

    try {
      // Pegar token da sessão atual (simplificado)
      const currentSession = activeSessions[0]; // Assumindo que a primeira é a atual

      const response = await fetch('/api/session-logs/revoke-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSessionToken: currentSession?.sessionToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao revogar sessões:', error);
      alert('Erro ao revogar sessões');
    }
  };

  const resolveEvent = async (eventId: string) => {
    try {
      const response = await fetch(
        `/api/security-events?eventId=${eventId}`,
        {
          method: 'PATCH',
        }
      );

      if (response.ok) {
        alert('Evento marcado como resolvido!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao resolver evento:', error);
      alert('Erro ao resolver evento');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔒 Segurança & Sessões</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'sessions'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Sessões Ativas
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'logs'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Histórico de Logs
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'events'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Eventos de Segurança
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Sessões Ativas */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  {activeSessions.length} sessão(ões) ativa(s)
                </p>
                {activeSessions.length > 1 && (
                  <button
                    onClick={revokeAllSessions}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Revogar Todas as Outras
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {session.device || 'Dispositivo Desconhecido'} -{' '}
                          {session.browser || 'Navegador Desconhecido'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.os || 'SO Desconhecido'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          IP: {session.ipAddress || 'N/A'}
                        </p>
                        {session.city && session.country && (
                          <p className="text-sm text-gray-500">
                            Localização: {session.city}, {session.country}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Expira em:{' '}
                          {format(new Date(session.expires), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <button
                        onClick={() => revokeSession(session.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Revogar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico de Logs */}
          {activeTab === 'logs' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Ação
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Dispositivo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      IP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Localização
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium">{log.action}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p>{log.device || 'N/A'}</p>
                          <p className="text-gray-500">{log.browser}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{log.ipAddress || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        {log.city && log.country
                          ? `${log.city}, ${log.country}`
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            log.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.success ? 'Sucesso' : 'Falha'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Eventos de Segurança */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(
                            event.severity
                          )}`}
                        >
                          {event.severity}
                        </span>
                        <span className="text-sm font-medium">
                          {event.eventType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {event.description}
                      </p>
                      {event.ipAddress && (
                        <p className="text-sm text-gray-500">IP: {event.ipAddress}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.resolved ? (
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                          ✓ Resolvido
                        </span>
                      ) : (
                        <button
                          onClick={() => resolveEvent(event.id)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Resolver
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
