import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// POST: Revogar todas as sessões do usuário (exceto a atual)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { currentSessionToken } = body;

    // Buscar todas as sessões do usuário
    const userSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Filtrar para remover a sessão atual
    const sessionsToRevoke = userSessions.filter(
      (s) => s.sessionToken !== currentSessionToken
    );

    // Deletar todas as outras sessões
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        sessionToken: {
          not: currentSessionToken,
        },
      },
    });

    // Registrar logs para cada sessão revogada
    if (session.user?.id) {
      await Promise.all(
        sessionsToRevoke.map((s) =>
          prisma.sessionLog.create({
            data: {
              userId: session.user!.id!,
              sessionToken: s.sessionToken,
              action: 'logout',
              success: true,
              metadata: { reason: 'revoke_all_sessions' },
            },
          })
        )
      );
    }

    return NextResponse.json({
      message: 'Todas as outras sessões foram revogadas',
      revokedCount: sessionsToRevoke.length,
    });
  } catch (error) {
    console.error('Erro ao revogar todas as sessões:', error);
    return NextResponse.json(
      { error: 'Erro ao revogar sessões' },
      { status: 500 }
    );
  }
}
