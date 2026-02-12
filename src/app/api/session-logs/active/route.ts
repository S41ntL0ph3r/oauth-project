import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: Fetch active user sessions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all active sessions for the user
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

    // For each session, fetch the corresponding last log
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
    console.error('Error fetching active sessions:', error);
    return NextResponse.json(
      { error: 'Error fetching sessions' },
      { status: 500 }
    );
  }
}

// DELETE: Revoke specific session
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Check if session belongs to user
    const sessionToDelete = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!sessionToDelete) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Delete session
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

    return NextResponse.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json(
      { error: 'Error revoking session' },
      { status: 500 }
    );
  }
}
