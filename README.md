# 🏦 Sistema de Gerenciamento Financeiro Pessoal

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.4.7-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

*Uma solução completa e moderna para controle de finanças pessoais*

[Demo](#-demonstração) • [Recursos](#-recursos) • [Instalação](#-instalação) • [Tecnologias](#-tecnologias) • [Contribuição](#-contribuição)

</div>

---

## 🎯 **Sobre o Projeto**

Este projeto nasceu da necessidade de ter um **controle financeiro intuitivo e poderoso**, desenvolvido com as tecnologias mais modernas do mercado. Mais do que apenas um gerenciador de gastos, é uma **experiência completa** que transforma a forma como você administra suas finanças pessoais.

### ✨ **Por que este projeto?**
- 🎨 **Interface moderna** e responsiva com modo escuro/claro
- 🔐 **Segurança em primeiro lugar** com autenticação robusta  
- 📊 **Inteligência financeira** com cálculos automáticos em tempo real
- 🚀 **Performance otimizada** com Next.js 15 e App Router
- 💡 **Experiência do usuário** pensada em cada detalhe

---

## 🌟 **Recursos Principais**

### 💰 **Dashboard Inteligente**
- 📈 **Saldo em tempo real** com cálculos automáticos
- 📋 **Feed de atividades** para rastrear todas as operações
- 🎯 **Visão consolidada** de receitas, despesas e pagamentos

### 💳 **Gestão de Transações**
- ➕ **Adicionar receitas/despesas** com categorização
- 🏷️ **Sistema de categorias** para organização
- 📅 **Controle por data** para análise temporal

### ⏰ **Agendamento de Pagamentos**
- 📅 **Agendar pagamentos** futuros
- 🔄 **Controle de status** (Pendente/Pago/Vencido)
- ⚠️ **Detecção automática** de pagamentos vencidos
- ✏️ **Edição completa** de pagamentos agendados

### 🔐 **Autenticação Segura**
- 🐙 **Login com GitHub** via OAuth
- 📧 **Credenciais locais** com verificação de email
- 🛡️ **Sessões JWT** seguras com NextAuth v5
- ✅ **Verificação de email** obrigatória

### 🎨 **Experiência Visual**
- 🌙 **Modo escuro/claro** com persistência
- 📱 **Design responsivo** para todos os dispositivos
- ⚡ **Transições suaves** e micro-interações
- 🎯 **Interface intuitiva** e acessível

---

## 🚀 **Demonstração**

### 📱 **Interface Principal**
```
🏠 Dashboard
├── 💰 Saldo Atual (cálculo automático)
├── 📊 Resumo Financeiro  
├── 📋 Últimas Atividades
└── 🔍 Visão Geral

💳 Transações
├── ➕ Adicionar Receita/Despesa
├── 🏷️ Categorização Automática
└── 📅 Filtros por Data

⏰ Pagamentos
├── 📅 Agendar Novos Pagamentos
├── ✏️ Editar Pagamentos Existentes
├── 🔄 Alterar Status (Pendente/Pago/Vencido)
└── ⚠️ Alertas de Vencimento
```

---

## 🛠️ **Instalação**

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Git

### **Passo a passo**

```bash
# Clone o repositório
git clone https://github.com/S41ntL0ph3r/oauth-project.git
cd oauth-project

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o .env.local com suas configurações

# Execute as migrações do banco
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev
```

### **Configuração OAuth GitHub**
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Crie uma nova OAuth App
3. Configure:
   - **Homepage URL:** `http://localhost:3000`
   - **Callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Adicione as credenciais no `.env.local`

---

## 🔧 **Tecnologias**

### **Frontend**
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática para maior segurança
- **Tailwind CSS** - Estilização moderna e responsiva
- **React Hooks** - Estado e efeitos otimizados

### **Backend**
- **NextAuth v5** - Autenticação completa e segura
- **Prisma ORM** - Banco de dados type-safe
- **SQLite** - Banco local para desenvolvimento
- **bcrypt** - Hash seguro de senhas

### **Experiência do Usuário**
- **Context API** - Gerenciamento de estado global
- **localStorage** - Persistência de preferências
- **Modais dinâmicos** - Interações intuitivas
- **Validação em tempo real** - Feedback imediato

---

## 📁 **Estrutura do Projeto**

```
oauth-project/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (auth)/          # Páginas de autenticação
│   │   ├── 📁 (protected)/     # Páginas protegidas
│   │   └── 📁 api/             # Rotas da API
│   ├── 📁 components/          # Componentes reutilizáveis
│   ├── 📁 contexts/            # Contextos React
│   └── 📁 lib/                 # Utilitários e configurações
├── 📁 prisma/                  # Schema e migrações
└── 📁 public/                  # Arquivos estáticos
```

---

## 🚀 **Scripts Disponíveis**

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção  
npm run start        # Servidor de produção
npm run lint         # Verificação de código
npm run type-check   # Verificação TypeScript
```

---

## 📈 **Roadmap Futuro**

- [ ] 📊 **Gráficos e relatórios** avançados
- [ ] 💾 **Exportação de dados** (CSV/PDF)
- [ ] 🔔 **Notificações push** para vencimentos
- [ ] 📱 **PWA** para instalação mobile
- [ ] 🌐 **Multi-idiomas** (i18n)
- [ ] 🏦 **Integração bancária** via Open Banking
- [ ] 🤖 **IA para categorização** automática
- [ ] 📱 **App mobile** nativo

---

## 🤝 **Contribuição**

Contribuições são sempre bem-vindas! Se você tem ideias para melhorar este projeto:

1. 🍴 Faça um fork do projeto
2. 🌟 Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔀 Abra um Pull Request

---

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 **Autor**

**Gabriel Moreira**
- GitHub: [@S41ntL0ph3r](https://github.com/S41ntL0ph3r)
- Email: allmightmoreira@gmail.com

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

*Desenvolvido para fins educacionais e com o foco de evoluir na prática como programador.*

</div>
