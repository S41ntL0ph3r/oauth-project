# 🔐 Sistema de Autenticação Moderno com Next.js

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.4.7-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![EmailJS](https://img.shields.io/badge/EmailJS-Service-orange?style=for-the-badge)

*Uma plataforma completa de autenticação com recuperação de senha e verificação de email*

[Recursos](#-recursos-principais) • [Instalação](#-instalação) • [Tecnologias](#-tecnologias) • [Contribuição](#-contribuição)

</div>

---

## 🎯 **Sobre o Projeto**

Este é um **sistema de autenticação robusto e moderno**, construído com as melhores práticas de segurança e experiência do usuário. O projeto oferece uma base sólida para aplicações que precisam de autenticação segura, recuperação de senha e gerenciamento de perfil de usuário.

### ✨ **Diferenciais do Sistema**
- 🔐 **Autenticação Híbrida** - OAuth (GitHub) + Credenciais locais
- 📧 **Sistema de Email Completo** - Verificação e recuperação via EmailJS
- �️ **Segurança Avançada** - Hash bcrypt, tokens seguros, sessões JWT
- 🎨 **Interface Moderna** - Design responsivo com modo escuro/claro
- ⚡ **Performance Otimizada** - Next.js 15 App Router com TypeScript

---

## 🌟 **Recursos Principais**

### � **Sistema de Autenticação Completo**
- � **Login OAuth com GitHub** - Integração nativa e segura
- � **Registro com credenciais** - Email e senha com validação
- ✅ **Verificação de email obrigatória** - Links seguros via EmailJS
- � **Sessões JWT persistentes** - NextAuth v5 com Prisma

### 🛡️ **Recuperação de Senha Segura**
- � **Envio automático de emails** - Sistema EmailJS integrado
- � **Tokens únicos temporários** - Expiração automática em 24h
- � **Hash seguro de senhas** - bcrypt com 12 rounds
- ✨ **Interface intuitiva** - Formulários responsivos e acessíveis

### � **Gerenciamento de Perfil**
- �️ **Upload de avatar** - Imagens locais com redimensionamento
- ✏️ **Edição de dados pessoais** - Nome, email e informações
- � **Alteração de senha** - Modal seguro com validação
- 🗑️ **Reset de avatar** - Voltar ao avatar padrão

### 🎨 **Experiência do Usuário**
- 🌙 **Modo escuro/claro** - Preferência salva localmente
- 📱 **Design totalmente responsivo** - Mobile-first
- ⚡ **Cache inteligente** - Service Worker para performance
- 🔔 **Feedbacks visuais** - Estados de carregamento e sucesso
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
