// Configurações centralizadas do aplicativo
export const APP_CONFIG = {
  name: 'OAuth Project',
  url: process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000',
  support: {
    email: 'suporte@oauthproject.com',
    name: 'OAuth Project - Suporte'
  },
  emails: {
    from: {
      reset: 'OAuth Project - Suporte',
      verify: 'OAuth Project - Boas-vindas',
      test: 'OAuth Project - Teste'
    },
    subjects: {
      reset: 'Redefinição de Senha - OAuth Project',
      verify: 'Bem-vindo ao OAuth Project! Confirme seu email',
      resetTest: 'Redefinição de Senha - OAuth Project (Teste)',
      verifyTest: 'Bem-vindo ao OAuth Project! (Teste)'
    },
    messages: {
      reset: 'Você solicitou a redefinição de sua senha. Este link é válido por 1 hora.',
      verify: 'Obrigado por se cadastrar! Para completar seu registro e ativar sua conta, confirme seu email.',
      welcome: 'Seja bem-vindo ao OAuth Project!',
      resetTest: 'Este é um teste do template de redefinição de senha.',
      verifyTest: 'Este é um teste do template de verificação de email.'
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
