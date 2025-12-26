import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdminFromRequest } from '@/lib/admin/jwt';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const adminData = getAuthenticatedAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar estatísticas do dashboard
    const [totalUsers, totalAdmins, totalProducts, recentLogs] = await Promise.all([
      db.user.count(),
      db.admin.count(),
      db.product.count(),
      db.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    // Calcular estatísticas adicionais
    const activeUsers = await db.user.count({
      where: {
        emailVerified: { not: null }
      }
    });

    const activeProducts = await db.product.count({
      where: {
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalAdmins,
        totalProducts,
        activeProducts
      },
      recentLogs
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}