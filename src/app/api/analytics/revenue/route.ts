import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuthenticatedUser } from '@/server/auth/user-session';
import { withApiHandler } from '@/server/http/route';
import { analyticsService } from '@/services/analytics/analyticsService';

/**
 * API: Revenue Analytics
 * 
 * CONFORMIDADE LGPD/GDPR:
 * - Base legal: Art. 7, I (Execução de contrato)
 * - Apenas dados agregados de faturamento
 * - NÃO coleta dados comportamentais
 * - Log de auditoria para todos os acessos (Art. 37)
 * 
 * Processamento:
 * - Servidor: Agregação, cálculos, validação
 * - Cliente: Renderização, filtros visuais
 */

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireAuthenticatedUser();

    // 2. Parâmetros
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');

    // 3. Calcular período
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VIEW_ANALYTICS',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        metadata: { period },
        timestamp: new Date()
      }
    }).catch(() => {
      console.log('[Audit] User viewed analytics:', user.email);
    });

    await analyticsService.captureServerEvent({
      event: 'financial_chart_viewed',
      distinctId: user.id,
      properties: {
        period,
        chart: 'revenue',
      },
    });

    // 5. Fetch transactions (mock data - replace with real data)
    // In production, fetch from database:
    // const transactions = await prisma.transaction.findMany({
    //   where: {
    //     userId: user.id,
    //     date: { gte: startDate, lte: endDate },
    //     type: 'income'
    //   }
    // });

    // Mock data for demonstration
    const mockTransactions = generateMockTransactions(startDate, endDate);

    // 6. Calculate aggregated metrics
    const totalRevenue = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = mockTransactions.length;
    const averageTicket = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Growth rate (compare with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - period);
    const previousEndDate = new Date(startDate);
    
    const mockPreviousTransactions = generateMockTransactions(previousStartDate, previousEndDate);
    const previousRevenue = mockPreviousTransactions.reduce((sum, t) => sum + t.amount, 0);
    const growthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Monthly average
    const monthsInPeriod = period / 30;
    const monthlyAverage = monthsInPeriod > 0 ? totalRevenue / monthsInPeriod : totalRevenue;

    // 7. Group data for charts
    const revenueOverTime = groupByDate(mockTransactions);
    const revenueByCategory = groupByCategory(mockTransactions);

    return {
      overview: {
        totalRevenue,
        monthlyAverage,
        growthRate,
        averageTicket,
        transactionCount,
        lastUpdate: new Date().toISOString()
      },
      charts: {
        revenueOverTime,
        revenueByCategory
      }
    };
  });
}

/**
 * Helper functions for data processing
 * In production, replace with real database queries
 */

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
}

function generateMockTransactions(startDate: Date, endDate: Date): Transaction[] {
  const transactions: Transaction[] = [];
  const categories = ['Vendas', 'Serviços', 'Assinaturas', 'Consultoria', 'Produtos'];
  
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // 2-5 transações por dia
    const numTransactions = Math.floor(Math.random() * 4) + 2;
    
    for (let j = 0; j < numTransactions; j++) {
      transactions.push({
        id: `tx_${i}_${j}`,
        date,
        amount: Math.random() * 5000 + 500, // R$ 500 - R$ 5500
        category: categories[Math.floor(Math.random() * categories.length)]
      });
    }
  }
  
  return transactions;
}

function groupByDate(transactions: Transaction[]) {
  const grouped = new Map<string, { revenue: number; transactions: number }>();
  
  transactions.forEach(tx => {
    const dateKey = tx.date.toISOString().split('T')[0];
    const existing = grouped.get(dateKey) || { revenue: 0, transactions: 0 };
    
    grouped.set(dateKey, {
      revenue: existing.revenue + tx.amount,
      transactions: existing.transactions + 1
    });
  });
  
  return Array.from(grouped.entries())
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      revenue: Math.round(data.revenue),
      transactions: data.transactions
    }))
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split('/');
      const [dayB, monthB] = b.date.split('/');
      return new Date(`2026-${monthA}-${dayA}`).getTime() - new Date(`2026-${monthB}-${dayB}`).getTime();
    });
}

function groupByCategory(transactions: Transaction[]) {
  const grouped = new Map<string, number>();
  
  transactions.forEach(tx => {
    const existing = grouped.get(tx.category) || 0;
    grouped.set(tx.category, existing + tx.amount);
  });
  
  return Array.from(grouped.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount)
    }))
    .sort((a, b) => b.amount - a.amount);
}
