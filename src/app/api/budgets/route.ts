import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: { userId: string; month?: number; year?: number } = { userId: user.id };

    if (month && year) {
      where.month = parseInt(month);
      where.year = parseInt(year);
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        alerts: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
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
    const { name, category, limitAmount, alertThreshold, month, year } = body;

    // Validações
    if (!name || !category || !limitAmount || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verificar se já existe orçamento para essa categoria/mês/ano
    const existing = await prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId: user.id,
          category,
          month: parseInt(month),
          year: parseInt(year)
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um orçamento para esta categoria neste período' },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        name,
        category,
        limitAmount: parseFloat(limitAmount),
        alertThreshold: parseFloat(alertThreshold) || 80,
        month: parseInt(month),
        year: parseInt(year)
      }
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
