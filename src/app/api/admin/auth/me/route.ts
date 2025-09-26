import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedAdminFromRequest } from '@/lib/admin/jwt';

export async function GET(request: NextRequest) {
  try {
    const admin = getAuthenticatedAdminFromRequest(request);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar dados atualizados do admin
    const adminData = await prisma.admin.findUnique({
      where: { id: admin.adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!adminData || adminData.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Admin não encontrado ou inativo' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: adminData
    });

  } catch (error) {
    console.error('Admin me error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
