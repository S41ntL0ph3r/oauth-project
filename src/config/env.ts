const DEFAULT_APP_URL = 'http://localhost:3000';
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

type ServerEnvKey =
  | 'DATABASE_URL'
  | 'AUTH_SECRET'
  | 'AUTH_GITHUB_ID'
  | 'AUTH_GITHUB_SECRET'
  | 'BREVO_API_KEY'
  | 'BREVO_SENDER_EMAIL'
  | 'BREVO_SENDER_NAME'
  | 'POSTHOG_API_KEY'
  | 'POSTHOG_HOST';

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export function requireServerEnv(name: ServerEnvKey): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: getEnv('NEXTAUTH_URL') ?? DEFAULT_APP_URL,
  databaseUrl: getEnv('DATABASE_URL'),
  authSecret: getEnv('AUTH_SECRET'),
  github: {
    clientId: getEnv('AUTH_GITHUB_ID'),
    clientSecret: getEnv('AUTH_GITHUB_SECRET'),
  },
  brevo: {
    apiKey: getEnv('BREVO_API_KEY'),
    senderEmail: getEnv('BREVO_SENDER_EMAIL') ?? getEnv('FROM_EMAIL'),
    senderName: getEnv('BREVO_SENDER_NAME') ?? 'OAuth Project',
  },
  posthog: {
    apiKey: getEnv('POSTHOG_API_KEY'),
    host: getEnv('POSTHOG_HOST') ?? getEnv('NEXT_PUBLIC_POSTHOG_HOST') ?? DEFAULT_POSTHOG_HOST,
  },
  public: {
    posthogKey: getEnv('NEXT_PUBLIC_POSTHOG_KEY'),
    posthogHost: getEnv('NEXT_PUBLIC_POSTHOG_HOST') ?? getEnv('POSTHOG_HOST') ?? DEFAULT_POSTHOG_HOST,
  },
} as const;

export type AppEnv = typeof env;
