import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
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

    const reports = await prisma.customReport.findMany({
      where: { userId: user.id },
      orderBy: [
        { isFavorite: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching custom reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, reportType, filters } = body;

    if (!name || !reportType || !filters) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const report = await prisma.customReport.create({
      data: {
        userId: user.id,
        name,
        description: description || '',
        reportType: reportType || 'CUSTOM',
        filters: filters
      }
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
