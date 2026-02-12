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
    const eventType = searchParams.get('eventType');
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    } else {
      // Show user's own events
      where.userId = session.user.id;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (severity) {
      where.severity = severity;
    }

    if (resolved !== null && resolved !== undefined) {
      where.resolved = resolved === 'true';
    }

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Error fetching events' },
      { status: 500 }
    );
  }
}

// POST: Create security event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      eventType,
      severity,
      description,
      ipAddress,
      userAgent,
      metadata,
    } = body;

    if (!eventType || !severity || !description) {
      return NextResponse.json(
        { error: 'eventType, severity and description are required' },
        { status: 400 }
      );
    }

    const event = await prisma.securityEvent.create({
      data: {
        userId,
        eventType,
        severity,
        description,
        ipAddress,
        userAgent,
        metadata: metadata || {},
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating security event:', error);
    return NextResponse.json(
      { error: 'Error creating event' },
      { status: 500 }
    );
  }
}

// PATCH: Mark event as resolved
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    const event = await prisma.securityEvent.update({
      where: {
        id: eventId,
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error resolving event:', error);
    return NextResponse.json(
      { error: 'Error resolving event' },
      { status: 500 }
    );
  }
}
