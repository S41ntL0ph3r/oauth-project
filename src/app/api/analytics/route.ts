import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { requireAuthenticatedUser } from '@/server/auth/user-session';
import { withApiHandler, apiResponse } from '@/server/http/route';
import { analyticsService } from '@/services/analytics/analyticsService';

export async function GET(request: Request) {
  return withApiHandler(async () => {
    await requireAuthenticatedUser();

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

      return data;
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

      // Total session logs in the period
      prisma.sessionLog.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Unresolved security events
      prisma.securityEvent.count({
        where: {
          resolved: false,
        },
      }),
    ]);

    // Process data for growth chart
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

    // Logins per day
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

    // Email verification rate
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

    return {
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
        devices: topDevices.map((d: { device: string | null; _count: number | { device?: number } }) => ({
          name: d.device || 'Unknown',
          value: typeof d._count === 'number' ? d._count : (d._count.device ?? 0),
        })),
        browsers: topBrowsers.map((b: { browser: string | null; _count: number | { browser?: number } }) => ({
          name: b.browser || 'Unknown',
          value: typeof b._count === 'number' ? b._count : (b._count.browser ?? 0),
        })),
      },
    };
  });
}

// POST: Registrar métrica personalizada
export async function POST(request: Request) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser();

    const body = await request.json();
    const { metric, value, metadata } = body;

    if (!metric || value === undefined) {
      return apiResponse(
        { error: 'Metric and value are required' },
        400,
      );
    }

    const analytics = await analyticsService.recordMetric(metric, parseFloat(value), metadata || {});

    await analyticsService.captureServerEvent({
      event: 'feature_visited',
      distinctId: user.id,
      properties: {
        metric,
        value: parseFloat(value),
      },
    });

    return apiResponse(analytics, 201);
  });
}
