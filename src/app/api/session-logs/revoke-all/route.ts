import { NextResponse } from 'next/server';
import type { Session } from '@prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// POST: Revoke all user sessions (except current)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentSessionToken } = body;

    // Fetch all user sessions
    const userSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
      },
    }) as Session[];

    // Filter to remove current session
    const sessionsToRevoke = userSessions.filter(
      (s: Session) => s.sessionToken !== currentSessionToken
    );

    // Delete all other sessions
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        sessionToken: {
          not: currentSessionToken,
        },
      },
    });

    // Register logs for each revoked session
    if (session.user?.id) {
      await Promise.all(
        sessionsToRevoke.map((s: Session) =>
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
    console.error('Error revoking all sessions:', error);
    return NextResponse.json(
      { error: 'Error revoking sessions' },
      { status: 500 }
    );
  }
}
