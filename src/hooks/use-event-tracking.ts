'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import posthog from 'posthog-js';
import { ANALYTICS_EVENTS } from '@/types/analytics';
import type { AnalyticsEventName, AnalyticsProperties } from '@/types/analytics';

export function useEventTracking() {
  const { data: session } = useSession();

  const capture = useCallback(
    (event: AnalyticsEventName, properties?: AnalyticsProperties) => {
      const distinctId = session?.user?.email ?? session?.user?.id ?? 'anonymous';

      posthog.capture(event, {
        distinct_id: distinctId,
        ...properties,
      });
    },
    [session?.user?.email, session?.user?.id],
  );

  return {
    capture,
    events: ANALYTICS_EVENTS,
  };
}
