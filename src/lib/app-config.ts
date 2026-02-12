// Configurações centralizadas do aplicativo
export const APP_CONFIG = {
  name: 'OAuth Project',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  support: {
    email: 'suporte@oauthproject.com',
    name: 'OAuth Project - Suporte'
  },
  emails: {
    from: {
      reset: 'OAuth Project - Support',
      verify: 'OAuth Project - Welcome',
      test: 'OAuth Project - Test'
    },
    subjects: {
      reset: 'Password Reset - OAuth Project',
      verify: 'Welcome to OAuth Project! Confirm your email',
      resetTest: 'Password Reset - OAuth Project (Test)',
      verifyTest: 'Welcome to OAuth Project! (Test)'
    },
    messages: {
      reset: 'You requested to reset your password. This link is valid for 1 hour.',
      verify: 'Thank you for signing up! To complete your registration and activate your account, confirm your email.',
      welcome: 'Welcome to OAuth Project!',
      resetTest: 'This is a test of the password reset template.',
      verifyTest: 'This is a test of the email verification template.'
    }
  },
  tokens: {
    reset: {
      expirationTime: '1 hora',
      expirationMs: 3600000 // 1 hora em millisegundos
    },
    verify: {
      expirationTime: '24 horas',
      expirationMs: 86400000 // 24 horas em millisegundos
    }
  }
};

export default APP_CONFIG;
