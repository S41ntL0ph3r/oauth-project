import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retornar configurações padrão ou buscar do banco de dados
    // Por enquanto, retornamos configurações padrão
    const settings = {
      budgetAlerts: true,
      paymentReminders: true,
      weeklyReports: false,
      monthlyReports: true,
      securityAlerts: true,
      emailNotifications: false
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Aqui você pode salvar as configurações no banco de dados
    // Por enquanto, apenas retornamos sucesso
    
    return NextResponse.json({ settings: body });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
