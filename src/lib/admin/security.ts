import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

/**
 * Hash de senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifica senha contra hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sanitiza entrada para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, (match) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return map[match];
    })
    .trim();
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valida senha forte
 */
export function isStrongPassword(password: string): boolean {
  // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
  if (password.length < 8) return false;
  
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  
  return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;
}

/**
 * Obtém IP real do cliente
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  if (cfIp) return cfIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Obtém User-Agent do cliente
 */
export function getClientUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Rate limiting simples em memória (para produção usar Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 15 * 60 * 1000 // 15 minutos
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  // Limpar dados expirados
  if (existing && now > existing.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const current = rateLimitStore.get(identifier);
  
  if (!current) {
    // Primeira request
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  // Incrementar contador
  current.count++;
  rateLimitStore.set(identifier, current);
  
  return { 
    allowed: true, 
    remaining: maxRequests - current.count, 
    resetTime: current.resetTime 
  };
}

/**
 * Limpa rate limit store periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // A cada 5 minutos

/**
 * Valida e sanitiza dados de entrada
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'email' | 'string' | 'number' | 'boolean';
}

export function validateAndSanitize(
  data: Record<string, unknown>, 
  rules: Record<string, ValidationRule>
): { isValid: boolean; errors: string[]; sanitized: Record<string, unknown> } {
  const errors: string[] = [];
  const sanitized: Record<string, unknown> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Verificar se é obrigatório
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} é obrigatório`);
      continue;
    }

    // Se não é obrigatório e está vazio, pular
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    let processedValue: unknown = value;

    // Validação de tipo
    if (rule.type === 'email') {
      if (typeof value !== 'string' || !isValidEmail(value)) {
        errors.push(`${field} deve ser um email válido`);
        continue;
      }
      processedValue = sanitizeInput(value.toLowerCase());
    } else if (rule.type === 'string') {
      processedValue = sanitizeInput(String(value));
    } else if (rule.type === 'number') {
      processedValue = Number(value);
      if (isNaN(processedValue as number)) {
        errors.push(`${field} deve ser um número válido`);
        continue;
      }
    } else if (rule.type === 'boolean') {
      processedValue = Boolean(value);
    }

    // Validação de comprimento
    if (rule.minLength && String(processedValue).length < rule.minLength) {
      errors.push(`${field} deve ter pelo menos ${rule.minLength} caracteres`);
      continue;
    }

    if (rule.maxLength && String(processedValue).length > rule.maxLength) {
      errors.push(`${field} deve ter no máximo ${rule.maxLength} caracteres`);
      continue;
    }

    // Validação de padrão
    if (rule.pattern && !rule.pattern.test(String(processedValue))) {
      errors.push(`${field} não atende ao formato exigido`);
      continue;
    }

    sanitized[field] = processedValue;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Gera token seguro para reset de senha
 */
export function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Verifica se o request tem CSRF token válido
 */
export function verifyCsrfToken(request: NextRequest, sessionToken?: string): boolean {
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken || !sessionToken) return false;
  
  // Implementação simples - em produção usar crypto seguro
  const expectedToken = Buffer.from(sessionToken).toString('base64');
  return csrfToken === expectedToken;
}
