import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdminFromRequest } from '@/lib/admin/jwt';

// Simulação de configurações (em produção você salvaria no banco)
const defaultConfig = {
  siteName: 'OAuth Project',
  siteDescription: 'Sistema de autenticação moderno',
  emailFrom: 'noreply@example.com',
  emailProvider: 'smtp',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  sessionTimeout: '1440',
  maxLoginAttempts: '5',
  passwordMinLength: '8',
  requireTwoFactor: false,
  enableEmailVerification: true,
  enableEmailNotifications: true,
  maintenanceMode: false,
  allowUserRegistration: true,
  defaultTheme: 'light',
  logoUrl: '',
  faviconUrl: ''
};

export async function GET(request: NextRequest) {
  try {
    const adminData = getAuthenticatedAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Em produção, você buscaria do banco ou arquivo de configuração
    const config = defaultConfig;

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminData = getAuthenticatedAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é SUPER_ADMIN
    if (adminData.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = await request.json();
    
    // Em produção, você salvaria no banco ou arquivo de configuração
    console.log('Configurações atualizadas:', data);

    return NextResponse.json({ success: true, message: 'Configurações salvas com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
