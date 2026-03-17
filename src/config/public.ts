const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

export const publicEnv = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? process.env.POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
} as const;
