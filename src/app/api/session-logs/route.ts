import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Se userId for fornecido, filtrar por usuário específico
    if (userId) {
      where.userId = userId;
    } else {
      // Caso contrário, mostrar apenas os logs do usuário logado
      where.userId = session.user.id;
    }

    if (action) {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      prisma.sessionLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.sessionLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar logs de sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    );
  }
}

// POST: Criar log de sessão
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionToken,
      action,
      ipAddress,
      userAgent,
      device,
      browser,
      os,
      country,
      city,
      success,
      failReason,
      duration,
      metadata,
    } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId e action são obrigatórios' },
        { status: 400 }
      );
    }

    const log = await prisma.sessionLog.create({
      data: {
        userId,
        sessionToken,
        action,
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        country,
        city,
        success: success !== undefined ? success : true,
        failReason,
        duration,
        metadata: metadata || {},
      },
    });

    // Se for tentativa de login falhada, criar evento de segurança
    if (action === 'login' && !success) {
      await prisma.securityEvent.create({
        data: {
          userId,
          eventType: 'FAILED_LOGIN',
          severity: 'LOW',
          description: `Tentativa de login falhada: ${failReason || 'Credenciais inválidas'}`,
          ipAddress,
          userAgent,
          metadata: { logId: log.id },
        },
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar log de sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar log' },
      { status: 500 }
    );
  }
}
