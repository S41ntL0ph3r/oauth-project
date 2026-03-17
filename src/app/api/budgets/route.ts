import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/server/auth/user-session';
import { budgetRepository } from '@/server/repositories/budget-repository';
import { withApiHandler, apiResponse } from '@/server/http/route';
import { analyticsService } from '@/services/analytics/analyticsService';

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const budgets = await budgetRepository.findManyByUser(
      user.id,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );

    return { budgets };
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser();

    const body = await request.json();
    const { name, category, limitAmount, alertThreshold, month, year } = body;

    if (!name || !category || !limitAmount || !month || !year) {
      return apiResponse({ error: 'Missing required fields' }, 400);
    }

    const existing = await budgetRepository.findExistingPeriodBudget(
      user.id,
      category,
      parseInt(month),
      parseInt(year),
    );

    if (existing) {
      return apiResponse(
        { error: 'A budget already exists for this category in this period' },
        400,
      );
    }

    const budget = await budgetRepository.create({
      userId: user.id,
      name,
      category,
      limitAmount: parseFloat(limitAmount),
      alertThreshold: parseFloat(alertThreshold) || 80,
      month: parseInt(month),
      year: parseInt(year),
    });

    await analyticsService.captureServerEvent({
      event: 'budget_created',
      distinctId: user.id,
      properties: {
        category,
        month: parseInt(month),
        year: parseInt(year),
        limitAmount: parseFloat(limitAmount),
      },
    });

    return apiResponse({ budget }, 201);
  });
}
