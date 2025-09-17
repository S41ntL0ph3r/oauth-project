import { NextResponse } from "next/server";
import db from "@/lib/db";
import { schema } from "@/lib/schema";
import { sendVerificationEmail } from "@/lib/emailjs";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = schema.parse(body);

    // check existing
    const exists = await db.user.findUnique({ where: { email: validated.email } });
    if (exists) return NextResponse.json({ error: "Usuário já existe" }, { status: 409 });

    // hash password (12 rounds para melhor segurança)
    const hashedPassword = await hash(validated.password, 12);

    // create user with hashed password
    await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.email.split('@')[0], // Nome padrão baseado no email
      },
    });

    // create verification token (mais seguro que código numérico)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await db.verificationToken.create({ 
      data: { 
        identifier: validated.email, 
        token, 
        expires 
      } 
    });

    // send email usando EmailJS
    const emailSent = await sendVerificationEmail(validated.email, token);
    
    if (!emailSent) {
      // Se falhar o envio do email, ainda permitir o registro mas avisar
      console.warn('Falha ao enviar email de verificação para:', validated.email);
      return NextResponse.json({ 
        ok: true, 
        warning: "Conta criada, mas houve problema no envio do email. Tente fazer login ou contacte o suporte." 
      });
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Conta criada com sucesso! Verifique seu email para ativar a conta." 
    });
  } catch (err: unknown) {
    console.error('Erro no registro:', err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Erro interno do servidor" 
    }, { status: 500 });
  }
}
