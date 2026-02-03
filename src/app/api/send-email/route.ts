import { NextRequest, NextResponse } from 'next/server';

// Rate limiting simples em memória (em produção, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (record.count >= limit) {
    return { allowed: false, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true };
}

interface SendEmailRequest {
  type: 'reset' | 'verify';
  email: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    // SEGURANÇA: Rate limiting rigoroso para prevenir spam
    const clientIP = getClientIP(request);
    const ipLimit = checkRateLimit(`email:ip:${clientIP}`, 5, 60 * 60 * 1000); // 5 por hora por IP
    
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Limite de envio de emails atingido. Tente novamente mais tarde.',
          resetTime: ipLimit.resetTime 
        },
        { status: 429 }
      );
    }
    
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
