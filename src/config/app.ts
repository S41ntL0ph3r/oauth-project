import { env } from '@/config/env';

export const APP_CONFIG = {
  name: 'OAuth Project',
  url: env.appUrl,
  support: {
    email: env.brevo.senderEmail ?? 'suporte@oauthproject.com',
    name: `${env.brevo.senderName} - Suporte`,
  },
  emails: {
    from: {
      reset: env.brevo.senderName,
      verify: env.brevo.senderName,
      test: `${env.brevo.senderName} Test`,
    },
    subjects: {
      reset: 'Password Reset - OAuth Project',
      verify: 'Welcome to OAuth Project! Confirm your email',
      resetTest: 'Password Reset - OAuth Project (Test)',
      verifyTest: 'Welcome to OAuth Project! (Test)',
    },
    messages: {
      reset: 'You requested to reset your password. This link is valid for 1 hour.',
      verify: 'Thank you for signing up! To complete your registration and activate your account, confirm your email.',
      welcome: 'Welcome to OAuth Project!',
      resetTest: 'This is a test of the password reset template.',
      verifyTest: 'This is a test of the email verification template.',
    },
  },
  tokens: {
    reset: {
      expirationTime: '1 hora',
      expirationMs: 3600000,
    },
    verify: {
      expirationTime: '24 horas',
      expirationMs: 86400000,
    },
  },
} as const;

export default APP_CONFIG;
