import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, validateAndSanitize, isStrongPassword, getClientIP, getClientUserAgent } from '@/lib/admin/security';
import { generateAdminToken, createSecureCookie } from '@/lib/admin/jwt';

export async function POST(request: NextRequest) {
  try {
    // Verificar se já existe algum admin
    const existingAdminCount = await prisma.admin.count();
    
    if (existingAdminCount > 0) {
      return NextResponse.json(
        { error: 'Sistema já foi configurado. Entre em contato com um administrador.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validação e sanitização
    const validation = validateAndSanitize(body, {
      name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
      email: { required: true, type: 'email', maxLength: 254 },
      password: { required: true, type: 'string', minLength: 8, maxLength: 100 }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.sanitized as { 
      name: string; 
      email: string; 
      password: string; 
    };

    // Validar força da senha
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { 
          error: 'Senha muito fraca. Deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.' 
        },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar primeiro admin como SUPER_ADMIN
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Registrar log de criação
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_CREATED',
        details: { 
          isFirstAdmin: true,
          role: 'SUPER_ADMIN'
        },
        ipAddress: getClientIP(request),
        userAgent: getClientUserAgent(request)
      }
    });

    // Gerar token JWT para login automático
    const token = generateAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });

    // Criar cookie seguro
    const cookie = createSecureCookie(token);
    
    const response = NextResponse.json({
      success: true,
      message: 'Primeiro administrador criado com sucesso!',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });

    response.cookies.set(cookie);
    
    return response;

  } catch (error) {
    console.error('Setup admin error:', error);
    
    // Erro de email duplicado
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
