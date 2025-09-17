import { APP_CONFIG } from './app-config';

export interface EmailData {
  to_email: string;
  email?: string; // Compatibilidade com templates
  to_name?: string;
  user_name?: string;
  subject: string;
  message: string;
  from_name?: string;
  reset_link?: string;
  link?: string; // Para template de reset
  verification_link?: string;
  app_name?: string;
  support_email?: string;
  welcome_message?: string;
  [key: string]: unknown; // Adicionar índice de assinatura
}

export const sendEmail = async (templateData: EmailData, templateType: 'reset' | 'verify' = 'reset'): Promise<boolean> => {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = templateType === 'reset' 
      ? process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_RESET_PASSWORD
      : process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_VERIFY_EMAIL;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error(`EmailJS não está configurado corretamente para ${templateType}. Verifique as variáveis de ambiente.`);
      return false;
    }

    // Usar fetch API para envio server-side
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`EmailJS API erro (${response.status}):`, errorText);
      return false;
    }

    const result = await response.text();
    console.log(`Email ${templateType} enviado com sucesso:`, result);
    return true;
  } catch (error) {
    console.error(`Erro ao enviar email ${templateType}:`, error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  const resetLink = `${APP_CONFIG.url}/reset-password?token=${resetToken}`;
  
  const emailData: EmailData = {
    to_email: email,
    email: email, // Para compatibilidade com template
    link: resetLink, // Variável específica do template de reset
    user_name: email.split('@')[0],
    app_name: APP_CONFIG.name,
    from_name: APP_CONFIG.emails.from.reset,
    subject: APP_CONFIG.emails.subjects.reset,
    message: APP_CONFIG.emails.messages.reset,
    reset_link: resetLink,
    support_email: APP_CONFIG.support.email
  };

  return await sendEmail(emailData, 'reset');
};

export const sendVerificationEmail = async (email: string, verificationToken: string): Promise<boolean> => {
  const verificationLink = `${APP_CONFIG.url}/api/auth/verify?token=${verificationToken}`;
  
  const emailData: EmailData = {
    to_email: email,
    email: email, // Para compatibilidade com template
    user_name: email.split('@')[0],
    subject: APP_CONFIG.emails.subjects.verify,
    message: APP_CONFIG.emails.messages.verify,
    from_name: APP_CONFIG.emails.from.verify,
    verification_link: verificationLink,
    reset_link: verificationLink, // Alguns templates usam esta variável
    app_name: APP_CONFIG.name,
    welcome_message: APP_CONFIG.emails.messages.welcome
  };

  return await sendEmail(emailData, 'verify');
};

const emailService = {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};

export default emailService;
