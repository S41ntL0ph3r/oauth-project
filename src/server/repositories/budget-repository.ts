import db from '@/lib/db';

export const budgetRepository = {
  findManyByUser(userId: string, month?: number, year?: number) {
    return db.budget.findMany({
      where: {
        userId,
        ...(month && year ? { month, year } : {}),
      },
      include: {
        alerts: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findExistingPeriodBudget(userId: string, category: string, month: number, year: number) {
    return db.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month,
          year,
        },
      },
    });
  },

  create(input: {
    userId: string;
    name: string;
    category: string;
    limitAmount: number;
    alertThreshold: number;
    month: number;
    year: number;
  }) {
    return db.budget.create({
      data: input,
    });
  },

  updateOwned(id: string, userId: string, data: { name?: string; limitAmount?: number; alertThreshold?: number }) {
    return db.budget.update({
      where: { id, userId },
      data,
    });
  },

  deleteOwned(id: string, userId: string) {
    return db.budget.delete({
      where: { id, userId },
    });
  },
};
