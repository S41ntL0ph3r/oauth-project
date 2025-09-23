# Configuração do Banco Neon PostgreSQL

## Passos para configurar:

1. **Criar conta no Neon**: https://console.neon.tech/signup
2. **Criar projeto**: 
   - Nome: `oauth-project`
   - Região: `US East (N. Virginia)`
3. **Copiar Connection String** do dashboard
4. **Configurar no Vercel**: 
   ```bash
   vercel env add DATABASE_URL
   ```
5. **Rodar migração**:
   ```bash
   npx prisma migrate deploy
   ```

## Connection String exemplo:
```
postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Após configurar:
- Os dados serão persistidos no PostgreSQL
- Upload de avatar funcionará completamente
- Todas as funcionalidades do NextAuth voltarão a funcionar
