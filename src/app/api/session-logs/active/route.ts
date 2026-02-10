import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: Buscar sessões ativas do usuário
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar todas as sessões ativas do usuário
    const activeSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        expires: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Para cada sessão, buscar o último log correspondente
    const sessionsWithDetails = await Promise.all(
      activeSessions.map(async (sess) => {
        const lastLog = await prisma.sessionLog.findFirst({
          where: {
            userId: session.user?.id || '',
            sessionToken: sess.sessionToken,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          ...sess,
          device: lastLog?.device,
          browser: lastLog?.browser,
          os: lastLog?.os,
          ipAddress: lastLog?.ipAddress,
          country: lastLog?.country,
          city: lastLog?.city,
          lastActivity: lastLog?.createdAt,
        };
      })
    );

    return NextResponse.json(sessionsWithDetails);
  } catch (error) {
    console.error('Erro ao buscar sessões ativas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sessões' },
      { status: 500 }
    );
  }
}

// DELETE: Revogar sessão específica
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a sessão pertence ao usuário
    const sessionToDelete = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!sessionToDelete) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Deletar a sessão
    await prisma.session.delete({
      where: {
        id: sessionId,
      },
    });

    // Registrar log
    if (session.user?.id) {
      await prisma.sessionLog.create({
        data: {
          userId: session.user.id,
          sessionToken: sessionToDelete.sessionToken,
          action: 'logout',
          success: true,
          metadata: { reason: 'manual_revoke' },
        },
      });
    }

    return NextResponse.json({ message: 'Sessão revogada com sucesso' });
  } catch (error) {
    console.error('Erro ao revogar sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao revogar sessão' },
      { status: 500 }
    );
  }
}
