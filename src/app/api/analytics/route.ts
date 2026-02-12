import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // days
    const metric = searchParams.get('metric');

    const days = parseInt(period);
    const startDate = subDays(new Date(), days);

    // If a specific metric was requested
    if (metric) {
      const data = await prisma.analytics.findMany({
        where: {
          metric,
          date: {
            gte: startDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      return NextResponse.json(data);
    }

    // Fetch all metrics for the period
    const [
      totalUsers,
      newUsersToday,
      activeSessionsCount,
      totalSessionLogs,
      securityEventsCount,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New users today
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          },
        },
      }),

      // Sessões ativas
      prisma.session.count({
        where: {
          expires: {
            gte: new Date(),
          },
        },
      }),

      // Total de logs de sessão no período
      prisma.sessionLog.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Eventos de segurança não resolvidos
      prisma.securityEvent.count({
        where: {
          resolved: false,
        },
      }),
    ]);

    // Processar dados para gráfico de crescimento
    const userGrowth = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
      });

      userGrowth.push({
        date: format(date, 'dd/MM'),
        count,
      });
    }

    // Logins por dia
    const loginsByDay = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const count = await prisma.sessionLog.count({
        where: {
          action: 'login',
          success: true,
          createdAt: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
      });

      loginsByDay.push({
        date: format(date, 'dd/MM'),
        count,
      });
    }

    // Taxa de verificação de email
    const verifiedUsers = await prisma.user.count({
      where: { emailVerified: { not: null } },
    });

    const verificationRate = totalUsers > 0 
      ? ((verifiedUsers / totalUsers) * 100).toFixed(1)
      : '0';

    // Dispositivos mais usados
    const topDevices = await prisma.sessionLog.groupBy({
      by: ['device'],
      _count: true,
      where: {
        device: { not: null },
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        _count: {
          device: 'desc',
        },
      },
      take: 5,
    });

    // Navegadores mais usados
    const topBrowsers = await prisma.sessionLog.groupBy({
      by: ['browser'],
      _count: true,
      where: {
        browser: { not: null },
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        _count: {
          browser: 'desc',
        },
      },
      take: 5,
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsersToday,
        activeSessions: activeSessionsCount,
        totalSessionLogs,
        securityEventsCount,
        verificationRate,
      },
      charts: {
        userGrowth,
        loginsByDay,
      },
      demographics: {
        devices: topDevices.map(d => ({
          name: d.device || 'Unknown',
          value: d._count,
        })),
        browsers: topBrowsers.map(b => ({
          name: b.browser || 'Unknown',
          value: b._count,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Error fetching metrics' },
      { status: 500 }
    );
  }
}

// POST: Registrar métrica personalizada
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { metric, value, metadata } = body;

    if (!metric || value === undefined) {
      return NextResponse.json(
        { error: 'Metric and value are required' },
        { status: 400 }
      );
    }

    const analytics = await prisma.analytics.create({
      data: {
        metric,
        value: parseFloat(value),
        metadata: metadata || {},
      },
    });

    return NextResponse.json(analytics, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'Error creating metric' },
      { status: 500 }
    );
  }
}
