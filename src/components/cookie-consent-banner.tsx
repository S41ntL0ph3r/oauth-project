/**
 * Componente de Cookie Consent - LGPD/GDPR
 */
'use client';

import { useState, useEffect } from 'react';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Sempre true, não pode ser desabilitado
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Verificar se já deu consentimento
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    await saveConsent(allPreferences);
    setShowBanner(false);
  };

  const handleRejectAll = async () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    await saveConsent(minimalPreferences);
    setShowBanner(false);
  };

  const handleSavePreferences = async () => {
    await saveConsent(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const saveConsent = async (prefs: typeof preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());

    // Registrar no backend se estiver autenticado
    try {
      const consentTypes = [
        { type: 'COOKIES', granted: true },
        { type: 'ANALYTICS', granted: prefs.analytics },
        { type: 'MARKETING_EMAILS', granted: prefs.marketing },
      ];

      for (const consent of consentTypes) {
        await fetch('/api/user/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consentType: consent.type,
            purpose: `Consentimento para ${consent.type}`,
            granted: consent.granted,
          }),
        });
      }
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {!showPreferences ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-1">🍪 Este site usa cookies</p>
              <p>
                Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais 
                para melhorar sua experiência. Você pode escolher quais cookies aceitar.
                {' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Apenas Essenciais
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Personalizar
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Preferências de Cookies</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cookies Essenciais</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Necessários para o funcionamento básico do site
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cookies de Analytics</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ajudam a entender como você usa o site
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cookies de Marketing</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usados para personalizar anúncios
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Voltar
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar Preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
