import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Mock de transações - em produção, isso viria do banco de dados
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Por enquanto, retorna dados mockados
    // Em produção, você buscaria do localStorage ou de um banco de dados
    const transactions: any[] = [];

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
