import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@/lib/auth';

interface SendEmailRequest {
  type: 'reset' | 'verify';
  email: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado (opcional)
    // const session = await auth();
    
    const { type, email, token }: SendEmailRequest = await request.json();

    if (!type || !email || !token) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: type, email, token' },
        { status: 400 }
      );
    }

    // Aqui as chaves ficam no servidor (mais seguro)
    const serviceId = process.env.EMAILJS_SERVICE_ID; // Sem NEXT_PUBLIC_
    const templateId = type === 'reset' 
      ? process.env.EMAILJS_TEMPLATE_RESET_PASSWORD
      : process.env.EMAILJS_TEMPLATE_VERIFY_EMAIL;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      return NextResponse.json(
        { error: 'Configuração EmailJS incompleta' },
        { status: 500 }
      );
    }

    const resetLink = type === 'reset' 
      ? `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
      : `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: email,
          email: email,
          link: resetLink,
          user_name: email.split('@')[0],
          app_name: 'OAuth Project',
          from_name: 'OAuth Project Team',
          subject: type === 'reset' ? 'Reset de Senha' : 'Verificar Email',
          message: type === 'reset' ? 'Link para resetar sua senha' : 'Link para verificar seu email',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS API erro:', errorText);
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro no endpoint de email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
