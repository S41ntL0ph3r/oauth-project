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
