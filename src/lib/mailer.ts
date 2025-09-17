import nodemailer from "nodemailer";

// Creates a transporter. If SMTP env vars are missing, fall back to Ethereal for local dev.
async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Create Ethereal test account when no SMTP provided
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

export async function sendVerificationEmail(to: string, code: string) {
  const transporter = await getTransporter();
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@example.com";
  const subject = "Seu código de verificação";
  const text = `Seu código de verificação é: ${code}. Ele expira em 10 minutos.`;
  const html = `<p>Seu código de verificação é: <strong>${code}</strong>.</p><p>Ele expira em 10 minutos.</p>`;

  const info = await transporter.sendMail({ from, to, subject, text, html });

  // If using Ethereal, log preview URL for development
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.info("Preview email:", preview);

  return info;
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const transporter = await getTransporter();
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@example.com";
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const subject = "Redefinição de senha - Sistema Financeiro";
  const text = `
    Você solicitou a redefinição de senha para sua conta.
    
    Clique no link abaixo para redefinir sua senha:
    ${resetUrl}
    
    Este link expira em 1 hora.
    
    Se você não solicitou esta redefinição, ignore este email.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Redefinição de senha</h2>
      <p>Você solicitou a redefinição de senha para sua conta no Sistema de Gerenciamento Financeiro.</p>
      
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Redefinir Senha
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      
      <p style="font-size: 14px; color: #666;">
        Este link expira em <strong>1 hora</strong>.
      </p>
      
      <p style="font-size: 14px; color: #666;">
        Se você não solicitou esta redefinição, ignore este email com segurança.
      </p>
    </div>
  `;

  const info = await transporter.sendMail({ from, to, subject, text, html });

  // If using Ethereal, log preview URL for development
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.info("Preview password reset email:", preview);

  return info;
}
