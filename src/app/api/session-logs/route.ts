import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // If userId is provided, filter by specific user
    if (userId) {
      where.userId = userId;
    } else {
      // Otherwise, show only the logged-in user's logs
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
    console.error('Error fetching session logs:', error);
    return NextResponse.json(
      { error: 'Error fetching logs' },
      { status: 500 }
    );
  }
}

// POST: Create session log
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
        { error: 'userId and action are required' },
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

    // If it's a failed login attempt, create security event
    if (action === 'login' && !success) {
      await prisma.securityEvent.create({
        data: {
          userId,
          eventType: 'FAILED_LOGIN',
          severity: 'LOW',
          description: `Failed login attempt: ${failReason || 'Invalid credentials'}`,
          ipAddress,
          userAgent,
          metadata: { logId: log.id },
        },
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating session log:', error);
    return NextResponse.json(
      { error: 'Error creating log' },
      { status: 500 }
    );
  }
}
