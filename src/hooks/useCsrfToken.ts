/**
 * Hook para verificar CSRF Token usando NextAuth
 */
'use client';

import { useEffect, useState } from 'react';
import { getCsrfToken } from 'next-auth/react';

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token || null);
    };
    fetchToken();
  }, []);

  return csrfToken;
}

/**
 * Adiciona CSRF token aos headers de uma requisição
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}) {
  const csrfToken = await getCsrfToken();
  
  const headers = new Headers(options.headers);
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
