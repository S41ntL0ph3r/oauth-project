import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.notification.deleteMany({
      where: {
        userId: user.id,
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
