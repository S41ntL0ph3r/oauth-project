# 🔐 OAuth Project — Auth & Protected Workspace

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.5.0-2D3748?style=for-the-badge&logo=prisma)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)

Plataforma moderna com autenticação, área protegida, analytics, segurança de sessão, backups e relatórios.

[Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Arquitetura](#-arquitetura) • [Deploy](#-deploy)

</div>

---

## 🎯 Sobre o projeto

Aplicação full-stack construída com foco em:

- qualidade de código
- organização modular
- escalabilidade
- privacidade e conformidade

O sistema combina autenticação segura com uma área protegida orientada à gestão e observabilidade da aplicação.

---

## 🌟 Funcionalidades

### 👤 Autenticação
- Login com OAuth e credenciais
- Fluxos de cadastro, login e recuperação de senha
- Sessões seguras e persistentes
- Controle de acesso para rotas protegidas

### 📊 Analytics e métricas
- Dashboard com indicadores e gráficos
- Métricas por período configurável
- Coleta estruturada de eventos analíticos

### 🔒 Segurança e sessões
- Histórico de sessões e eventos de segurança
- Revogação de sessões ativas
- Classificação de severidade para eventos

### 💾 Backups
- Criação e gestão de backups
- Suporte a diferentes estratégias de backup
- Fluxo de restauração controlado

### 📈 Relatórios
- Geração de relatórios exportáveis
- Múltiplos formatos de saída
- Processamento assíncrono

### 🎨 Experiência
- Interface responsiva
- Tema claro/escuro
- Componentização para consistência visual

---

## 🧱 Arquitetura

Estrutura principal (atual):

- `src/app` — rotas, páginas e handlers da aplicação
- `src/components` — componentes reutilizáveis
- `src/config` — configuração de aplicação e ambiente
- `src/server` — regras de servidor (auth, erros, http, repositórios)
- `src/services` — serviços de domínio e integrações
- `src/hooks` — hooks customizados
- `src/lib` — utilitários compartilhados
- `src/types` — tipos e contratos
- `prisma` — schema e migrations
- `docs` — documentação técnica complementar

---

## 🛠️ Instalação

### Pré-requisitos

- Node.js 20+
- npm 10+
- Banco PostgreSQL compatível com Prisma

### Passo a passo

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
# Linux/macOS
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

3. Aplique as migrations:

```bash
npx prisma migrate dev
```

4. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

---

## 🚀 Scripts disponíveis

- `npm run dev` — inicia em desenvolvimento
- `npm run build` — gera build de produção
- `npm run start` — executa o build
- `npm run lint` — validação estática
- `npm run type-check` — checagem de tipos
- `npm run postinstall` — geração do Prisma Client

---

## 🔐 Ambiente, segurança e conformidade

Use `.env.example` como referência e **nunca** versione segredos reais.

Variáveis essenciais:

- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `DATABASE_URL`

Práticas adotadas no projeto:

- separação de configuração por ambiente
- validação de entradas no backend
- rastreabilidade para auditoria técnica
- alinhamento com princípios de LGPD/GDPR

---

## 🚀 Deploy

O projeto está preparado para deploy em plataformas compatíveis com Next.js.

Checklist recomendado:

1. Configurar variáveis de ambiente seguras no provedor
2. Garantir banco de dados de produção com acesso restrito
3. Executar migrations no ambiente alvo
4. Validar autenticação e rotas protegidas após o deploy

Consulte os guias em `docs/` para detalhes operacionais.

---

## 📚 Documentação adicional

- `docs/QUICK_SETUP.md`
- `docs/SECURITY.md`
- `docs/LGPD_GDPR_COMPLIANCE.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/VERCEL_DEPLOY.md`

---

## ✍ **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## 👨‍💻 **Author**

**Gabriel Moreira**
- GitHub: [@S41ntL0ph3r](https://github.com/S41ntL0ph3r)
- Email: allmightmoreira@gmail.com

---

<div align="center">

**⭐ If this project helped you, consider giving it a star!**

*Developed for educational purposes and focused on improving programming skills in practice.*

</div>