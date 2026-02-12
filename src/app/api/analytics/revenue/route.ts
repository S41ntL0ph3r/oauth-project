import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

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
  try {
    // 1. Autenticação
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

    // 2. Parâmetros
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');

    // 3. Calcular período
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 4. Log de auditoria (LGPD Art. 37)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VIEW_ANALYTICS',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        metadata: { period },
        timestamp: new Date()
      }
    }).catch(() => {
      // Se tabela não existir, apenas log no console
      console.log('[Audit] User viewed analytics:', user.email);
    });

    // 5. Buscar transações (mock data - substituir com dados reais)
    // Em produção, buscar do banco de dados:
    // const transactions = await prisma.transaction.findMany({
    //   where: {
    //     userId: user.id,
    //     date: { gte: startDate, lte: endDate },
    //     type: 'income'
    //   }
    // });

    // Mock data para demonstração
    const mockTransactions = generateMockTransactions(startDate, endDate);

    // 6. Calcular métricas agregadas
    const totalRevenue = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = mockTransactions.length;
    const averageTicket = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Taxa de crescimento (comparar com período anterior)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - period);
    const previousEndDate = new Date(startDate);
    
    const mockPreviousTransactions = generateMockTransactions(previousStartDate, previousEndDate);
    const previousRevenue = mockPreviousTransactions.reduce((sum, t) => sum + t.amount, 0);
    const growthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Média mensal
    const monthsInPeriod = period / 30;
    const monthlyAverage = monthsInPeriod > 0 ? totalRevenue / monthsInPeriod : totalRevenue;

    // 7. Agrupar dados para gráficos
    const revenueOverTime = groupByDate(mockTransactions);
    const revenueByCategory = groupByCategory(mockTransactions);

    // 8. Retornar apenas dados agregados
    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Funções auxiliares para processamento de dados
 * Em produção, substituir por queries reais ao banco
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
