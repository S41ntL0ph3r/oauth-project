import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { userRepository } from '@/server/repositories/user-repository';
import { emailService } from '@/services/email/emailService';
import { withApiHandler } from '@/server/http/route';

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      return {
        message: "If this email is registered, you will receive a reset link",
      };
    }

    if (!user.password) {
      return NextResponse.json({
        message: "Esta conta utiliza login social (GitHub). Não é possível redefinir senha",
      }, { status: 400 });
    }

    await userRepository.invalidateActivePasswordResetTokens(email);

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 3600000);

    await userRepository.createPasswordResetToken({
      email,
      token: tokenHash,
      expires,
    });

    await emailService.sendPasswordResetEmail(email, rawToken);

    return {
      message: "Se este email estiver cadastrado, você receberá um link de redefinição",
    };
  });
}
