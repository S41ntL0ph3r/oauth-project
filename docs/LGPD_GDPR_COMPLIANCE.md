# 🔒 Conformidade LGPD/GDPR - Documentação Técnica

## 📋 Sumário Executivo

Este documento estabelece as diretrizes técnicas e jurídicas para garantir conformidade com:
- **LGPD** (Lei Geral de Proteção de Dados - Brasil)
- **GDPR** (General Data Protection Regulation - União Europeia)

---

## 🎯 Princípios Fundamentais Implementados

### 1. Minimização de Dados
**Conceito**: Coletar apenas dados estritamente necessários.

**Implementação**:
```typescript
// ❌ NÃO FAZER: Coletar dados desnecessários
{
  fullAddress: string,
  ssn: string,
  creditCard: string
}

// ✅ FAZER: Apenas dados essenciais
{
  ipAddress: string (anonimizado),
  device: string,
  loginTime: Date
}
```

### 2. Propósito Legítimo
**Conceito**: Dados coletados devem ter finalidade específica.

**Analytics**: Apenas métricas de faturamento (não comportamento)
**Sessões**: Apenas para segurança (não marketing)

### 3. Consentimento Explícito
**Implementação**:
```typescript
// Modal de consentimento ao primeiro login
interface ConsentData {
  analyticsConsent: boolean;  // Coleta de métricas de faturamento
  sessionTracking: boolean;   // Rastreamento de sessões de segurança
  locationData: boolean;      // Geolocalização aproximada
  timestamp: Date;
}
```

### 4. Direito de Exclusão (Right to be Forgotten)
**Implementação**:
```typescript
// API Endpoint: DELETE /api/user/gdpr/delete-data
async function handleDataDeletion(userId: string) {
  // 1. Anonimizar dados históricos
  await anonymizeUserData(userId);
  
  // 2. Remover dados pessoais
  await deletePersonalInfo(userId);
  
  // 3. Manter apenas registros legais obrigatórios (7 anos)
  await retainLegalRecords(userId);
}
```

---

## 📊 1. Analytics & Métricas de Faturamento

### Dados Permitidos (LGPD Art. 7, I)
✅ **Base Legal**: Execução de contrato

```typescript
interface RevenueAnalytics {
  // Métricas agregadas (sem identificação individual)
  totalRevenue: number;           // Receita total
  monthlyRevenue: number[];       // Receita mensal
  annualRevenue: number;          // Receita anual
  growthRate: number;             // Taxa de crescimento
  averageTicket: number;          // Ticket médio
  
  // Dados agregados por período
  revenueByPeriod: {
    date: string;
    amount: number;
  }[];
}
```

### Dados Proibidos
❌ Número de usuários individuais
❌ Comportamento de navegação
❌ Dados demográficos pessoais
❌ Histórico de cliques
❌ Tempo de permanência por usuário

### Processamento

**Cliente (Browser)**:
- Renderização de gráficos
- Filtragem de período
- Formatação visual

**Servidor (API)**:
- Agregação de dados
- Cálculos estatísticos
- Validação de permissões
- Auditoria de acesso

```typescript
// API: /api/analytics/revenue
export async function GET(request: Request) {
  // 1. Autenticação
  const session = await auth();
  if (!session) return unauthorized();
  
  // 2. Log de auditoria (LGPD Art. 37)
  await logAccess({
    userId: session.user.id,
    action: 'VIEW_ANALYTICS',
    timestamp: new Date()
  });
  
  // 3. Retornar apenas dados agregados
  const data = await db.transaction.aggregate({
    where: { userId: session.user.id },
    _sum: { amount: true },
    _avg: { amount: true }
  });
  
  return NextResponse.json(data);
}
```

---

## 📄 2. Relatórios Personalizados

### Princípios de Segurança

**Escopo**: Apenas dados do dashboard do usuário autenticado.

```typescript
interface ReportFilters {
  period: {
    startDate: Date;
    endDate: Date;
  };
  category?: string;      // Categoria de transação
  transactionType?: 'income' | 'expense' | 'all';
  minAmount?: number;
  maxAmount?: number;
}

interface ReportExport {
  format: 'csv' | 'pdf';
  data: RevenueData[];
  metadata: {
    generatedAt: Date;
    requestedBy: string;    // Email do usuário
    period: string;
    disclaimer: string;     // Aviso de confidencialidade
  };
}
```

### Conformidade na Exportação

**PDF/CSV Headers**:
```
CONFIDENCIAL - DADOS PROTEGIDOS POR LGPD
Gerado em: [timestamp]
Usuário: [email]
Período: [startDate] - [endDate]

Este relatório contém dados pessoais protegidos pela Lei 13.709/2018 (LGPD).
Uso autorizado apenas para: [propósito específico]
Proibida distribuição não autorizada.
```

### Retenção de Dados

```typescript
// Política de retenção
const RETENTION_POLICY = {
  reports: {
    generated: '90 dias',     // Relatórios gerados
    saved: '1 ano',           // Relatórios salvos pelo usuário
    deleted: 'imediato'       // Exclusão sob demanda
  }
};

// Cron job para limpeza automática
async function cleanupExpiredReports() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  await db.report.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      saved: false
    }
  });
}
```

---

## 🔒 3. Segurança & Gestão de Sessões

### Dados de Sessão Permitidos

```typescript
interface SessionData {
  // ✅ Dados essenciais para segurança
  sessionId: string;              // Token de sessão
  userId: string;                 // ID do usuário
  
  // ✅ Informações técnicas (LGPD Art. 7, IX - Legítimo interesse)
  ipAddress: string;              // IP anonimizado (ex: 192.168.XXX.XXX)
  device: string;                 // Tipo de dispositivo (Mobile/Desktop)
  browser: string;                // Navegador
  os: string;                     // Sistema operacional
  
  // ✅ Localização aproximada (com consentimento)
  country?: string;               // País (apenas se consentido)
  city?: string;                  // Cidade (apenas se consentido)
  
  // ✅ Metadados de segurança
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  
  // ❌ NÃO COLETAR
  // gpsCoordinates: never;
  // fullAddress: never;
  // personalDocuments: never;
}
```

### Anonimização de IP (GDPR Art. 4)

```typescript
/**
 * Anonimiza endereço IP para conformidade GDPR
 * Remove os dois últimos octetos do IPv4 ou 80 bits do IPv6
 */
function anonymizeIP(ip: string): string {
  if (ip.includes(':')) {
    // IPv6: manter apenas primeiros 48 bits
    const parts = ip.split(':');
    return parts.slice(0, 3).join(':') + ':xxxx:xxxx:xxxx:xxxx';
  } else {
    // IPv4: manter apenas primeiros 2 octetos
    const parts = ip.split('.');
    return parts.slice(0, 2).join('.') + '.xxx.xxx';
  }
}

// Exemplo: 192.168.1.100 -> 192.168.xxx.xxx
```

### Detecção de Device/Browser (Client-Side)

```typescript
/**
 * Extrai informações técnicas do User-Agent
 * Processado no cliente para minimizar dados enviados ao servidor
 */
function parseUserAgent(): DeviceInfo {
  const ua = navigator.userAgent;
  
  return {
    device: /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop',
    browser: getBrowserName(ua),
    os: getOSName(ua)
  };
}

function getBrowserName(ua: string): string {
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}
```

### Geolocalização (Opt-in)

```typescript
/**
 * Geolocalização APENAS com consentimento explícito
 * Não usar Geolocation API (coordenadas exatas)
 * Usar apenas IP-to-Location (cidade/país)
 */
async function getApproximateLocation(
  ipAddress: string,
  consent: boolean
): Promise<LocationData | null> {
  
  // Verificar consentimento
  if (!consent) {
    return null;
  }
  
  // Usar serviço de terceiros (ex: MaxMind GeoLite2)
  // Retornar apenas cidade/país (não coordenadas GPS)
  const location = await ipToLocation(ipAddress);
  
  return {
    country: location.country,
    city: location.city,
    // NÃO incluir: latitude, longitude, address
  };
}
```

### Armazenamento Seguro

```typescript
// Sessão no servidor (Prisma Schema)
model Session {
  id            String    @id @default(cuid())
  sessionToken  String    @unique
  userId        String
  expires       DateTime
  
  // Dados técnicos
  ipAddress     String?   // Anonimizado
  device        String?
  browser       String?
  os            String?
  
  // Geolocalização (opt-in)
  country       String?
  city          String?
  
  // Consentimento
  locationConsent Boolean @default(false)
  
  // Auditoria
  createdAt     DateTime  @default(now())
  lastActivity  DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([sessionToken])
}
```

### Cookies Seguros (LGPD Art. 8)

```typescript
// next-auth configuration
export const authOptions = {
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,      // Não acessível via JavaScript
        sameSite: 'lax',     // Proteção CSRF
        path: '/',
        secure: true,        // Apenas HTTPS
        maxAge: 30 * 24 * 60 * 60  // 30 dias
      }
    }
  }
};
```

### Log de Auditoria (LGPD Art. 37)

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'VIEW_DATA' | 'EXPORT_DATA' | 'DELETE_DATA';
  ipAddress: string;  // Anonimizado
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

// Registrar todas as ações sensíveis
async function logSecurityEvent(event: AuditLog) {
  await db.auditLog.create({
    data: {
      ...event,
      // Anonimizar IP antes de salvar
      ipAddress: anonymizeIP(event.ipAddress)
    }
  });
  
  // Retenção: 5 anos (obrigação legal)
  // Após 5 anos: anonimização adicional
}
```

---

## 🛡️ Boas Práticas de Segurança

### 1. Hashing de Senhas

```typescript
import bcrypt from 'bcrypt';

// ✅ FAZER: Hash com salt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;  // Custo computacional
  return await bcrypt.hash(password, saltRounds);
}

// ❌ NÃO FAZER: Armazenar senha em texto plano
// ❌ NÃO FAZER: Usar MD5 ou SHA1 (obsoletos)
```

### 2. Tokens de Sessão

```typescript
// ✅ FAZER: Token criptograficamente seguro
import { randomBytes } from 'crypto';

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');  // 256 bits
}

// ❌ NÃO FAZER: UUID ou timestamp simples
```

### 3. Rate Limiting

```typescript
// Prevenir ataques de força bruta
const RATE_LIMITS = {
  login: '5 tentativas / 15 minutos',
  api: '100 requests / minuto',
  export: '10 relatórios / hora'
};
```

### 4. HTTPS Obrigatório

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

---

## 📝 Checklist de Conformidade

### LGPD (Lei 13.709/2018)

- [x] **Art. 7** - Base legal para tratamento (execução de contrato)
- [x] **Art. 8** - Consentimento explícito quando aplicável
- [x] **Art. 9** - Direito de acesso aos dados
- [x] **Art. 18** - Direito de correção e exclusão
- [x] **Art. 37** - Registro de operações de tratamento
- [x] **Art. 46** - Relatório de impacto (quando necessário)
- [x] **Art. 48** - Notificação de incidentes

### GDPR (Regulation 2016/679)

- [x] **Art. 5** - Princípios de processamento (minimização, propósito)
- [x] **Art. 6** - Lawful basis for processing
- [x] **Art. 17** - Right to erasure (right to be forgotten)
- [x] **Art. 25** - Data protection by design and default
- [x] **Art. 30** - Records of processing activities
- [x] **Art. 32** - Security of processing
- [x] **Art. 33** - Notification of personal data breach

---

## 🚨 Gestão de Incidentes

### Procedimento de Breach Notification

```typescript
interface DataBreachResponse {
  // 1. Detectar violação
  detection: {
    timestamp: Date;
    affectedData: string[];
    affectedUsers: number;
  };
  
  // 2. Conter o incidente
  containment: {
    systemsIsolated: boolean;
    accessRevoked: boolean;
  };
  
  // 3. Notificar autoridade (72h - GDPR Art. 33)
  // ANPD (Brasil) ou Data Protection Authority (UE)
  notification: {
    authority: 'ANPD' | 'DPA';
    notifiedAt: Date;
    reportNumber: string;
  };
  
  // 4. Notificar usuários afetados
  userNotification: {
    method: 'email' | 'sms' | 'in-app';
    sentAt: Date;
    recipients: string[];
  };
}
```

---

## 📚 Referências Legais

### Brasil (LGPD)
- Lei 13.709/2018 - Lei Geral de Proteção de Dados
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- ANPD: https://www.gov.br/anpd/pt-br

### União Europeia (GDPR)
- Regulation (EU) 2016/679
- https://gdpr-info.eu/
- ICO (UK): https://ico.org.uk/

---

## 🔄 Atualização do Documento

**Versão**: 1.0.0  
**Data**: 10 de fevereiro de 2026  
**Revisão**: Anual ou quando houver mudança legislativa  
**Responsável**: DPO (Data Protection Officer) / Encarregado de Dados

---

**Nota Legal**: Este documento é uma orientação técnica. Para compliance completo, consulte um advogado especializado em proteção de dados.
