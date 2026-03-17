import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from '@/server/errors/app-error';
import { withApiHandler, apiResponse } from '@/server/http/route';
import { emailService } from '@/services/email/emailService';

// Simple in-memory rate limiting (in production, use Redis)
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
  return withApiHandler(async () => {
    const clientIP = getClientIP(request);
    const ipLimit = checkRateLimit(`email:ip:${clientIP}`, 5, 60 * 60 * 1000); // 5 por hora por IP
    
    if (!ipLimit.allowed) {
      throw new RateLimitError('Limite de envio de emails atingido. Tente novamente mais tarde.', {
        resetTime: ipLimit.resetTime,
      });
    }
    
    const { type, email, token }: SendEmailRequest = await request.json();

    if (!type || !email || !token) {
      return apiResponse({ error: 'Dados obrigatórios: type, email, token' }, 400);
    }

    const result = type === 'reset'
      ? await emailService.sendPasswordResetEmail(email, token)
      : await emailService.sendVerificationEmail(email, token);

    emailService.assertSuccess(result, 'Erro ao enviar email');
    return { success: true, provider: result.provider };
  });
}
