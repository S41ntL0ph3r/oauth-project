import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedAdminFromRequest, createLogoutCookie } from '@/lib/admin/jwt';
import { getClientIP, getClientUserAgent } from '@/lib/admin/security';

export async function POST(request: NextRequest) {
  try {
    const admin = getAuthenticatedAdminFromRequest(request);
    
    if (admin) {
      // Registrar log de logout
      await prisma.adminLog.create({
        data: {
          adminId: admin.adminId,
          action: 'LOGOUT',
          details: { success: true },
          ipAddress: getClientIP(request),
          userAgent: getClientUserAgent(request)
        }
      });
    }

    // Criar cookie de logout
    const logoutCookie = createLogoutCookie();
    
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

    response.cookies.set(logoutCookie);
    
    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Permitir logout via GET também (para links de logout)
  return POST(request);
}
