import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/server/auth/user-session';
import { budgetRepository } from '@/server/repositories/budget-repository';
import { withApiHandler } from '@/server/http/route';
import { analyticsService } from '@/services/analytics/analyticsService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;
    const user = await requireAuthenticatedUser();

    const body = await request.json();
    const { name, limitAmount, alertThreshold } = body;

    const budget = await budgetRepository.updateOwned(id, user.id, {
      ...(name ? { name } : {}),
      ...(limitAmount ? { limitAmount: parseFloat(limitAmount) } : {}),
      ...(alertThreshold ? { alertThreshold: parseFloat(alertThreshold) } : {}),
    });

    await analyticsService.captureServerEvent({
      event: 'budget_updated',
      distinctId: user.id,
      properties: {
        budgetId: id,
        hasNameChange: Boolean(name),
        hasLimitChange: Boolean(limitAmount),
        hasAlertThresholdChange: Boolean(alertThreshold),
      },
    });

    return { budget };
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const { id } = await params;
    const user = await requireAuthenticatedUser();

    await budgetRepository.deleteOwned(id, user.id);

    await analyticsService.captureServerEvent({
      event: 'budget_deleted',
      distinctId: user.id,
      properties: {
        budgetId: id,
      },
    });

    return { success: true };
  });
}
