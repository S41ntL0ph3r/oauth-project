import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { exportUserData, logDataAccess, createDataRequest } from '@/lib/lgpd-gdpr';
import { getClientIP, getClientUserAgent } from '@/lib/admin/security';

/**
 * API para exportação de dados pessoais (LGPD Art. 18, II)
 * Direito à portabilidade dos dados
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

    const clientIP = getClientIP(request);
    const userAgent = getClientUserAgent(request);

    // Registrar o acesso para auditoria
    await logDataAccess({
      userId: session.user.id,
      accessedBy: session.user.id,
      accessType: 'export',
      dataType: 'all_personal_data',
      reason: 'Exportação solicitada pelo titular (LGPD Art. 18, II)',
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    // Criar registro da solicitação
    await createDataRequest({
      userId: session.user.id,
      requestType: 'DATA_EXPORT',
      notes: 'Exportação via API',
    });

    // Exportar os dados
    const userData = await exportUserData(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Dados exportados com sucesso',
      data: userData,
    });

  } catch (error: unknown) {
    console.error('Erro ao exportar dados:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro ao exportar dados', details: message },
      { status: 500 }
    );
  }
}

/**
 * API para solicitar ações sobre dados pessoais (LGPD Art. 18)
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
    const { requestType, notes } = body;

    const validTypes = [
      'DATA_EXPORT',
      'DATA_CORRECTION',
      'DATA_DELETION',
      'DATA_ANONYMIZATION',
      'ACCESS_INFO',
    ];

    if (!validTypes.includes(requestType)) {
      return NextResponse.json(
        { error: 'Tipo de solicitação inválido' },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const userAgent = getClientUserAgent(request);

    // Criar a solicitação
    const dataRequest = await createDataRequest({
      userId: session.user.id,
      requestType,
      notes,
    });

    // Registrar para auditoria
    await logDataAccess({
      userId: session.user.id,
      accessedBy: session.user.id,
      accessType: 'read',
      dataType: 'data_request',
      reason: `Solicitação criada: ${requestType}`,
      ipAddress: clientIP,
      userAgent: userAgent,
      metadata: { requestId: dataRequest.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitação criada com sucesso',
      data: dataRequest,
    });

  } catch (error: unknown) {
    console.error('Erro ao criar solicitação:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro ao processar solicitação', details: message },
      { status: 500 }
    );
  }
}
