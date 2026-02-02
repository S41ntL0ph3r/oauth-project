import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import db from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/emailjs";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    if (!user) {
      return NextResponse.json({
        message: "Se este email estiver cadastrado, você receberá um link de redefinição",
      });
    }

    // Verificar se o usuário tem senha (não é apenas OAuth)
    if (!user.password) {
      return NextResponse.json({
        message: "Esta conta utiliza login social (GitHub). Não é possível redefinir senha",
      }, { status: 400 });
    }

    // Invalidar tokens anteriores
    await db.passwordResetToken.updateMany({
      where: {
        email: email.toLowerCase(),
        used: false,
        expires: { gt: new Date() },
      },
      data: { used: true },
    });

    // SEGURANÇA: Gerar token e hashear antes de salvar
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    // Salvar hash do token no banco (não o token em si)
    await db.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token: tokenHash, // Salvamos o hash, não o token original
        expires,
      },
    });
    
    // Enviar o token original por email (não o hash)
    await sendPasswordResetEmail(email, rawToken);

    return NextResponse.json({
      message: "Se este email estiver cadastrado, você receberá um link de redefinição",
    });
  } catch (error) {
    console.error("Erro ao processar solicitação de redefinição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
