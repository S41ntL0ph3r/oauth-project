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
    const eventType = searchParams.get('eventType');
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    } else {
      // Mostrar eventos do próprio usuário
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
    console.error('Erro ao buscar eventos de segurança:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    );
  }
}

// POST: Criar evento de segurança
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
        { error: 'eventType, severity e description são obrigatórios' },
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
    console.error('Erro ao criar evento de segurança:', error);
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    );
  }
}

// PATCH: Marcar evento como resolvido
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId é obrigatório' },
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
    console.error('Erro ao resolver evento:', error);
    return NextResponse.json(
      { error: 'Erro ao resolver evento' },
      { status: 500 }
    );
  }
}
