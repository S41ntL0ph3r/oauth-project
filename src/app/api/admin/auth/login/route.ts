import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword } from '@/lib/admin/security';
import { generateAdminToken, createSecureCookie } from '@/lib/admin/jwt';
import { getClientIP, getClientUserAgent, checkRateLimit, validateAndSanitize } from '@/lib/admin/security';

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Rate limiting por IP
    const rateLimit = checkRateLimit(`admin-login:${clientIP}`, 5, 15 * 60 * 1000); // 5 tentativas por 15 min
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validação e sanitização
    const validation = validateAndSanitize(body, {
      email: { required: true, type: 'email', maxLength: 254 },
      password: { required: true, type: 'string', minLength: 1, maxLength: 100 }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.sanitized as { email: string; password: string };

    // Buscar admin no banco
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        status: true,
        lastLogin: true
      }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar se admin está ativo
    if (admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Conta suspensa. Entre em contato com o administrador.' },
        { status: 403 }
      );
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = generateAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });

    // Atualizar último login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Registrar log de login
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        details: { success: true },
        ipAddress: clientIP,
        userAgent: getClientUserAgent(request)
      }
    });

    // Criar cookie seguro
    const cookie = createSecureCookie(token);
    
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });

    response.cookies.set(cookie);
    
    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
