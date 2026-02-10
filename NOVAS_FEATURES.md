# 🎯 Novas Features de Gestão Financeira

## 📋 Visão Geral

Três novas funcionalidades foram adicionadas ao sistema de gestão financeira:

1. **💰 Orçamento Mensal** - Planejamento e controle de gastos por categoria
2. **📊 Relatórios Personalizados** - Análises customizadas com filtros avançados
3. **🔔 Notificações e Alertas** - Central de notificações e alertas automáticos

---

## 💰 Orçamento Mensal

### Funcionalidades:
- ✅ Criar orçamentos por categoria e período (mês/ano)
- ✅ Definir limites de gastos personalizados
- ✅ Configurar alertas em % do orçamento (ex: avisar aos 80%)
- ✅ Visualizar progresso em tempo real com barras coloridas
- ✅ Comparar orçamento planejado vs gastos reais
- ✅ Status visual: dentro do limite, próximo do limite, excedido
- ✅ Resumo geral: total orçado, total gasto, saldo disponível

### Como Usar:
1. Acesse **Orçamento** no menu
2. Selecione o mês/ano desejado
3. Clique em **+ Novo Orçamento**
4. Preencha:
   - Nome do orçamento
   - Categoria (Alimentação, Transporte, etc.)
   - Valor limite
   - % para alerta (padrão: 80%)
5. O sistema automaticamente compara com suas transações reais

### Categorias Disponíveis:
- Alimentação
- Transporte
- Saúde
- Lazer
- Trabalho
- Moradia
- Educação
- Vestuário
- Investimentos
- Outros

### API Endpoints:
```
GET    /api/budgets?month=2&year=2026
POST   /api/budgets
PUT    /api/budgets/[id]
DELETE /api/budgets/[id]
```

---

## 📊 Relatórios Personalizados

### Funcionalidades:
- ✅ Filtros avançados (período, categoria, tipo, valor)
- ✅ Múltiplos tipos de relatório
- ✅ Visualização de gastos por categoria com gráficos
- ✅ Exportação em CSV, Excel e PDF
- ✅ Salvar configurações de relatórios
- ✅ Favoritar relatórios mais usados
- ✅ Resumo financeiro completo

### Tipos de Relatório:
- **Transações**: Lista completa de movimentações
- **Gastos por Categoria**: Análise de distribuição
- **Comparativo Mensal**: Evolução temporal
- **Orçamento vs Real**: Comparação de planejado x executado
- **Personalizado**: Configuração livre

### Filtros Disponíveis:
- **Período**: Data inicial e final
- **Categoria**: Todas ou específica
- **Tipo**: Receitas, Despesas ou Ambas
- **Valor**: Mínimo e máximo

### Exportação:
- 📄 **CSV**: Planilha simples
- 📗 **Excel**: Formatação profissional
- 📕 **PDF**: Documento com visual

### Como Salvar Relatório:
1. Configure os filtros desejados
2. Clique em **Gerar Relatório**
3. Clique em **Salvar Configuração**
4. Nomeie o relatório
5. Acesse depois em **Relatórios Salvos**

### API Endpoints:
```
GET    /api/custom-reports
POST   /api/custom-reports
DELETE /api/custom-reports/[id]
PUT    /api/custom-reports/[id]/favorite
GET    /api/transactions?startDate=X&endDate=Y&category=Z
POST   /api/reports/export
```

---

## 🔔 Notificações e Alertas

### Funcionalidades:
- ✅ Central de notificações unificada
- ✅ Filtros: Todas, Não lidas, Lidas
- ✅ Prioridades: Baixa, Normal, Alta, Urgente
- ✅ Marcar como lida individual ou em massa
- ✅ Excluir notificações
- ✅ Configurações de alertas personalizadas
- ✅ Navegação rápida (clique para ir ao contexto)

### Tipos de Notificação:
- 💰 **Alerta de Orçamento**: Quando atinge % do limite
- 📅 **Conta a Vencer**: Lembrete de pagamentos
- ⚠️ **Conta Vencida**: Pagamentos atrasados
- 🎯 **Meta Alcançada**: Objetivos atingidos
- 📊 **Resumo Semanal**: Consolidação semanal
- 📈 **Resumo Mensal**: Balanço do mês
- 🔔 **Sistema**: Avisos gerais
- 🔒 **Segurança**: Alertas críticos

### Configurações de Alertas:
- ✅ Alertas de Orçamento
- ✅ Lembretes de Pagamento
- ✅ Resumo Semanal (opcional)
- ✅ Resumo Mensal
- ✅ Alertas de Segurança
- ✅ Notificações por Email (opcional)

### Prioridades e Cores:
- 🔵 **Baixa**: Informações gerais
- 🟢 **Normal**: Notificações comuns
- 🟡 **Alta**: Requer atenção
- 🔴 **Urgente**: Ação imediata necessária

### API Endpoints:
```
GET    /api/notifications?read=false
POST   /api/notifications
PUT    /api/notifications/[id]/read
DELETE /api/notifications/[id]
PUT    /api/notifications/mark-all-read
DELETE /api/notifications/delete-read
GET    /api/notifications/settings
PUT    /api/notifications/settings
```

---

## 🗄️ Estrutura do Banco de Dados

### Novos Modelos Prisma:

#### Budget (Orçamento)
```prisma
model Budget {
  id              String   @id @default(cuid())
  userId          String
  name            String
  month           Int
  year            Int
  category        String
  limitAmount     Float
  spentAmount     Float    @default(0)
  alertThreshold  Float    @default(80)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  alerts          BudgetAlert[]
}
```

#### BudgetAlert
```prisma
model BudgetAlert {
  id          String   @id @default(cuid())
  budgetId    String
  userId      String
  message     String
  percentage  Float
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  budget      Budget   @relation(fields: [budgetId], references: [id])
}
```

#### Notification
```prisma
model Notification {
  id          String           @id @default(cuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  metadata    Json?
  isRead      Boolean          @default(false)
  priority    NotificationPriority @default(NORMAL)
  actionUrl   String?
  createdAt   DateTime         @default(now())
  readAt      DateTime?
}
```

#### CustomReport
```prisma
model CustomReport {
  id            String   @id @default(cuid())
  userId        String
  name          String
  description   String?
  reportType    ReportType
  filters       Json
  config        Json?
  isPublic      Boolean  @default(false)
  isFavorite    Boolean  @default(false)
  lastGenerated DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 🚀 Próximos Passos

### Para Começar a Usar:

1. **Migração já aplicada** ✅
   ```bash
   npx prisma migrate dev --name add_budget_notifications_reports
   ```

2. **Acesse as novas páginas:**
   - `/budget` - Orçamento Mensal
   - `/relatorios` - Relatórios Personalizados
   - `/notificacoes` - Notificações e Alertas

3. **Links adicionados ao menu de navegação** ✅

### Funcionalidades Futuras (Sugestões):

#### Orçamento:
- [ ] Copiar orçamento do mês anterior
- [ ] Templates de orçamento
- [ ] Comparativo entre períodos
- [ ] Previsão de gastos baseada em histórico

#### Relatórios:
- [ ] Gráficos interativos (linhas, pizza, barras)
- [ ] Agendamento de relatórios automáticos
- [ ] Compartilhamento de relatórios
- [ ] Relatórios por tags/etiquetas

#### Notificações:
- [ ] Integração com email real (EmailJS)
- [ ] Push notifications (PWA)
- [ ] Notificações por SMS
- [ ] Agendamento de lembretes personalizados

---

## 🔧 Tecnologias Utilizadas

- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Autenticação**: NextAuth v5
- **UI/UX**: Design responsivo com modo escuro

---

## 📝 Notas de Implementação

### Integração com Transações:
As páginas de orçamento e relatórios foram projetadas para integrar com o sistema de transações existente no dashboard. Por padrão, elas buscam dados via API, mas também suportam localStorage para dados locais.

### Estado dos Dados:
- **Orçamentos**: Armazenados no banco de dados (Prisma)
- **Notificações**: Armazenados no banco de dados (Prisma)
- **Relatórios Salvos**: Configurações no banco, dados em cache
- **Transações**: Podem vir do localStorage ou banco de dados

### Performance:
- Paginação implementada (100 notificações por vez)
- Índices no banco para consultas rápidas
- Cache client-side para relatórios gerados

---

## ✅ Checklist de Deploy

- [x] Schema do Prisma atualizado
- [x] Migração criada e aplicada
- [x] Páginas criadas (/budget, /relatorios, /notificacoes)
- [x] API Routes implementadas
- [x] Navegação atualizada
- [x] Tipos TypeScript definidos
- [x] UI responsiva e acessível
- [x] Modo escuro suportado

### Para Deploy em Produção:
```bash
# 1. Atualizar variáveis de ambiente
DATABASE_URL="sua-url-de-producao"

# 2. Rodar migração em produção
npx prisma migrate deploy

# 3. Gerar Prisma Client
npx prisma generate

# 4. Build e deploy
npm run build
```

---

## 🎨 Customização

### Cores dos Alertas:
Edite em cada arquivo de página para personalizar as cores dos status e prioridades.

### Categorias:
Adicione ou remova categorias no array `CATEGORIES` em cada página.

### Formatos de Exportação:
Implemente novos formatos de exportação em `/api/reports/export`.

---

## 📞 Suporte

Para dúvidas ou sugestões sobre as novas features, consulte:
- Documentação do Prisma: https://prisma.io/docs
- Documentação do Next.js: https://nextjs.org/docs
- Código-fonte das páginas em `/src/app/(protected)/`

---

**Data de Implementação**: 10/02/2026
**Versão**: 1.0.0
**Status**: ✅ Completo e Funcional
