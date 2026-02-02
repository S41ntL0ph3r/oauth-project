/**
 * Utilitários para conformidade LGPD/GDPR
 */
import db from './db';
import crypto from 'crypto';

/**
 * Registra consentimento do usuário (LGPD Art. 8º)
 */
type ConsentType = 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'MARKETING_EMAILS' | 'DATA_PROCESSING' | 'COOKIES' | 'ANALYTICS' | 'THIRD_PARTY_SHARING';

export async function recordConsent(params: {
  userId: string;
  consentType: ConsentType;
  purpose: string;
  granted: boolean;
  ipAddress?: string;
  userAgent?: string;
  version?: string;
}) {
  return await db.userConsent.create({
    data: {
      userId: params.userId,
      consentType: params.consentType,
      purpose: params.purpose,
      granted: params.granted,
      grantedAt: params.granted ? new Date() : null,
      revokedAt: !params.granted ? new Date() : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      version: params.version || '1.0',
    },
  });
}

/**
 * Registra acesso a dados pessoais (LGPD Art. 37)
 */
export async function logDataAccess(params: {
  userId?: string;
  accessedBy: string;
  accessType: 'read' | 'update' | 'delete' | 'export';
  dataType: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  return await db.dataAccessLog.create({
    data: {
      userId: params.userId,
      accessedBy: params.accessedBy,
      accessType: params.accessType,
      dataType: params.dataType,
      reason: params.reason,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
    },
  });
}

/**
 * Exporta todos os dados de um usuário (LGPD Art. 18, II)
 */
export async function exportUserData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      sessions: true,
      consents: true,
      accessLogs: {
        take: 100,
        orderBy: { createdAt: 'desc' },
      },
      dataRequests: true,
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    personalData: {
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accounts: user.accounts.map((acc) => ({
      provider: acc.provider,
      type: acc.type,
      createdAt: acc.createdAt,
    })),
    sessions: user.sessions.map((sess) => ({
      expires: sess.expires,
      createdAt: sess.createdAt,
    })),
    consents: user.consents,
    recentAccessLogs: user.accessLogs,
    dataRequests: user.dataRequests,
  };
}

/**
 * Anonimiza dados de um usuário (LGPD Art. 16)
 */
export async function anonymizeUser(userId: string, reason?: string) {
  const anonymousEmail = `anon_${crypto.randomBytes(8).toString('hex')}@anonymized.local`;
  const anonymousName = `Usuário Anonimizado`;

  const user = await db.user.update({
    where: { id: userId },
    data: {
      name: anonymousName,
      email: anonymousEmail,
      emailVerified: null,
      image: null,
      password: null,
    },
  });

  // Registrar a anonimização
  await db.dataRequest.create({
    data: {
      userId,
      requestType: 'DATA_ANONYMIZATION',
      status: 'COMPLETED',
      completedAt: new Date(),
      notes: reason || 'Anonimização automática por inatividade',
    },
  });

  return user;
}

/**
 * Deleta completamente os dados de um usuário (LGPD Art. 18, VI)
 * Nota: Use com cuidado, considera as obrigações legais de retenção
 */
export async function deleteUserData(userId: string, reason?: string) {
  // Registrar a solicitação antes de deletar
  await db.dataRequest.create({
    data: {
      userId,
      requestType: 'DATA_DELETION',
      status: 'COMPLETED',
      completedAt: new Date(),
      notes: reason || 'Exclusão solicitada pelo titular',
    },
  });

  // Cascade delete cuidará das relações
  return await db.user.delete({
    where: { id: userId },
  });
}

/**
 * Cria uma solicitação de dados do usuário
 */
type RequestType = 'DATA_EXPORT' | 'DATA_CORRECTION' | 'DATA_DELETION' | 'DATA_ANONYMIZATION' | 'ACCESS_INFO';

export async function createDataRequest(params: {
  userId: string;
  requestType: RequestType;
  notes?: string;
}) {
  return await db.dataRequest.create({
    data: {
      userId: params.userId,
      requestType: params.requestType,
      status: 'PENDING',
      notes: params.notes,
    },
  });
}

/**
 * Processa uma solicitação de dados
 */
export async function processDataRequest(
  requestId: string,
  processedBy: string,
  status: 'COMPLETED' | 'REJECTED',
  data?: Record<string, unknown>,
  notes?: string
) {
  return await db.dataRequest.update({
    where: { id: requestId },
    data: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : undefined,
      processedBy,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      notes,
    },
  });
}

/**
 * Verifica se usuário deu consentimento para uma finalidade específica
 */
export async function hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
  const consent = await db.userConsent.findFirst({
    where: {
      userId,
      consentType: consentType,
      granted: true,
      revokedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return !!consent;
}

/**
 * Lista usuários inativos para anonimização (LGPD Art. 15)
 */
export async function findInactiveUsers(inactiveDays: number = 365) {
  const inactiveDate = new Date();
  inactiveDate.setDate(inactiveDate.getDate() - inactiveDays);

  return await db.user.findMany({
    where: {
      updatedAt: {
        lt: inactiveDate,
      },
      sessions: {
        none: {
          expires: {
            gt: new Date(),
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      updatedAt: true,
    },
  });
}
