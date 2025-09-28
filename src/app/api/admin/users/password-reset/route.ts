import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, AdminJWTPayload } from '@/lib/admin/jwt';
import { generateSecureToken, getClientIP, getClientUserAgent } from '@/lib/admin/security';

// POST - Solicitar reset de senha para um usuário
export const POST = requireAuth(async (request: NextRequest & { admin?: AdminJWTPayload }) => {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou sem email' },
        { status: 404 }
      );
    }

    // Gerar token de reset
    const resetToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Invalidar tokens antigos e criar novo
    await prisma.passwordResetToken.updateMany({
      where: { email: user.email, used: false },
      data: { used: true }
    });

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token: resetToken,
        expires: expiresAt
      }
    });

    // Log da ação
    if (request.admin) {
      await prisma.adminLog.create({
        data: {
          adminId: request.admin.adminId,
          action: 'PASSWORD_RESET_REQUESTED',
          target: userId,
          targetType: 'user',
          details: JSON.parse(JSON.stringify({
            userEmail: user.email,
            userName: user.name,
            tokenExpires: expiresAt.toISOString(),
            requestedByAdmin: true
          })),
          ipAddress: getClientIP(request),
          userAgent: getClientUserAgent(request)
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Token de reset criado com sucesso',
      resetToken: resetToken, // Em produção, envie por email
      resetLink: `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Erro ao solicitar reset de senha' },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'ADMIN']);
