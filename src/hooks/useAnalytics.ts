'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseAnalyticsReturn {
  data: unknown;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar dados de analytics
 */
export function useAnalytics(period: string = '7'): UseAnalyticsReturn {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analytics?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar analytics');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
}

/**
 * Hook para gerenciar sessões ativas
 */
export function useActiveSessions() {
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/session-logs/active');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar sessões');
      }
      
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/session-logs/active?sessionId=${sessionId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Erro ao revogar sessão');
      }
      
      await fetchSessions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, [fetchSessions]);

  const revokeAllOtherSessions = useCallback(async (currentSessionToken: string) => {
    try {
      const response = await fetch('/api/session-logs/revoke-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSessionToken }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao revogar sessões');
      }
      
      await fetchSessions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
}

/**
 * Hook para gerenciar backups
 */
export function useBackups() {
  const [backups, setBackups] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/backups');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar backups');
      }
      
      const data = await response.json();
      setBackups(data.backups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackup = useCallback(async (backupData: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar backup');
      }
      
      const backup = await response.json();
      await fetchBackups();
      return backup;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  }, [fetchBackups]);

  const deleteBackup = useCallback(async (backupId: string) => {
    try {
      const response = await fetch(`/api/backups?backupId=${backupId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar backup');
      }
      
      await fetchBackups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, [fetchBackups]);

  const restoreBackup = useCallback(async (backupId: string) => {
    try {
      const response = await fetch(`/api/backups/restore?backupId=${backupId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao restaurar backup');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  return {
    backups,
    loading,
    error,
    refetch: fetchBackups,
    createBackup,
    deleteBackup,
    restoreBackup,
  };
}

/**
 * Hook para gerenciar relatórios
 */
export function useReports() {
  const [reports, setReports] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/reports');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar relatórios');
      }
      
      const data = await response.json();
      setReports(data.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar relatório');
      }
      
      const report = await response.json();
      
      // Aguardar um pouco antes de refetch para dar tempo de processar
      setTimeout(() => fetchReports(), 2000);
      
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  }, [fetchReports]);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports?reportId=${reportId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar relatório');
      }
      
      await fetchReports();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
    createReport,
    deleteReport,
  };
}

/**
 * Hook para eventos de segurança
 */
export function useSecurityEvents() {
  const [events, setEvents] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/security-events?limit=50');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar eventos');
      }
      
      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveEvent = useCallback(async (eventId: string) => {
    try {
      const response = await fetch(`/api/security-events?eventId=${eventId}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao resolver evento');
      }
      
      await fetchEvents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    resolveEvent,
  };
}
