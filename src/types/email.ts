export type EmailTemplateName = 'password-reset' | 'email-verification' | 'test-email';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface PasswordResetTemplateProps {
  email: string;
  resetToken: string;
}

export interface VerificationTemplateProps {
  email: string;
  verificationToken: string;
}

export interface TestEmailTemplateProps {
  email: string;
  subject?: string;
  message?: string;
}

export interface EmailTemplateContent {
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: 'brevo';
  error?: string;
}
