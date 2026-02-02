import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { recordConsent } from '@/lib/lgpd-gdpr';
import { getClientIP, getClientUserAgent } from '@/lib/admin/security';

/**
 * API para gerenciar consentimentos LGPD/GDPR
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { consentType, purpose, granted } = body;

    const validTypes = [
      'TERMS_OF_SERVICE',
      'PRIVACY_POLICY',
      'MARKETING_EMAILS',
      'DATA_PROCESSING',
      'COOKIES',
      'ANALYTICS',
      'THIRD_PARTY_SHARING',
    ];

    if (!validTypes.includes(consentType)) {
      return NextResponse.json(
        { error: 'Tipo de consentimento inválido' },
        { status: 400 }
      );
    }

    if (typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo "granted" deve ser booleano' },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const userAgent = getClientUserAgent(request);

    // Registrar o consentimento
    const consent = await recordConsent({
      userId: session.user.id,
      consentType,
      purpose: purpose || `Consentimento para ${consentType}`,
      granted,
      ipAddress: clientIP,
      userAgent: userAgent,
      version: '1.0',
    });

    return NextResponse.json({
      success: true,
      message: granted ? 'Consentimento registrado' : 'Consentimento revogado',
      data: consent,
    });

  } catch (error: unknown) {
    console.error('Erro ao registrar consentimento:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro ao processar consentimento', details: message },
      { status: 500 }
    );
  }
}

/**
 * Consultar consentimentos do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const consentType = searchParams.get('type');

    const db = (await import('@/lib/db')).default;

    type WhereInput = {
      userId: string;
      consentType?: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'MARKETING_EMAILS' | 'DATA_PROCESSING' | 'COOKIES' | 'ANALYTICS' | 'THIRD_PARTY_SHARING';
    };

    const where: WhereInput = { userId: session.user.id };
    if (consentType && ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_EMAILS', 'DATA_PROCESSING', 'COOKIES', 'ANALYTICS', 'THIRD_PARTY_SHARING'].includes(consentType)) {
      where.consentType = consentType as WhereInput['consentType'];
    }

    const consents = await db.userConsent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: consents,
    });

  } catch (error: unknown) {
    console.error('Erro ao buscar consentimentos:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro ao buscar consentimentos', details: message },
      { status: 500 }
    );
  }
}
