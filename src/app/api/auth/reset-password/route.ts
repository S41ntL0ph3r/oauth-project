import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar se o token é válido
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Verificar se o token não foi usado
    if (resetToken.used) {
      return NextResponse.json(
        { error: "Este token já foi utilizado" },
        { status: 400 }
      );
    }

    // Verificar se o token não expirou
    if (resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token expirado. Solicite uma nova redefinição" },
        { status: 400 }
      );
    }

    // Verificar se o usuário ainda existe
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 12);

    // Atualizar a senha do usuário
    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Marcar o token como usado
    await db.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    // Invalidar todos os outros tokens para este email
    await db.passwordResetToken.updateMany({
      where: {
        email: resetToken.email,
        used: false,
        id: { not: resetToken.id },
      },
      data: { used: true },
    });

    return NextResponse.json({
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
