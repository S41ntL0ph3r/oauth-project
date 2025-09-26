# 🔒 Guia de Segurança - OAuth Project

## ⚠️ Dados Sensíveis Protegidos

Este projeto está configurado para proteger automaticamente dados sensíveis. **NUNCA** committar:

### 🚫 Arquivos Proibidos no Git:
- Arquivos `.env*` (todas as variantes)
- Databases locais (*.db, *.sqlite)
- Uploads de usuários (/public/uploads/)
- Chaves e certificados (*.pem, *.key, *.crt)
- Logs que possam conter informações pessoais
- Configurações OAuth privadas
- Backups de dados

### ✅ Boas Práticas Implementadas:

#### 1. **Variáveis de Ambiente**
```bash
# ✅ Exemplo seguro (.env.local)
AUTH_SECRET="chave_super_segura_64_caracteres_minimum_required_2024"
AUTH_GITHUB_ID="seu_github_client_id_real"
AUTH_GITHUB_SECRET="seu_github_secret_real_nunca_compartilhar"
DATABASE_URL="postgresql://user:secure_pass@secure.host:5432/db"
```

#### 2. **Configuração no Vercel**
- Configure todas as variáveis diretamente no Vercel Dashboard
- Use diferentes valores para desenvolvimento/produção
- Habilite "Sensitive" para variáveis com secrets

#### 3. **Database Security**
- Use PostgreSQL em produção (nunca SQLite)
- Conexões sempre com SSL
- Rotacione passwords regularmente
- Use connection pooling

#### 4. **OAuth Security**
- URLs de callback específicas por ambiente
- Scopes mínimos necessários
- Valide tokens e sessões
- Expire sessões automaticamente

## 🛡️ Checklist de Segurança

### Antes de cada Deploy:
- [ ] Verificar que não há arquivos `.env` commitados
- [ ] Confirmar que databases locais estão no `.gitignore`
- [ ] Validar que uploads/avatars estão protegidos
- [ ] Testar que variáveis estão configuradas no Vercel
- [ ] Verificar logs não contêm dados sensíveis

### Configuração Inicial:
- [ ] Copiar `.env.example` para `.env.local`
- [ ] Configurar AUTH_SECRET com 64+ caracteres
- [ ] Configurar GitHub OAuth corretamente
- [ ] Testar autenticação em ambiente local
- [ ] Configurar todas as variáveis no Vercel

### Manutenção Regular:
- [ ] Rotacionar AUTH_SECRET a cada 6 meses
- [ ] Revisar e atualizar scopes OAuth
- [ ] Limpar uploads antigos/não utilizados
- [ ] Monitorar logs para atividades suspeitas
- [ ] Atualizar dependências de segurança

## 🚨 Em Caso de Exposição:

### Se você acidentalmente commitou dados sensíveis:

1. **Pare tudo imediatamente**
2. **Rotacione todas as chaves expostas**
3. **Use git filter-branch para limpar histórico:**
```bash
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch arquivo_sensivel.env' \
  --prune-empty --tag-name-filter cat -- --all
```
4. **Force push após limpeza:**
```bash
git push origin --force --all
```
5. **Notifique a equipe sobre o incidente**

## 📞 Contatos de Emergência

- **Admin do Projeto**: [Seu contato]
- **Vercel Support**: [Se necessário]
- **GitHub Security**: security@github.com

## 📚 Recursos Adicionais

- [OWASP Security Guide](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [GitHub Security Advisories](https://github.com/advisories)

---

**⚡ Lembre-se: A segurança é responsabilidade de todos!**
