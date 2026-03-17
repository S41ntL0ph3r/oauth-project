import * as brevo from '@getbrevo/brevo';
import { env } from '@/config/env';
import { ConfigurationError } from '@/server/errors/app-error';

let brevoClient: brevo.BrevoClient | null = null;

export function getBrevoClient() {
  if (!env.brevo.apiKey) {
    throw new ConfigurationError('BREVO_API_KEY is not configured');
  }

  if (!env.brevo.senderEmail) {
    throw new ConfigurationError('BREVO_SENDER_EMAIL is not configured');
  }

  if (!brevoClient) {
    brevoClient = new brevo.BrevoClient({
      apiKey: env.brevo.apiKey,
      maxRetries: 3,
    });
  }

  return brevoClient;
}
