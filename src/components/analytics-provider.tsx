'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';
import { publicEnv } from '@/config/public';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!publicEnv.posthogKey) {
      return;
    }

    posthog.init(publicEnv.posthogKey, {
      api_host: publicEnv.posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false,
      autocapture: true,
      persistence: 'localStorage+cookie',
      loaded: (instance) => {
        if (publicEnv.nodeEnv === 'development') {
          instance.debug();
        }
      },
    });

  }, []);

  useEffect(() => {
    if (!publicEnv.posthogKey || !pathname) {
      return;
    }

    const search = searchParams?.toString();
    posthog.capture('$pageview', {
      $current_url: search ? `${pathname}?${search}` : pathname,
      pathname,
    });
  }, [pathname, searchParams]);

  return children;
}
