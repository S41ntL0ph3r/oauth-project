# Templates EmailJS - Configuração

## Template 1: Reset de Senha (NEXT_PUBLIC_EMAILJS_TEMPLATE_RESET_PASSWORD)

### Assunto:
```
{{subject}}
```

### Corpo do Email (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redefinição de Senha</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{app_name}}</h1>
            <p>Redefinição de Senha</p>
        </div>
        
        <div class="content">
            <h2>Olá, {{user_name}}!</h2>
            
            <p>{{message}}</p>
            
            <p>Para redefinir sua senha, clique no botão abaixo:</p>
            
            <a href="{{reset_link}}" class="button">Redefinir Senha</a>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="background: #eee; padding: 10px; word-break: break-all;">{{reset_link}}</p>
            
            <p><strong>⏰ Este link expira em 1 hora.</strong></p>
            
            <p>Se você não solicitou esta redefinição, ignore este email. Sua senha não será alterada.</p>
        </div>
        
        <div class="footer">
            <p>{{from_name}}</p>
            <p>Dúvidas? Entre em contato: {{support_email}}</p>
        </div>
    </div>
</body>
</html>
```

### Variáveis do Template:
- `{{to_email}}` - Email do destinatário
- `{{user_name}}` - Nome do usuário
- `{{subject}}` - Assunto do email
- `{{message}}` - Mensagem principal
- `{{reset_link}}` - Link para redefinir senha
- `{{app_name}}` - Nome da aplicação
- `{{from_name}}` - Nome do remetente
- `{{support_email}}` - Email de suporte

---

## Template 2: Verificação de Email (NEXT_PUBLIC_EMAILJS_TEMPLATE_VERIFY_EMAIL)

### Assunto:
```
{{subject}}
```

### Corpo do Email (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirme seu Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .welcome { background: #E0F2FE; border-left: 4px solid #0EA5E9; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{app_name}}</h1>
            <p>🎉 Bem-vindo!</p>
        </div>
        
        <div class="content">
            <h2>Olá, {{user_name}}!</h2>
            
            <div class="welcome">
                <h3>{{welcome_message}}</h3>
            </div>
            
            <p>{{message}}</p>
            
            <p>Para ativar sua conta e começar a usar nossa plataforma, clique no botão abaixo:</p>
            
            <a href="{{verification_link}}" class="button">Confirmar Email</a>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="background: #eee; padding: 10px; word-break: break-all;">{{verification_link}}</p>
            
            <p><strong>⏰ Este link expira em 24 horas.</strong></p>
            
            <p>Se você não se cadastrou em nossa plataforma, ignore este email.</p>
        </div>
        
        <div class="footer">
            <p>{{from_name}}</p>
            <p>Precisa de ajuda? Estamos aqui para você!</p>
        </div>
    </div>
</body>
</html>
```

### Variáveis do Template:
- `{{to_email}}` - Email do destinatário
- `{{user_name}}` - Nome do usuário
- `{{subject}}` - Assunto do email
- `{{message}}` - Mensagem principal
- `{{verification_link}}` - Link para verificar email
- `{{app_name}}` - Nome da aplicação
- `{{from_name}}` - Nome do remetente
- `{{welcome_message}}` - Mensagem de boas-vindas

---

## Como usar estes templates no EmailJS:

1. **Acesse o painel do EmailJS**
2. **Vá em "Email Templates"**
3. **Crie um novo template para "Reset de Senha":**
<div
  style="
    font-family: system-ui, sans-serif, Arial;
    font-size: 14px;
    color: #333;
    padding: 20px 14px;
    background-color: #f5f5f5;
  "
>
  <div style="max-width: 600px; margin: auto; background-color: #fff">
    <div style="text-align: center; background-color: #333; padding: 14px">
      <a style="text-decoration: none; outline: none" href="[Website Link]" target="_blank">
        <img
          style="height: 32px; vertical-align: middle"
          height="32px"
          src="cid:logo.png"
          alt="logo"
        />
      </a>
    </div>
    <div style="padding: 14px">
      <h1 style="font-size: 22px; margin-bottom: 26px">You have requested a password change</h1>
      <p>
        We received a request to reset the password for your account. To proceed, please click the
        link below to create a new password:
      </p>
      <p>
        <a href="{{link}}">{{link}}</a>
      </p>
      <p>This link will expire in one hour.</p>
      <p>
        If you didn't request this password reset, please ignore this email or let us know
        immediately. Your account remains secure.
      </p>
      <p>Best regards,<br />[Company Name] Team</p>
    </div>
  </div>
  <div style="max-width: 600px; margin: auto">
    <p style="color: #999">
      The email was sent to {{email}}<br />
      You received this email because you are registered with [Company Name]
    </p>
  </div>
</div>


4. **Crie outro template para "Verificação de Email":**
   <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
  <div style="max-width: 600px; margin: auto; padding: 16px">
    <a style="text-decoration: none; outline: none" href="[Website Link]" target="_blank">
      <img
        style="height: 32px; vertical-align: middle"
        height="32px"
        src="cid:logo.png"
        alt="logo"
      />
    </a>
    <p>Welcome to the [Company Name] family! We're excited to have you on board.</p>
    <p>
      Your account has been successfully created, and you're now ready to explore all the great
      features we offer.
    </p>
    <p>
      <a
        style="
          display: inline-block;
          text-decoration: none;
          outline: none;
          color: #fff;
          background-color: #fc0038;
          padding: 8px 16px;
          border-radius: 4px;
        "
        href="[Website Link]"
        target="_blank"
      >
        Open [Company Name]
      </a>
    </p>
    <p>
      If you have any questions or need help getting started, our support team is just an email away
      at
      <a href="mailto:[Company Email]" style="text-decoration: none; outline: none; color: #fc0038"
        >[Company Email]</a
      >. We're here to assist you every step of the way!
    </p>
    <p>Best regards,<br />The [Company Name] Team</p>
  </div>
</div>


5. **Adicione as variáveis de ambiente no seu .env:**
   ```
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_m38ethm
   NEXT_PUBLIC_EMAILJS_TEMPLATE_RESET_PASSWORD=template_bgz14ch
   NEXT_PUBLIC_EMAILJS_TEMPLATE_VERIFY_EMAIL=template_ijxj96k
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=8vokCxn1o2hUaTh0q
   ```

6. **Teste os templates** usando a interface na página de configurações

## Dicas:
- Use cores diferentes para cada tipo de email (azul para reset, verde para verificação)
- Mantenha as variáveis exatamente como mostrado (com `{{}}`)
- Teste sempre antes de usar em produção
- Configure limites de envio no EmailJS para evitar spam
