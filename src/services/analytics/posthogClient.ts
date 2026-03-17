import { PostHog } from 'posthog-node';
import { env } from '@/config/env';

let posthogClient: PostHog | null = null;

export function getPostHogClient() {
  if (!env.posthog.apiKey) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(env.posthog.apiKey, {
      host: env.posthog.host,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}
