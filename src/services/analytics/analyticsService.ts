import { Prisma } from '@prisma/client';
import db from '@/lib/db';
import { AnalyticsEventPayload } from '@/types/analytics';
import { getPostHogClient } from '@/services/analytics/posthogClient';

export const analyticsService = {
  async captureServerEvent(payload: AnalyticsEventPayload) {
    const client = getPostHogClient();

    if (!client) {
      return;
    }

    try {
      client.capture({
        event: payload.event,
        distinctId: payload.distinctId,
        properties: payload.properties,
      });
      await client.flush();
    } catch (error) {
      console.error('PostHog server event capture failed:', error);
    }
  },

  async recordMetric(metric: string, value: number, metadata?: Record<string, unknown>) {
    return db.analytics.create({
      data: {
        metric,
        value,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  },
};
