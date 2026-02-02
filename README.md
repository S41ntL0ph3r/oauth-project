# 🔐 Sistema de Autenticação Moderno com Painel Admin

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748?style=for-the-badge&logo=prisma)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)

*Plataforma completa de autenticação com painel administrativo profissional*

[Recursos](#-recursos-principais) • [Admin Panel](#-painel-administrativo) • [Instalação](#-instalação) • [Deploy](#-deploy-no-vercel)

</div>

---

## 🎯 **Sobre o Projeto**

Sistema de **autenticação completo e moderno** com painel administrativo profissional. Construído com as melhores práticas de segurança, oferece gestão completa de usuários, produtos e logs de atividade.

### ✨ **Diferenciais do Sistema**
- 🔐 **Autenticação Híbrida** - OAuth (GitHub) + Credenciais locais
- �️ **Painel Admin Completo** - Gestão de usuários, produtos e permissões
- �📧 **Sistema de Email** - Verificação e recuperação via EmailJS
- 🔒 **Segurança Avançada** - JWT, bcrypt, rate limiting, XSS protection
- 🎨 **Interface Moderna** - Design responsivo com modo escuro/claro
- ⚡ **Performance Otimizada** - Next.js 15 App Router com TypeScript

---

## 🌟 **Recursos Principais**

### 👤 **Autenticação de Usuários**
- 🔑 **Login OAuth com GitHub** - Integração nativa e segura
- 📝 **Registro com credenciais** - Email e senha com validação
- ✅ **Verificação de email** - Links seguros via EmailJS
- 🔐 **Sessões JWT persistentes** - NextAuth v5 com Prisma
- � **Recuperação de senha** - Tokens temporários seguros

### 🛡️ **Painel Administrativo**
- 👥 **Gestão de Usuários** - CRUD completo com busca e filtros
- 🛍️ **Gestão de Produtos** - Cadastro, estoque, categorias e imagens
- 👨‍💼 **Gestão de Admins** - Controle de permissões (SUPER_ADMIN, ADMIN, EDITOR)
- 📊 **Dashboard com Métricas** - Gráficos e estatísticas em tempo real
- 📋 **Logs de Atividade** - Rastreamento completo de ações administrativas
- ⚙️ **Configurações** - Email, segurança, aparência e sistema
- 🔒 **Autenticação JWT** - Cookies HTTP-only seguros

### 👤 **Gerenciamento de Perfil**
- 🖼️ **Upload de avatar** - Imagens locais com otimização
- ✏️ **Edição de dados** - Nome, email e informações pessoais
- 🔑 **Alteração de senha** - Modal seguro com validação forte
- 🗑️ **Reset de avatar** - Voltar ao avatar padrão

### 🎨 **Experiência do Usuário**
- 🌙 **Modo escuro/claro** - Preferência salva localmente
- 📱 **Design responsivo** - Mobile-first approach
- ⚡ **Cache inteligente** - Service Worker para performance
- 🔔 **Feedbacks visuais** - Loading states e notificações
- ♿ **Acessibilidade** - Interface WCAG compliant

---

## 🔐 **Painel Administrativo**

### **Funcionalidades Admin:**

#### 📊 **Dashboard**
- Métricas em tempo real (usuários, produtos, admins)
- Gráficos de atividade com Recharts
- Logs recentes de ações administrativas
- Cards com estatísticas rápidas

#### 👥 **Gestão de Usuários**
- Listagem completa com paginação
- Busca por nome/email
- Filtros por status e data
- Ações: Editar, Suspender, Excluir
- Reset de senha administrativo
- Visualização de perfil completo

#### 🛍️ **Gestão de Produtos**
- CRUD completo de produtos
- Upload múltiplo de imagens
- Controle de estoque
- Categorização
- Status (Ativo, Inativo, Sem Estoque)
- Filtros avançados

#### 👨‍💼 **Gestão de Administradores**
- Criação de novos admins
- Controle de permissões por role
- Status: Ativo, Suspenso, Inativo
- Último login registrado
- Hierarquia de permissões

#### 📋 **Logs de Atividade**
- Registro de todas as ações admin
- Filtros por tipo de ação
- IP e User Agent tracking
- Exportação de dados
- Detalhes completos de cada ação

#### ⚙️ **Configurações**
- Configurações gerais do site
- Setup de email (SMTP)
- Segurança e autenticação
- Aparência e temas
- Notificações

### **Permissões de Acesso:**
- 🔴 **SUPER_ADMIN**: Acesso total ao sistema
- 🟡 **ADMIN**: Gestão de usuários e produtos
- 🟢 **EDITOR**: Apenas gestão de produtos

---

## 🚀 **URLs do Projeto**

### **Aplicação Principal:**
- **Homepage**: https://oauth-project-s41ntl0ph3r.vercel.app
- **Login**: https://oauth-project-s41ntl0ph3r.vercel.app/sign-in
- **Registro**: https://oauth-project-s41ntl0ph3r.vercel.app/sign-up

### **Painel Administrativo:**
- **Admin Login**: https://oauth-project-s41ntl0ph3r.vercel.app/admin/login
- **Setup Inicial**: https://oauth-project-s41ntl0ph3r.vercel.app/admin/setup
- **Dashboard**: https://oauth-project-s41ntl0ph3r.vercel.app/admin

---

## 🛠️ **Instalação**

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Git
- PostgreSQL (ou conta no Neon/PlanetScale)

### **Passo a passo**

```bash
# Clone o repositório
git clone https://github.com/S41ntL0ph3r/oauth-project.git
cd oauth-project

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
npx prisma db push

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

### **Variáveis de Ambiente Obrigatórias**
```env
# Autenticação
AUTH_SECRET="sua-chave-secreta-64-caracteres"
ADMIN_JWT_SECRET="chave-admin-diferente-64-caracteres"

# Banco de Dados
DATABASE_URL="postgresql://user:pass@host:5432/db"

# GitHub OAuth
AUTH_GITHUB_ID="seu-github-client-id"
AUTH_GITHUB_SECRET="seu-github-client-secret"

# URL Base
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 **Deploy no Vercel**

### **Configuração Rápida:**

1. **Conecte ao GitHub** e configure variáveis no Vercel:
```bash
AUTH_SECRET="sua-chave-super-secreta-64-caracteres"
ADMIN_JWT_SECRET="chave-admin-diferente-64-caracteres"
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
AUTH_GITHUB_ID="seu-github-oauth-id"
AUTH_GITHUB_SECRET="seu-github-oauth-secret"
NEXTAUTH_URL="https://seu-dominio.vercel.app"
```

2. **Configure GitHub OAuth:**
   - Callback URL: `https://seu-dominio.vercel.app/api/auth/callback/github`

3. **Acesse `/admin/setup`** para criar o primeiro administrador

### **Banco de Dados Recomendado:**
- **Neon**: https://neon.tech (PostgreSQL grátis)
- **PlanetScale**: https://planetscale.com (MySQL grátis)

---

## 🔧 **Tecnologias**

### **Frontend**
- **Next.js 15.5.9** - Framework React com App Router
- **TypeScript 5.9** - Tipagem estática
- **Tailwind CSS** - Estilização responsiva
- **Lucide React** - Ícones modernos
- **Recharts** - Gráficos e dashboards

### **Backend**
- **NextAuth v5** - Autenticação completa
- **Prisma 6.16.3** - ORM type-safe
- **PostgreSQL** - Banco de dados em produção
- **bcryptjs** - Hash de senhas (12 rounds)
- **jsonwebtoken** - JWT para admin panel

### **Segurança**
- **HTTP-only cookies** - Tokens seguros
- **Rate limiting** - Proteção contra brute force
- **XSS protection** - Headers de segurança
- **Input validation** - Sanitização de dados
- **Role-based access** - Controle de permissões

---

## 📁 **Estrutura do Projeto**

```
oauth-project/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (auth)/          # Páginas de autenticação
│   │   ├── 📁 (protected)/     # Páginas protegidas (usuários)
│   │   ├── 📁 admin/           # Painel administrativo
│   │   └── 📁 api/             # Rotas da API
│   ├── 📁 components/          # Componentes reutilizáveis
│   │   ├── 📁 admin/           # Componentes do admin
│   │   └── 📁 ui/              # Componentes de UI
│   ├── 📁 contexts/            # Contextos React
│   ├── 📁 hooks/               # Custom hooks
│   └── 📁 lib/                 # Utilitários e configurações
│       └── 📁 admin/           # Utilitários do admin
├── 📁 prisma/                  # Schema e migrações
└── 📁 public/                  # Arquivos estáticos
```
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

## � **Deploy no Vercel**

### **Configuração Rápida:**

1. **Conecte ao GitHub** e configure variáveis no Vercel:
```bash
AUTH_SECRET="sua-chave-super-secreta-64-caracteres"
ADMIN_JWT_SECRET="chave-admin-diferente-64-caracteres"
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
AUTH_GITHUB_ID="seu-github-oauth-id"
AUTH_GITHUB_SECRET="seu-github-oauth-secret"
NEXTAUTH_URL="https://seu-dominio.vercel.app"
```

2. **Configure GitHub OAuth:**
   - Callback URL: `https://seu-dominio.vercel.app/api/auth/callback/github`

3. **Acesse `/admin/setup`** para criar o primeiro administrador

### **Banco de Dados Recomendado:**
- **Neon**: https://neon.tech (PostgreSQL grátis)
- **PlanetScale**: https://planetscale.com (MySQL grátis)

---

## �📈 **Roadmap Futuro**

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
