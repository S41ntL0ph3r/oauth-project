import APP_CONFIG from '@/config/app';
import {
  EmailTemplateContent,
  PasswordResetTemplateProps,
  TestEmailTemplateProps,
  VerificationTemplateProps,
} from '@/types/email';

function getDisplayName(email: string) {
  return email.split('@')[0];
}

export function buildPasswordResetTemplate({ email, resetToken }: PasswordResetTemplateProps): EmailTemplateContent {
  const resetUrl = `${APP_CONFIG.url}/reset-password?token=${resetToken}`;
  const name = getDisplayName(email);

  return {
    subject: APP_CONFIG.emails.subjects.reset,
    text: [
      `Olá, ${name}.`,
      '',
      'Recebemos uma solicitação para redefinir sua senha.',
      `Acesse o link: ${resetUrl}`,
      '',
      `Este link expira em ${APP_CONFIG.tokens.reset.expirationTime}.`,
      'Se você não solicitou esta alteração, ignore este email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 16px;">Redefinição de senha</h2>
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p>Este link expira em <strong>${APP_CONFIG.tokens.reset.expirationTime}</strong>.</p>
        <p>Se você não solicitou esta alteração, ignore este email com segurança.</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">${resetUrl}</p>
      </div>
    `,
  };
}

export function buildVerificationTemplate({ email, verificationToken }: VerificationTemplateProps): EmailTemplateContent {
  const verificationUrl = `${APP_CONFIG.url}/api/auth/verify?token=${verificationToken}`;
  const name = getDisplayName(email);

  return {
    subject: APP_CONFIG.emails.subjects.verify,
    text: [
      `Olá, ${name}.`,
      '',
      'Sua conta foi criada com sucesso.',
      `Confirme seu email acessando: ${verificationUrl}`,
      '',
      `Este link expira em ${APP_CONFIG.tokens.verify.expirationTime}.`,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 16px;">Confirme seu email</h2>
        <p>Olá, <strong>${name}</strong>.</p>
        <p>${APP_CONFIG.emails.messages.verify}</p>
        <p style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Verificar email
          </a>
        </p>
        <p>Este link expira em <strong>${APP_CONFIG.tokens.verify.expirationTime}</strong>.</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">${verificationUrl}</p>
      </div>
    `,
  };
}

export function buildTestTemplate({ email, subject, message }: TestEmailTemplateProps): EmailTemplateContent {
  const name = getDisplayName(email);

  return {
    subject: subject ?? 'Teste de configuração de email',
    text: [
      `Olá, ${name}.`,
      '',
      message ?? 'Este email confirma que a integração com o provedor está funcionando corretamente.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 16px;">Teste de integração de email</h2>
        <p>Olá, <strong>${name}</strong>.</p>
        <p>${message ?? 'Este email confirma que a integração com o provedor está funcionando corretamente.'}</p>
      </div>
    `,
  };
}
