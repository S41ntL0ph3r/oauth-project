import { env } from '@/config/env';
import { AppError } from '@/server/errors/app-error';
import { buildPasswordResetTemplate, buildTestTemplate, buildVerificationTemplate } from '@/services/email/emailTemplates';
import { getBrevoClient } from '@/services/email/brevoClient';
import { EmailRecipient, EmailSendResult } from '@/types/email';

interface SendEmailInput {
  recipient: EmailRecipient;
  subject: string;
  html: string;
  text: string;
  tags?: string[];
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(input: SendEmailInput, attempt: number = 1): Promise<EmailSendResult> {
  try {
    const client = getBrevoClient();
    const response = await client.transactionalEmails.sendTransacEmail({
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
      sender: {
        email: env.brevo.senderEmail!,
        name: env.brevo.senderName,
      },
      to: [{ email: input.recipient.email, name: input.recipient.name }],
      tags: input.tags,
    });

    return {
      success: true,
      provider: 'brevo',
      messageId: response.messageId,
    };
  } catch (error) {
    const isRetryable = attempt < 3;

    if (isRetryable) {
      await wait(250 * attempt);
      return sendWithRetry(input, attempt + 1);
    }

    console.error('Brevo email delivery failed:', error);
    return {
      success: false,
      provider: 'brevo',
      error: error instanceof Error ? error.message : 'Unknown email provider error',
    };
  }
}

export const emailService = {
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const content = buildPasswordResetTemplate({ email, resetToken });
    return sendWithRetry({
      recipient: { email, name: email.split('@')[0] },
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: ['password-reset'],
    });
  },

  async sendVerificationEmail(email: string, verificationToken: string) {
    const content = buildVerificationTemplate({ email, verificationToken });
    return sendWithRetry({
      recipient: { email, name: email.split('@')[0] },
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: ['email-verification'],
    });
  },

  async sendTestEmail(email: string, subject?: string, message?: string) {
    const content = buildTestTemplate({ email, subject, message });
    return sendWithRetry({
      recipient: { email, name: email.split('@')[0] },
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: ['test-email'],
    });
  },

  assertSuccess(result: EmailSendResult, fallbackMessage: string) {
    if (!result.success) {
      throw new AppError(result.error ?? fallbackMessage, 502, 'EMAIL_DELIVERY_FAILED');
    }
  },
};
